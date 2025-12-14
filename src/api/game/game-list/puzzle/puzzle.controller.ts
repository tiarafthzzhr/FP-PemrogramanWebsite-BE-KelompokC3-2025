import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from 'express';
import { StatusCodes } from 'http-status-codes';
import multer from 'multer';

import {
  type AuthedRequest,
  SuccessResponse,
  validateAuth,
  validateBody,
} from '@/common';

import { PuzzleService } from './puzzle.service';
import {
  CreatePuzzleSchema,
  FinishPuzzleSchema,
  type ICreatePuzzle,
  type IFinishPuzzle,
  type IStartPuzzle,
  type IUpdatePuzzle,
  StartPuzzleSchema,
  UpdatePuzzleSchema,
} from './schema';

const upload = multer({ storage: multer.memoryStorage() });

export const PuzzleController = Router()
  // Get all puzzles (public)
  .get(
    '/',
    validateAuth({ optional: true }),
    async (request: AuthedRequest, response: Response, next: NextFunction) => {
      try {
        const isEditor =
          request.user?.role === 'ADMIN' ||
          request.user?.role === 'SUPER_ADMIN';
        const data = await PuzzleService.getPuzzleList(isEditor);
        const result = new SuccessResponse(
          StatusCodes.OK,
          'Puzzle list retrieved',
          data,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        next(error);
      }
    },
  )
  // Get puzzle by ID
  .get(
    '/:game_id',
    validateAuth({ optional: true }),
    async (
      request: Request<{ game_id: string }>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const game = await PuzzleService.getPuzzleById(request.params.game_id);

        if (!game) {
          const result = new SuccessResponse(
            StatusCodes.NOT_FOUND,
            'Puzzle not found',
          );

          return response.status(result.statusCode).json(result.json());
        }

        const result = new SuccessResponse(
          StatusCodes.OK,
          'Puzzle retrieved',
          game,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        next(error);
      }
    },
  )
  // Get puzzle leaderboard
  .get(
    '/:game_id/leaderboard',
    async (
      request: Request<{ game_id: string }>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const leaderboard = await PuzzleService.getLeaderboard(
          request.params.game_id,
        );
        const result = new SuccessResponse(
          StatusCodes.OK,
          'Leaderboard retrieved',
          leaderboard,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        next(error);
      }
    },
  )
  // Get puzzle detail for editing (admin only)
  .get(
    '/:game_id/edit',
    validateAuth({ allowed_roles: ['ADMIN', 'SUPER_ADMIN'] }),
    async (
      request: AuthedRequest<{ game_id: string }>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const game = await PuzzleService.getPuzzleForEdit(
          request.params.game_id,
          request.user!.user_id,
          request.user!.role,
        );
        const result = new SuccessResponse(
          StatusCodes.OK,
          'Puzzle retrieved for edit',
          game,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        next(error);
      }
    },
  )
  // Start puzzle session
  .post(
    '/:game_id/start',
    validateAuth({ optional: true }),
    async (
      request: AuthedRequest<
        { game_id: string },
        {},
        { difficulty?: 'easy' | 'medium' | 'hard' }
      >,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const userId = request.user?.user_id ?? 'anonymous';
        const result = await PuzzleService.startPuzzle(userId, {
          gameId: request.params.game_id,
          difficulty: request.body.difficulty,
        });
        const successResponse = new SuccessResponse(
          StatusCodes.CREATED,
          'Puzzle session started',
          result,
        );

        return response
          .status(successResponse.statusCode)
          .json(successResponse.json());
      } catch (error) {
        next(error);
      }
    },
  )
  // Finish puzzle session
  .post(
    '/finish',
    validateAuth({ optional: true }),
    validateBody({ schema: FinishPuzzleSchema }),
    async (
      request: AuthedRequest<{}, {}, IFinishPuzzle>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const userId = request.user?.user_id ?? 'anonymous';
        const result = await PuzzleService.finishPuzzle(userId, request.body);
        const successResponse = new SuccessResponse(
          StatusCodes.OK,
          'Puzzle completed successfully',
          result,
        );

        return response
          .status(successResponse.statusCode)
          .json(successResponse.json());
      } catch (error) {
        next(error);
      }
    },
  )
  // Upload puzzle image
  .post(
    '/upload-image',
    validateAuth({ optional: true }),
    upload.single('image'),
    async (request: AuthedRequest, response: Response, next: NextFunction) => {
      try {
        const userId = request.user?.user_id ?? 'anonymous';
        const file = request.file;

        if (!file) {
          const result = new SuccessResponse(
            StatusCodes.BAD_REQUEST,
            'No file provided',
          );

          return response.status(result.statusCode).json(result.json());
        }

        const result = await PuzzleService.uploadPuzzleImage(
          userId,
          new File([new Uint8Array(file.buffer)], file.originalname, {
            type: file.mimetype,
          }),
        );
        const successResponse = new SuccessResponse(
          StatusCodes.CREATED,
          'Image uploaded successfully',
          result,
        );

        return response
          .status(successResponse.statusCode)
          .json(successResponse.json());
      } catch (error) {
        next(error);
      }
    },
  )
  // Create new puzzle (admin only)
  .post(
    '/',
    validateAuth({ allowed_roles: ['ADMIN', 'SUPER_ADMIN'] }),
    validateBody({
      schema: CreatePuzzleSchema,
      file_fields: [
        { name: 'thumbnail_image', maxCount: 1 },
        { name: 'files_to_upload', maxCount: 1 },
      ],
    }),
    async (
      request: AuthedRequest<{}, {}, ICreatePuzzle>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const newPuzzle = await PuzzleService.createPuzzle(
          request.user!.user_id,
          request.body,
        );
        const result = new SuccessResponse(
          StatusCodes.CREATED,
          'Puzzle created',
          newPuzzle,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        next(error);
      }
    },
  )
  // Update puzzle (admin only)
  .patch(
    '/:game_id',
    validateAuth({ allowed_roles: ['ADMIN', 'SUPER_ADMIN'] }),
    validateBody({
      schema: UpdatePuzzleSchema,
      file_fields: [
        { name: 'thumbnail_image', maxCount: 1 },
        { name: 'files_to_upload', maxCount: 1 },
      ],
    }),
    async (
      request: AuthedRequest<{ game_id: string }, {}, IUpdatePuzzle>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const updatedPuzzle = await PuzzleService.updatePuzzle(
          request.params.game_id,
          request.body,
          request.user!.user_id,
          request.user!.role,
        );
        const result = new SuccessResponse(
          StatusCodes.OK,
          'Puzzle updated',
          updatedPuzzle,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        next(error);
      }
    },
  )
  // Delete puzzle (admin only)
  .delete(
    '/:game_id',
    validateAuth({ allowed_roles: ['ADMIN', 'SUPER_ADMIN'] }),
    async (
      request: AuthedRequest<{ game_id: string }>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const result = await PuzzleService.deletePuzzle(
          request.params.game_id,
          request.user!.user_id,
          request.user!.role,
        );
        const successResponse = new SuccessResponse(
          StatusCodes.OK,
          'Puzzle deleted successfully',
          result,
        );

        return response
          .status(successResponse.statusCode)
          .json(successResponse.json());
      } catch (error) {
        next(error);
      }
    },
  );
