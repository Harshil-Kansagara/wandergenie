import { Request, Response } from "express";
import { db } from "../config/firebase";
import { ApiResponse } from "../utils/api-response";
import { AppError } from "../middlewares/errorHandler";
import { QuizOption, QuizQuestion } from "@shared/schema";

/**
 * Retrieves the list of questions for the travel persona quiz.
 * It fetches questions from Firestore and strips the persona scores before sending to the client.
 * @param _req The Express request object.
 * @param res The Express response object.
 */
export const getQuizQuestions = async (_req: Request, res: Response) => {
  const questionsSnapshot = await db.collection("quiz_questions").get();
  if (questionsSnapshot.empty) {
    throw new AppError("No quiz questions found", 404);
  }

  // Map over the questions and remove the persona_scores from each option
  const questions = questionsSnapshot.docs.map((doc) => {
    const data = doc.data() as QuizQuestion;
    const options = data.options.map((opt: QuizOption) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { persona_scores, ...rest } = opt;
      return rest;
    });
    return { ...data, id: doc.id, options };
  });

  res.status(200).json(ApiResponse.success(questions));
};

/**
 * Calculates the dominant travel persona based on user's quiz answers.
 * It tallies scores from the selected answers to determine the result.
 * @param req The Express request object, containing the `answers` object in the body.
 * @param res The Express response object.
 */
export const calculatePersona = async (req: Request, res: Response) => {
  const { answers } = req.body;

  if (
    !answers ||
    typeof answers !== "object" ||
    Object.keys(answers).length === 0
  ) {
    throw new AppError("Invalid or empty answers format.", 400);
  }

  const scores: Record<string, number> = {};

  const questionsSnapshot = await db.collection("quiz_questions").get();
  const questionsMap = new Map<string, QuizQuestion>(
    questionsSnapshot.docs.map((doc) => [
      doc.id,
      { id: doc.id, ...doc.data() } as QuizQuestion,
    ])
  );

  for (const questionId in answers) {
    const question = questionsMap.get(questionId);
    const selectedOptionText = answers[questionId].option_text;

    if (question && selectedOptionText) {
      const selectedOption = question.options.find(
        (opt) => opt.option_text === selectedOptionText
      );

      if (selectedOption?.persona_scores) {
        for (const persona in selectedOption.persona_scores) {
          scores[persona] =
            (scores[persona] || 0) + selectedOption.persona_scores[persona];
        }
      }
    }
  }

  const scoreKeys = Object.keys(scores);
  const dominantPersona = scoreKeys.length
    ? scoreKeys.reduce((a, b) => (scores[a] > scores[b] ? a : b), scoreKeys[0])
    : "All-Rounder";

  res.status(200).json(ApiResponse.success({ persona: dominantPersona }));
};
