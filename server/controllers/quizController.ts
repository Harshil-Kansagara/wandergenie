import { Request, Response } from "express";
import { ApiResponse } from "../utils/api-response";
import { AppError } from "../middlewares/errorHandler";
import { quizAnswersSchema } from "@shared/schema";
import {
  calculateDominantPersona,
  getTranslatedQuizQuestions,
} from "../services/quiz-service";

/**
 * Retrieves the list of questions for the travel persona quiz.
 * It fetches questions from Firestore and strips the persona scores before sending to the client.
 * @param _req The Express request object.
 * @param res The Express response object.
 */
export const getQuizQuestions = async (_req: Request, res: Response) => {
  const langHeader = _req.headers["accept-language"] || "en";
  const targetLang = langHeader.split(",")[0].split("-")[0];
  try {
    const clientSafeQuestions = await getTranslatedQuizQuestions(targetLang);
    res.status(200).json(ApiResponse.success(clientSafeQuestions));
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    throw new AppError("Failed to fetch quiz questions", 400);
  }
};

/**
 * Calculates the dominant travel persona based on user's quiz answers.
 * It tallies scores from the selected answers to determine the result.
 * @param req The Express request object, containing the `answers` object in the body.
 * @param res The Express response object.
 */
export const calculatePersona = async (req: Request, res: Response) => {
  const { answers } = quizAnswersSchema.parse(req.body);

  // Get the desired language from the 'Accept-Language' header.
  const langHeader = req.headers["accept-language"] || "en";
  const lang = langHeader.split(",")[0].split("-")[0];

  try {
    const dominantPersona = await calculateDominantPersona(answers, lang);
    res.status(200).json(ApiResponse.success({ persona: dominantPersona }));
  } catch (error) {
    console.error("Error calculating persona:", error);
    throw new AppError("Failed to calculate persona", 400);
  }
};
