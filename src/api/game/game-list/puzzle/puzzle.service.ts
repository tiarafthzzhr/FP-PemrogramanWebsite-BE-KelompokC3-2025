import { prisma } from "../../../../common/config/prisma.config";

export const getPuzzleList = async () => {
  return prisma.puzzle.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      thumbnail: true,
      imageUrl: true,
      rows: true,
      cols: true,
      difficulty: true,
      _count: { select: { sessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getPuzzleById = async (id: string) => {
  return prisma.puzzle.findUnique({
    where: { id },
  });
};

export const startPuzzleSession = async (userId: string, puzzleId: string) => {
  const puzzle = await getPuzzleById(puzzleId);
  if (!puzzle) throw new Error("Puzzle not found");

  const session = await prisma.puzzleSession.create({
    data: {
      userId,
      puzzleId,
    },
  });

  return {
    puzzle: {
      ...puzzle,
      totalPieces: puzzle.rows * puzzle.cols,
    },
    sessionId: session.id,
  };
};

export const finishPuzzleSession = async ({
  userId,
  puzzleId,
  durationSec,
  moveCount = 0,
}: {
  userId: string;
  puzzleId: string;
  durationSec: number;
  moveCount?: number;
}) => {
  return prisma.puzzleSession.updateMany({
    where: {
      userId,
      puzzleId,
      finishedAt: null,
    },
    data: {
      durationSec,
      moveCount,
      finishedAt: new Date(),
    },
  }).then(() => prisma.puzzleSession.findFirst({
    where: { userId, puzzleId, finishedAt: { not: null } },
    orderBy: { finishedAt: "desc" },
    include: { puzzle: { select: { title: true, thumbnail: true } } },
  }));
};

export const getUserHistory = async (userId: string) => {
  return prisma.puzzleSession.findMany({
    where: { userId, finishedAt: { not: null } },
    include: {
      puzzle: {
        select: { id: true, title: true, thumbnail: true, rows: true, cols: true },
      },
    },
    orderBy: { finishedAt: "desc" },
  });
};

export const getLeaderboard = async (puzzleId: string) => {
  return prisma.puzzleSession.findMany({
    where: { puzzleId, finishedAt: { not: null } },
    include: {
      user: { select: { name: true, profilePicture: true } },
    },
    orderBy: [
      { durationSec: "asc" },
      { moveCount: "asc" },
      { finishedAt: "asc" },
    ],
    take: 50,
  });
};