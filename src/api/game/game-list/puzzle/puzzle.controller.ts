import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import type { AuthedRequest } from "../../../../common/interface";
import { NextFunction } from "express";
import * as PuzzleService from "./puzzle.service";
import { SuccessResponse } from "../../../../common/response";
import { finishPuzzleSchema } from "./schema";

export const getPuzzleList = async (_: Request, res: Response) => {
  const data = await PuzzleService.getPuzzleList();
  const response = new SuccessResponse(StatusCodes.OK, "Puzzle list retrieved", data);
  res.status(response.statusCode).json(response.json());
};

export const getPuzzleById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const game = await PuzzleService.getPuzzleById(id);
  if (!game) {
    const response = new SuccessResponse(StatusCodes.NOT_FOUND, "Puzzle not found");
    return res.status(response.statusCode).json(response.json());
  }
  const response = new SuccessResponse(StatusCodes.OK, "Puzzle retrieved", game);
  res.status(response.statusCode).json(response.json());
};

export const startPuzzle = async (req: AuthedRequest, res: Response) => {
  const userId = req.user?.user_id ?? "anonymous";
  const { id } = req.params;

  const result = await PuzzleService.startPuzzle(userId, id);
  const response = new SuccessResponse(StatusCodes.CREATED, "Puzzle session started", result);
  res.status(response.statusCode).json(response.json());
};

export const finishPuzzle = async (req: AuthedRequest, res: Response) => {
  const userId = req.user?.user_id ?? "anonymous";
  const payload = finishPuzzleSchema.parse(req.body); 

  const result = await PuzzleService.finishPuzzle(userId, payload);
  const response = new SuccessResponse(StatusCodes.OK, "Puzzle completed successfully", result);
  res.status(response.statusCode).json(response.json());
};

export const uploadPuzzleImage = async (req: AuthedRequest, res: Response) => {
  const userId = req.user?.user_id ?? "anonymous";
  const file = req.file;
  
  if (!file) {
    const response = new SuccessResponse(StatusCodes.BAD_REQUEST, "No file provided");
    return res.status(response.statusCode).json(response.json());
  }

  const result = await PuzzleService.uploadPuzzleImage(userId, new File([new Uint8Array(file.buffer)], file.originalname, { type: file.mimetype }));
  const response = new SuccessResponse(StatusCodes.CREATED, "Image uploaded successfully", result);
  res.status(response.statusCode).json(response.json());
};

export const getPuzzleForEdit = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.user_id;
    const userRole = req.user!.role;
    const { id } = req.params;

    const game = await PuzzleService.getPuzzleForEdit(id, userId, userRole);
    res.json({ success: true, data: game });
  } catch (error) {
    next(error);
  }
};

export const createPuzzle = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.user_id;
  try {
    const result = await PuzzleService.createPuzzle(req.user!.user_id, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error); 
  }
};

export const updatePuzzle = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.user_id;
    const userRole = req.user!.role;
    const { id } = req.params;

    const result = await PuzzleService.updatePuzzle(id, req.body, userId, userRole);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const deletePuzzle = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.user_id;
    const userRole = req.user!.role;
    const { id } = req.params;

    await PuzzleService.deletePuzzle(id, userId, userRole);
    res.json({ success: true, message: "Puzzle berhasil dihapus" });
  } catch (error) {
    next(error);
  }
};