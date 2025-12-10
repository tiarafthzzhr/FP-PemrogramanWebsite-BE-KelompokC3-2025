import { Router } from "express";
import multer from "multer";
import * as PuzzleController from "./puzzle.controller";
import { validateAuth } from "../../../../common/middleware/auth.middleware";
import { validateBody } from "../../../../common/middleware/validator.middleware";
import { finishPuzzleSchema } from "./schema";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", validateAuth({ optional: true }), PuzzleController.getPuzzleList);
router.get("/:id", validateAuth({ optional: true }), PuzzleController.getPuzzleById);
router.post("/:id/start", validateAuth({ optional: true }), PuzzleController.startPuzzle);
router.post(
  "/finish",  
  validateAuth({ optional: true }),
  validateBody({ schema: finishPuzzleSchema }),
  PuzzleController.finishPuzzle
);
router.post(
  "/upload-image",
  validateAuth({ optional: true }),
  upload.single("image"),
  PuzzleController.uploadPuzzleImage
);
router.post("/", validateAuth({ allowed_roles: ["ADMIN", "SUPER_ADMIN"] }), PuzzleController.createPuzzle);
router.get("/:id/edit", validateAuth({ allowed_roles: ["ADMIN", "SUPER_ADMIN"] }), PuzzleController.getPuzzleForEdit);
router.put("/:id", validateAuth({ allowed_roles: ["ADMIN", "SUPER_ADMIN"] }), PuzzleController.updatePuzzle);
router.delete("/:id", validateAuth({ allowed_roles: ["ADMIN", "SUPER_ADMIN"] }), PuzzleController.deletePuzzle);

export default router;