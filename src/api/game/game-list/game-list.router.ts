import { Router } from 'express';

import { QuizController } from './quiz/quiz.controller';
import PuzzleRouter from './puzzle/puzzle.routes';

const GameListRouter = Router();

GameListRouter.use('/quiz', QuizController);
GameListRouter.use('/puzzle', PuzzleRouter);

export default GameListRouter;
