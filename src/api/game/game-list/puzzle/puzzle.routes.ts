import { Router } from "express";
import * as PuzzleController from "./puzzle.controller";
import { validateAuth } from "../../../../common/middleware/auth.middleware";
import { validatorMiddleware } from "../../../../common/middleware/validator.middleware";
import { finishPuzzleSchema } from "./puzzle.schema";

const router = Router();

router.get("/", validateAuth({ optional: true }), PuzzleController.getPuzzleList);
router.get("/:id", validateAuth({ optional: true }), PuzzleController.getPuzzleById);
router.post("/:id/start", validateAuth({}), PuzzleController.startPuzzle);
router.post("/finish", validateAuth({}), validatorMiddleware(finishPuzzleSchema), PuzzleController.finishPuzzle);
router.get("/history/me", validateAuth({}), PuzzleController.getHistory);
router.get("/:id/leaderboard", validateAuth({ optional: true }), PuzzleController.getLeaderboard);

export default router;