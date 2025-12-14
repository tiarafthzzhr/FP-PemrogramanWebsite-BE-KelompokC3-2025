/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/no-default-export */
import { Router } from 'express';

import { PuzzleController } from './puzzle/puzzle.controller';
import { QuizController } from './quiz/quiz.controller';

const GameListRouter = Router();

GameListRouter.use('/quiz', QuizController);
GameListRouter.use('/puzzle', PuzzleController);

export default GameListRouter;
