import { db } from "../config/firebase";
import { QuizOption, QuizQuestion } from "@shared/schema";
import { getTranslateClient } from "../utils/google-cloud-wrapper.js";
import { AppError } from "../middlewares/errorHandler";

/**
 * Finds the selected quiz option, checking for translations if necessary.
 * @param question The full question object from Firestore.
 * @param selectedOptionText The text of the option selected by the user.
 * @param lang The language code for translation lookup.
 * @returns The selected QuizOption with persona scores, or undefined if not found.
 */
async function findSelectedOption(
  question: QuizQuestion,
  selectedOptionText: string,
  lang: string
): Promise<QuizOption | undefined> {
  // First, try to find the option in the base (English) options.
  const baseOption = question.options.find(
    (opt) => opt.option_text === selectedOptionText
  );
  if (baseOption) {
    return baseOption;
  }

  // If not found and language is not English, check translations.
  if (lang !== "en") {
    const translationDoc = await db
      .collection("quiz_questions")
      .doc(question.id)
      .collection("translations")
      .doc(lang)
      .get();

    if (translationDoc.exists) {
      const translatedOptions = translationDoc.data()?.options || [];
      const optionIndex = translatedOptions.findIndex(
        (opt: any) => opt.option_text === selectedOptionText
      );
      // If found in translation, return the original option at the same index to get the scores.
      if (optionIndex !== -1) {
        return question.options[optionIndex];
      }
    }
  }

  return undefined;
}

/**
 * Calculates the dominant travel persona from a set of quiz answers.
 * @param answers A map of question IDs to selected option text.
 * @param lang The language of the answers.
 * @returns The name of the dominant persona.
 */
export async function calculateDominantPersona(
  answers: Record<string, { option_text: string }>,
  lang: string
): Promise<string> {
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
      const selectedOption = await findSelectedOption(
        question,
        selectedOptionText,
        lang
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
  return scoreKeys.length
    ? scoreKeys.reduce((a, b) => (scores[a] > scores[b] ? a : b), scoreKeys[0])
    : "All-Rounder";
}

/**
 * Retrieves quiz questions from Firestore and translates them if necessary.
 * @param targetLang The language code to translate to.
 * @returns A promise that resolves to an array of translated quiz questions.
 */
export async function getTranslatedQuizQuestions(
  targetLang: string
): Promise<any> {
  const cloudTranslationApiKey = process.env.CLOUD_TRANSLATION_API_KEY;
  if (!cloudTranslationApiKey) {
    throw new AppError(
      "Translation service is not configured on the server.",
      500
    );
  }
  const translate = await getTranslateClient();

  const questionsSnapshot = await db.collection("quiz_questions").get();
  if (questionsSnapshot.empty) {
    throw new AppError("No quiz questions found", 404);
  }

  const questions = await Promise.all(
    questionsSnapshot.docs.map(async (doc) => {
      const data = doc.data() as QuizQuestion;
      const translationsRef = doc.ref.collection("translations");

      // If the target language is English, return the base data.
      if (targetLang === "en") {
        return { ...data, id: doc.id };
      }

      // Try to fetch the translation for the target language.
      const targetTranslationDoc = await translationsRef.doc(targetLang).get();
      if (targetTranslationDoc.exists) {
        return {
          ...data,
          ...targetTranslationDoc.data(),
          id: doc.id,
        } as QuizQuestion;
      }

      // If translation doesn't exist, create it.
      const baseData = data;
      if (baseData.question_text && baseData.options) {
        const textsToTranslate = [
          baseData.question_text,
          ...baseData.options.map((opt: QuizOption) => opt.option_text),
        ];

        const [translations] = await translate.translate(
          textsToTranslate,
          targetLang
        );

        const translatedQuestionText = translations[0];
        const translatedOptions = baseData.options.map(
          (opt: QuizOption, index: number) => ({
            ...opt,
            option_text: translations[index + 1],
          })
        );

        const newTranslation = {
          question_text: translatedQuestionText,
          options: translatedOptions,
        };

        // Save the new translation back to Firestore for next time.
        await translationsRef.doc(targetLang).set(newTranslation);
        return { ...data, ...newTranslation, id: doc.id } as QuizQuestion;
      }

      // Fallback to English if translation couldn't be created.
      return { ...data, id: doc.id };
    })
  );

  // Final mapping to remove persona_scores before sending to client
  return questions.map((q) => {
    const options = q.options.map((opt: QuizOption) => {
      const { persona_scores, ...rest } = opt;
      return rest;
    });
    return { ...q, id: q.id, options };
  });
}
