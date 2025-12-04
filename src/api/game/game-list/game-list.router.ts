/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/no-default-export */
import { Router } from 'express';

import { QuizController } from './quiz/quiz.controller';

const GameListRouter = Router();

GameListRouter.use('/quiz', QuizController);

export default GameListRouter;
