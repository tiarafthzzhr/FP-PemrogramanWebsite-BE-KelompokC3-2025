import { Request, Response } from "express";
import * as PuzzleService from "./puzzle.service";

export const getPuzzleList = async (req: Request, res: Response) => {
  const data = await PuzzleService.getPuzzleList();
  res.json({ success: true, data });
};

export const getPuzzleById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await PuzzleService.getPuzzleById(id);
  res.json({ success: true, data });
};

export const submitAnswer = async (req: Request, res: Response) => {
  const { puzzleId, answer } = req.body;

  const result = await PuzzleService.checkAnswer(puzzleId, answer);
  res.json({ success: true, ...result });
};
