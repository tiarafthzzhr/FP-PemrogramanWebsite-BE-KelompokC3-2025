import { prisma } from "../../../../common/config/prisma.config";
import type { PuzzleGameJson } from "../../../../common/interface/games/puzzle.interface";
import { FileManager } from "../../../../utils";

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
  if (!game) throw new Error("Puzzle not found");

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
    throw new Error("Session not found or unauthorized");
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