import { Router } from "express";
import * as PuzzleController from "./puzzle.controller";
import { validateAuth } from "../../../../common/middleware/auth.middleware";

const router = Router();

router.get("/", validateAuth({}), PuzzleController.getPuzzleList);
router.get("/:id", validateAuth({}), PuzzleController.getPuzzleById);
router.post("/submit", validateAuth({}), PuzzleController.submitAnswer);

export default router;

