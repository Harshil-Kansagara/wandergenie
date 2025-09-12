import { Router } from "express";
import { catchAsync } from "../middlewares/catchAsync";
import {
  getQuizQuestions,
  calculatePersona,
} from "../controllers/quizController";

const router = Router();

router.get("/questions", catchAsync(getQuizQuestions));

router.post("/calculate-persona", catchAsync(calculatePersona));

export default router;
