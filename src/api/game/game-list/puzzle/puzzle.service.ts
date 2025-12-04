import { prisma } from "../../../../common/config/prisma.config";

export const getPuzzleList = () => {
  return prisma.puzzleGame.findMany();
};

export const getPuzzleById = (id: string) => {
  return prisma.puzzleGame.findUnique({ where: { id } });
};

export const checkAnswer = async (id: string, answer: string) => {
  const puzzle = await prisma.puzzleGame.findUnique({ where: { id } });

  if (!puzzle) return { correct: false, message: "Puzzle not found" };

  const correct = puzzle.answer.trim().toLowerCase() === answer.trim().toLowerCase();

  return {
    correct,
    message: correct ? "Correct answer!" : "Wrong answer!",
  };
};
