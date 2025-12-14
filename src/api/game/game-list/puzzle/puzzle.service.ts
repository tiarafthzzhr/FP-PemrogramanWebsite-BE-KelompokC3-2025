import { type Prisma, type ROLE } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { v4 } from 'uuid';

import { ErrorResponse, type IPuzzleJson, prisma } from '@/common';
import { FileManager } from '@/utils';

import {
  type ICreatePuzzle,
  type IFinishPuzzle,
  type IStartPuzzle,
  type IUpdatePuzzle,
} from './schema';

export abstract class PuzzleService {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private static PUZZLE_SLUG = 'puzzle';

  static async getPuzzleList(includeDrafts = false) {
    const whereClause: Prisma.GamesWhereInput = {
      game_template: { slug: this.PUZZLE_SLUG },
    };

    if (!includeDrafts) {
      whereClause.is_published = true;
    }

    const puzzles = await prisma.games.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail_image: true,
        game_json: true,
        total_played: true,
        created_at: true,
        is_published: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return puzzles.map(puzzle => {
      const gameJson = puzzle.game_json as any;

      return {
        ...puzzle,
        difficulty: gameJson?.difficulty || 'medium',
        rows: gameJson?.rows,
        cols: gameJson?.cols,
      };
    });
  }

  static async getPuzzleById(gameId: string) {
    const game = await prisma.games.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail_image: true,
        is_published: true,
        game_json: true,
        total_played: true,
        created_at: true,
        game_template: {
          select: { slug: true },
        },
      },
    });

    if (!game || game.game_template.slug !== this.PUZZLE_SLUG) {
      return null;
    }

    return {
      ...game,
      game_template: undefined,
    };
  }

  static async getPuzzleForEdit(
    gameId: string,
    userId: string,
    userRole: ROLE,
  ) {
    const game = await prisma.games.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail_image: true,
        is_published: true,
        game_json: true,
        creator_id: true,
        game_template: {
          select: { slug: true },
        },
      },
    });

    if (!game || game.game_template.slug !== this.PUZZLE_SLUG) {
      throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Puzzle not found');
    }

    if (userRole !== 'SUPER_ADMIN' && game.creator_id !== userId) {
      throw new ErrorResponse(
        StatusCodes.FORBIDDEN,
        'User cannot access this puzzle',
      );
    }

    return {
      ...game,
      creator_id: undefined,
      game_template: undefined,
    };
  }

  static async createPuzzle(userId: string, data: ICreatePuzzle) {
    await this.existGameCheck(data.name);

    const newPuzzleId = v4();
    const puzzleTemplateId = await this.getGameTemplateId();

    const thumbnailImagePath = await FileManager.upload(
      `game/puzzle/${newPuzzleId}`,
      data.thumbnail_image,
    );

    const imageArray: string[] = [];

    if (data.files_to_upload && data.files_to_upload.length > 0) {
      for (const file of data.files_to_upload) {
        const path = await FileManager.upload(
          `game/puzzle/${newPuzzleId}`,
          file,
        );
        imageArray.push(path);
      }
    }

    const puzzleImagePath = imageArray.length > 0 ? imageArray[0] : '';
    const timeLimitSec = this.getTimeLimitByDifficulty(data.difficulty);

    const puzzleJson: IPuzzleJson = {
      title: data.name,
      description: data.description ?? '',
      imageUrl: puzzleImagePath,
      images: imageArray,
      thumbnail: thumbnailImagePath,
      rows: data.rows,
      cols: data.cols,
      difficulty: data.difficulty,
      timeLimitSec,
    };

    const newGame = await prisma.games.create({
      data: {
        id: newPuzzleId,
        game_template_id: puzzleTemplateId,
        creator_id: userId,
        name: data.name,
        description: data.description ?? '',
        thumbnail_image: thumbnailImagePath,
        is_published: data.is_publish_immediately ?? false,
        game_json: puzzleJson as unknown as Prisma.InputJsonValue,
      },
      select: {
        id: true,
      },
    });

    return newGame;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async updatePuzzle(
    gameId: string,
    data: IUpdatePuzzle,
    _userId: string,
    _userRole: ROLE,
  ) {
    const game = await prisma.games.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail_image: true,
        is_published: true,
        game_json: true,
        creator_id: true,
        game_template: {
          select: { slug: true },
        },
      },
    });

    if (!game || game.game_template.slug !== this.PUZZLE_SLUG) {
      throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Puzzle not found');
    }

    // All ADMIN and SUPER_ADMIN can edit any puzzle
    // (Authorization already handled by controller middleware)

    if (data.name) {
      const isNameExist = await prisma.games.findUnique({
        where: { name: data.name },
        select: { id: true },
      });

      if (isNameExist && isNameExist.id !== gameId) {
        throw new ErrorResponse(
          StatusCodes.BAD_REQUEST,
          'Puzzle name is already used',
        );
      }
    }

    const oldPuzzleJson = game.game_json as IPuzzleJson | null;
    const oldImagePaths: string[] = [];

    if (oldPuzzleJson?.imageUrl) {
      oldImagePaths.push(oldPuzzleJson.imageUrl);
    }

    if (oldPuzzleJson?.images) {
      oldImagePaths.push(...oldPuzzleJson.images);
    }

    if (
      oldPuzzleJson?.thumbnail &&
      oldPuzzleJson.thumbnail !== oldPuzzleJson.imageUrl
    ) {
      oldImagePaths.push(oldPuzzleJson.thumbnail);
    }

    if (game.thumbnail_image && !oldImagePaths.includes(game.thumbnail_image)) {
      oldImagePaths.push(game.thumbnail_image);
    }

    let thumbnailImagePath = game.thumbnail_image;
    let puzzleImagePath = oldPuzzleJson?.imageUrl ?? '';
    let imageArray: string[] =
      oldPuzzleJson?.images ?? (puzzleImagePath ? [puzzleImagePath] : []);

    if (data.thumbnail_image) {
      thumbnailImagePath = await FileManager.upload(
        `game/puzzle/${gameId}`,
        data.thumbnail_image,
      );
    }

    if (data.files_to_upload && data.files_to_upload.length > 0) {
      // If new files are uploaded, replace the old images
      const newUploadedPaths: string[] = [];

      for (const file of data.files_to_upload) {
        const path = await FileManager.upload(`game/puzzle/${gameId}`, file);
        newUploadedPaths.push(path);
      }

      imageArray = newUploadedPaths;
      puzzleImagePath = imageArray[0];
    }

    const difficulty = data.difficulty ?? oldPuzzleJson?.difficulty ?? 'medium';
    const timeLimitSec = this.getTimeLimitByDifficulty(difficulty);

    const puzzleJson: IPuzzleJson = {
      title: data.name ?? oldPuzzleJson?.title ?? game.name,
      description: data.description ?? oldPuzzleJson?.description ?? '',
      imageUrl: puzzleImagePath,
      images: imageArray,
      thumbnail: thumbnailImagePath,
      rows: data.rows ?? oldPuzzleJson?.rows ?? 3,
      cols: data.cols ?? oldPuzzleJson?.cols ?? 3,
      difficulty,
      timeLimitSec,
    };

    const updatedGame = await prisma.games.update({
      where: { id: gameId },
      data: {
        name: data.name,
        description: data.description,
        thumbnail_image: thumbnailImagePath,
        is_published: data.is_publish,
        game_json: puzzleJson as unknown as Prisma.InputJsonValue,
      },
      select: {
        id: true,
      },
    });

    // Clean up old images that are no longer used
    const newImagePaths = new Set([thumbnailImagePath, ...imageArray]);

    for (const oldPath of oldImagePaths) {
      if (!newImagePaths.has(oldPath)) {
        await FileManager.remove(oldPath);
      }
    }

    return updatedGame;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async deletePuzzle(gameId: string, _userId: string, _userRole: ROLE) {
    const game = await prisma.games.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        thumbnail_image: true,
        game_json: true,
        creator_id: true,
      },
    });

    if (!game) {
      throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Puzzle not found');
    }

    // All ADMIN and SUPER_ADMIN can delete any puzzle
    // (Authorization already handled by controller middleware)

    const oldPuzzleJson = game.game_json as IPuzzleJson | null;
    const oldImagePaths: string[] = [];

    if (oldPuzzleJson?.imageUrl) {
      oldImagePaths.push(oldPuzzleJson.imageUrl);
    }

    if (
      oldPuzzleJson?.thumbnail &&
      oldPuzzleJson.thumbnail !== oldPuzzleJson.imageUrl
    ) {
      oldImagePaths.push(oldPuzzleJson.thumbnail);
    }

    if (game.thumbnail_image && !oldImagePaths.includes(game.thumbnail_image)) {
      oldImagePaths.push(game.thumbnail_image);
    }

    for (const path of oldImagePaths) {
      await FileManager.remove(path);
    }

    await prisma.games.delete({ where: { id: gameId } });

    return { id: gameId };
  }

  static async startPuzzle(userId: string, data: IStartPuzzle) {
    const game = await prisma.games.findUnique({
      where: { id: data.gameId },
      select: {
        id: true,
        name: true,
        is_published: true,
        game_json: true,
        game_template: {
          select: { slug: true },
        },
      },
    });

    if (!game || game.game_template.slug !== this.PUZZLE_SLUG) {
      throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Puzzle not found');
    }

    if (!game.is_published) {
      throw new ErrorResponse(StatusCodes.FORBIDDEN, 'Puzzle is not published');
    }

    // Increment play count
    await prisma.games.update({
      where: { id: data.gameId },
      data: { total_played: { increment: 1 } },
    });

    // Generate a session ID for tracking (stored client-side)
    const sessionId = v4();
    const startedAt = new Date();

    const gameJson = game.game_json as unknown as IPuzzleJson;
    const difficulty = data.difficulty ?? 'easy';
    const rows = this.getRowsByDifficulty(difficulty);
    const cols = rows;
    const timeLimitSec = this.getTimeLimitByDifficulty(difficulty);

    // Use the original image URL stored in the database
    // The puzzle will be sliced dynamically based on difficulty (rows/cols)
    const imageUrl = gameJson.imageUrl ?? '';

    const modifiedGameJson: IPuzzleJson = {
      ...gameJson,
      imageUrl,
      difficulty,
      rows,
      cols,
      timeLimitSec,
    };

    return {
      sessionId,
      gameId: game.id,
      gameName: game.name,
      startedAt,
      gameJson: modifiedGameJson,
    };
  }

  static async finishPuzzle(userId: string, data: IFinishPuzzle) {
    const game = await prisma.games.findUnique({
      where: { id: data.gameId },
      select: {
        id: true,
        name: true,
        thumbnail_image: true,
        game_json: true,
        game_template: {
          select: { slug: true },
        },
      },
    });

    if (!game || game.game_template.slug !== this.PUZZLE_SLUG) {
      throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Puzzle not found');
    }

    const puzzleJson = game.game_json as unknown as IPuzzleJson;
    const finishedAt = new Date();

    // Calculate score based on time and moves
    // Lower time and fewer moves = higher score
    const baseScore = 1000;
    const timePenalty = Math.min(data.timeTaken ?? 0, puzzleJson.timeLimitSec);
    const movePenalty = (data.moveCount ?? 0) * 2;
    const score = Math.max(baseScore - timePenalty - movePenalty, 100);

    // Save to leaderboard if user is authenticated
    if (userId !== 'anonymous') {
      await prisma.leaderboard.create({
        data: {
          user_id: userId,
          game_id: data.gameId,
          score,
          difficulty: puzzleJson.difficulty,
          time_taken: data.timeTaken,
        },
      });

      // Update user's total game played
      await prisma.users.update({
        where: { id: userId },
        data: { total_game_played: { increment: 1 } },
      });
    }

    return {
      message: 'Puzzle completed!',
      sessionId: data.sessionId,
      finishedAt,
      timeTaken: data.timeTaken,
      moveCount: data.moveCount,
      score,
      game: {
        id: game.id,
        title: game.name,
        thumbnail: game.thumbnail_image,
      },
    };
  }

  static async uploadPuzzleImage(userId: string, file: File) {
    const imagePath = await FileManager.upload(`game/puzzle/${userId}`, file);

    return { imageUrl: imagePath };
  }

  static async getLeaderboard(gameId: string, limit = 10) {
    const leaderboard = await prisma.leaderboard.findMany({
      where: { game_id: gameId },
      select: {
        id: true,
        score: true,
        difficulty: true,
        time_taken: true,
        created_at: true,
        user: {
          select: {
            id: true,
            username: true,
            profile_picture: true,
          },
        },
      },
      orderBy: { score: 'desc' },
      take: limit,
    });

    return leaderboard;
  }

  private static getTimeLimitByDifficulty(
    difficulty: 'easy' | 'medium' | 'hard',
  ): number {
    switch (difficulty) {
      case 'easy': {
        return 300;
      } // 5 minutes

      case 'medium': {
        return 600;
      } // 10 minutes

      case 'hard': {
        return 900;
      } // 15 minutes

      default: {
        return 600;
      }
    }
  }

  private static getRowsByDifficulty(
    difficulty: 'easy' | 'medium' | 'hard',
  ): number {
    switch (difficulty) {
      case 'easy': {
        return 3;
      }

      case 'medium': {
        return 4;
      }

      case 'hard': {
        return 5;
      }

      default: {
        return 3;
      }
    }
  }

  private static async existGameCheck(gameName?: string) {
    if (!gameName) return null;

    const game = await prisma.games.findFirst({
      where: {
        name: gameName,
        game_template: { slug: this.PUZZLE_SLUG },
      },
      select: { id: true },
    });

    if (game) {
      throw new ErrorResponse(
        StatusCodes.BAD_REQUEST,
        'Puzzle name is already exist',
      );
    }

    return game;
  }

  private static async getGameTemplateId() {
    const result = await prisma.gameTemplates.findUnique({
      where: { slug: this.PUZZLE_SLUG },
      select: { id: true },
    });

    if (!result) {
      throw new ErrorResponse(
        StatusCodes.NOT_FOUND,
        'Puzzle template not found',
      );
    }

    return result.id;
  }
}
