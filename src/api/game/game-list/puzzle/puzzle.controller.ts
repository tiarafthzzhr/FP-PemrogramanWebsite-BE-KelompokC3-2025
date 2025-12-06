import { Request, Response } from "express";
import * as PuzzleService from "./puzzle.service";
import { finishPuzzleSchema } from "./puzzle.schema";

export const getPuzzleList = async (req: Request, res: Response) => {
  const data = await PuzzleService.getPuzzleList();
  res.json({ success: true, data });
};

export const getPuzzleById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await PuzzleService.getPuzzleById(id);
  if (!data) return res.status(404).json({ success: false, message: "Puzzle not found" });
  res.json({ success: true, data });
};

// BARU: mulai main puzzle
export const startPuzzle = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { id } = req.params;

  const result = await PuzzleService.startPuzzleSession(userId, id);
  res.json({ success: true, data: result });
};

// BARU: selesai puzzle
export const finishPuzzle = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const payload = finishPuzzleSchema.parse(req.body);

  const session = await PuzzleService.finishPuzzleSession({
    userId,
    puzzleId: payload.puzzleId,
    durationSec: payload.durationSec,
    moveCount: payload.moveCount,
  });

  res.json({ success: true, data: { session } });
};

export const getHistory = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const history = await PuzzleService.getUserHistory(userId);
  res.json({ success: true, data: history });
};

export const getLeaderboard = async (req: Request, res: Response) => {
  const { id } = req.params;
  const leaderboard = await PuzzleService.getLeaderboard(id);
  res.json({ success: true, data: leaderboard });
};
