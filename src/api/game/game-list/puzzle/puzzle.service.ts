import { prisma } from "../../../../common/config/prisma.config";
import type { PuzzleGameJson } from "../../../../common/interface/games/puzzle.interface";
import { FileManager } from "../../../../utils";
import type { AuthedRequest } from "../../../../common/interface/request.type"; 
import { ErrorResponse } from "../../../../common/response/error.response";
import { StatusCodes } from "http-status-codes";
import type { ROLE } from "@prisma/client";

export const getPuzzleList = async () => {
  return prisma.games.findMany({
    where: { game_template: { slug: "puzzle" }, is_published: true },
    select: {
      id: true,
      name: true,
      description: true,
      thumbnail_image: true,
      game_json: true,
      total_played: true,
    },
    orderBy: { created_at: "desc" },
  });
};

export const getPuzzleById = async (gameId: string) => {
  return prisma.games.findUnique({
    where: { id: gameId, game_template: { slug: "puzzle" } },
  });
};

export const startPuzzle = async (userId: string, gameId: string) => {
  const game = await getPuzzleById(gameId);
  if (!game) throw new ErrorResponse(StatusCodes.NOT_FOUND,"Puzzle not found");

  // Increment play count
  await prisma.games.update({
    where: { id: gameId },
    data: { total_played: { increment: 1 } },
  });

  // Create a puzzle session
  const session = await prisma.puzzleSession.create({
    data: {
      userId,
      puzzleId: gameId,
      startedAt: new Date(),
    },
  });

  return {
    sessionId: session.id,
    gameId: game.id,
    gameJson: game.game_json as unknown as PuzzleGameJson,
  };
};

export const finishPuzzle = async (userId: string, payload: {
  sessionId: string;
  gameId: string;
  moveCount?: number;
}) => {
  // Get the session and verify ownership
  const session = await prisma.puzzleSession.findUnique({
    where: { id: payload.sessionId },
  });

  if (!session || session.userId !== userId) {
    throw new ErrorResponse(StatusCodes.NOT_FOUND,"Session not found or unauthorized");
  }

  // Calculate duration
  const finishedAt = new Date();
  const durationSec = Math.floor(
    (finishedAt.getTime() - session.startedAt.getTime()) / 1000
  );

  // Update session with finish data
  const updatedSession = await prisma.puzzleSession.update({
    where: { id: payload.sessionId },
    data: {
      finishedAt,
      durationSec,
      moveCount: payload.moveCount ?? session.moveCount,
    },
  });

  const game = await prisma.games.findUnique({
    where: { id: payload.gameId },
    select: { name: true, thumbnail_image: true },
  });

  return {
    message: "Puzzle completed!",
    sessionId: updatedSession.id,
    startedAt: updatedSession.startedAt,
    finishedAt: updatedSession.finishedAt,
    totalDuration: updatedSession.durationSec,
    moveCount: updatedSession.moveCount,
    game: {
      id: payload.gameId,
      title: game?.name,
      thumbnail: game?.thumbnail_image,
    },
  };
};

export const uploadPuzzleImage = async (userId: string, file: File) => {
  const imagePath = await FileManager.upload(
    `game/puzzle/${userId}`,
    file
  );
  return { imageUrl: imagePath };
};

// === CREATE PUZZLE ===
export const createPuzzle = async (
  userId: string,
  payload: {
    name: string;
    description?: string;
    imageUrl: string;
    thumbnail?: string;
    rows: number;
    cols: number;
    difficulty: "easy" | "medium" | "hard";
    is_published?: boolean;
  }
) => {
  const exists = await prisma.games.findFirst({
    where: { name: payload.name, game_template: { slug: "puzzle" } },
  });
  if (exists) throw new ErrorResponse(StatusCodes.BAD_REQUEST, "Nama puzzle sudah digunakan");

  const template = await prisma.gameTemplates.findUnique({ where: { slug: "puzzle" } });
  if (!template) throw new ErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR,"Template puzzle tidak ditemukan");

  const timeLimitSec = payload.difficulty === "easy" ? 300
                     : payload.difficulty === "medium" ? 600
                     : 900;

  const gameJson: PuzzleGameJson = {
    title: payload.name,
    description: payload.description ?? "",
    imageUrl: payload.imageUrl,
    thumbnail: payload.thumbnail || payload.imageUrl,
    rows: payload.rows,
    cols: payload.cols,
    difficulty: payload.difficulty,
    timeLimitSec, 
  };

  return prisma.games.create({
    data: {
      id: crypto.randomUUID(),
      name: payload.name,
      description: payload.description ?? "",
      thumbnail_image: payload.thumbnail || payload.imageUrl,
      game_template_id: template.id,
      creator_id: userId,
      is_published: payload.is_published ?? false,
      game_json: gameJson as any,
    },
  });
};

// === UPDATE PUZZLE ===
export const updatePuzzle = async (
  gameId: string,
  payload: Partial<{
    name: string;
    description: string;
    imageUrl: string;
    thumbnail: string;
    rows: number;
    cols: number;
    difficulty: "easy" | "medium" | "hard";
    is_published: boolean;
  }>,
  userId: string,
  userRole: ROLE
) => {
  const game = await getPuzzleById(gameId);
  if (!game) throw new ErrorResponse(StatusCodes.NOT_FOUND, "Puzzle tidak ditemukan");

  if (game.creator_id !== userId && userRole !== "SUPER_ADMIN") {
    throw new ErrorResponse(StatusCodes.FORBIDDEN, "Kamu tidak boleh edit puzzle ini");
  }

  const currentJson = game.game_json as unknown as PuzzleGameJson;

  if (payload.imageUrl && payload.imageUrl !== currentJson.imageUrl) {
    await FileManager.remove(currentJson.imageUrl).catch(() => {});
  }
  if (payload.thumbnail && payload.thumbnail !== currentJson.thumbnail && payload.thumbnail !== currentJson.imageUrl) {
    await FileManager.remove(currentJson.thumbnail!).catch(() => {});
  }

  const timeLimitSec = payload.difficulty
    ? payload.difficulty === "easy" ? 300
    : payload.difficulty === "medium" ? 600
    : 900
    : currentJson.timeLimitSec;

  const updatedJson: PuzzleGameJson = {
    title: payload.name ?? currentJson.title,
    description: payload.description ?? currentJson.description ?? "",
    imageUrl: payload.imageUrl ?? currentJson.imageUrl,
    thumbnail: payload.thumbnail ?? currentJson.thumbnail ?? currentJson.imageUrl,
    rows: payload.rows ?? currentJson.rows,
    cols: payload.cols ?? currentJson.cols,
    difficulty: payload.difficulty ?? currentJson.difficulty,
    timeLimitSec,
  };

  return prisma.games.update({
    where: { id: gameId },
    data: {
      name: payload.name ?? game.name,
      description: payload.description ?? game.description,
      thumbnail_image: payload.thumbnail ?? payload.imageUrl ?? game.thumbnail_image,
      is_published: payload.is_published ?? game.is_published,
      game_json: updatedJson as any,
    },
  });
};

// === DELETE PUZZLE ===
export const deletePuzzle = async (
  gameId: string,
  userId: string,
  userRole: ROLE
) => {
  const game = await getPuzzleById(gameId);
  if (!game) throw new ErrorResponse(StatusCodes.NOT_FOUND, "Puzzle tidak ditemukan");

  if (game.creator_id !== userId && userRole !== "SUPER_ADMIN") {
    throw new ErrorResponse(StatusCodes.FORBIDDEN, "Kamu tidak boleh hapus puzzle ini");
  }

  const json = game.game_json as unknown as PuzzleGameJson;

  await Promise.all([
    FileManager.remove(json.imageUrl).catch(() => {}),
    json.thumbnail && json.thumbnail !== json.imageUrl
      ? FileManager.remove(json.thumbnail).catch(() => {})
      : Promise.resolve(),
  ]);

  await prisma.games.delete({ where: { id: gameId } });
  return { message: "Puzzle dan gambar berhasil dihapus!" };
};

export const getPuzzleForEdit = async (
  gameId: string,
  userId: string,
  userRole: ROLE
) => {
  const game = await getPuzzleById(gameId);
  if (!game) throw new ErrorResponse(StatusCodes.NOT_FOUND, "Puzzle tidak ditemukan");
  return game;
};