import { Router, Request, Response } from "express";
import { db } from "../firebase";
import { Translate } from "@google-cloud/translate/build/src/v2";

const router = Router();



router.get("/questions", async (req, res) => {
  try {
      const googleCloudApiKey = process.env.CLOUD_TRANSLATION_API_KEY;

      if (!googleCloudApiKey) {
            console.warn("CLOUD_TRANSLATION_API_KEY is not set. Translation API will not work for quiz.");
      }

      const translate = new Translate({ key: googleCloudApiKey });  

    // 1. Get the desired language from the 'Accept-Language' header.
    const langHeader = req.headers["accept-language"] || "en";
    const targetLang = langHeader.split(",")[0].split("-")[0];

    const questionsSnapshot = await db.collection("quiz_questions").get();
    if (questionsSnapshot.empty) {
      return res.status(404).json({ error: "No quiz questions found" });
    }

    // 2. Process each question to get the correct translation.
    const questions = await Promise.all(
      questionsSnapshot.docs.map(async (doc) => {
        const baseData = doc.data();
        const translationsRef = doc.ref.collection("translations");

        // 2a. Fetch the English translation to use as a base or fallback.
        const englishTranslation = baseData || {};

        // 2b. If the target language is English, return the merged data.
        if (targetLang === "en") {
          return { ...baseData, ...englishTranslation, id: doc.id };
        }

        // 3. Try to fetch the translation for the target language.
        const targetTranslationDoc = await translationsRef.doc(targetLang).get();
        if (targetTranslationDoc.exists) {
          return { ...baseData, ...targetTranslationDoc.data(), id: doc.id };
        }

        // 4. If translation doesn't exist and we have a valid English source, create it.
        if (englishTranslation.question_text && englishTranslation.options) {
          const textsToTranslate = [
            englishTranslation.question_text,
            ...englishTranslation.options.map((opt: any) => opt.option_text),
          ];

          // 5. Use the Google Cloud Translation API.
          const [translations] = await translate.translate(
            textsToTranslate,
            targetLang
          );

          const translatedQuestionText = translations[0];
          const translatedOptions = englishTranslation.options.map(
            (opt: any, index: number) => ({
              ...opt, // Keep original image_url etc.
              option_text: translations[index + 1],
            })
          );

          const newTranslation = {
            question_text: translatedQuestionText,
            options: translatedOptions,
          };

          // 6. IMPORTANT: Save the new translation back to Firestore for next time.
          await translationsRef.doc(targetLang).set(newTranslation);
          return { ...baseData, ...newTranslation, id: doc.id };
        }

        // 7. Fallback to English if the target translation couldn't be fetched or created.
        return { ...baseData, ...englishTranslation, id: doc.id };
      })
    );

    // 8. Final mapping to remove persona_scores before sending to client
    const clientSafeQuestions = questions.map(q => {
        const { persona_scores, ...restOfQuestion } = q;
        const options = restOfQuestion.options.map((opt: any) => {
            const { persona_scores, ...restOfOption } = opt;
            return restOfOption;
        });
        return { ...restOfQuestion, options };
    })

    res.json(clientSafeQuestions);
  } catch (error: any) {
    console.error("Error fetching quiz questions:", error);
    res.status(500).json({ error: "Failed to fetch quiz questions" });
  }
});

router.post("/calculate-persona", async (req: Request, res: Response) => {
  const { answers } = req.body;

  // Get the desired language from the 'Accept-Language' header.
  const langHeader = req.headers["accept-language"] || "en";
  const lang = langHeader.split(",")[0].split("-")[0];

  if (
    !answers ||
    typeof answers !== "object" ||
    Object.keys(answers).length === 0
  ) {
    return res
      .status(400)
      .json({ message: "Invalid or empty answers format." });
  }

  try {
    const scores: Record<string, number> = {};

    // Fetch all questions from the DB to access the persona scores securely.
    const questionsSnapshot = await db.collection("quiz_questions").get();
    const questionsData = questionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    // Define a more specific type for the map to help TypeScript understand the object structure.
    const questionsMap = new Map<string, { id: string; options: any[] }>(
      // The 'as any' is a practical way to handle the dynamic nature of Firestore data here.
      questionsData.map((q) => [q.id, q as any])
    );

    // The client sends answers in the format: { questionId: selected_option_text }
    for (const questionId in answers) {
      const baseQuestion = questionsMap.get(questionId);
      const selectedOptionText = answers[questionId].option_text;

      if (baseQuestion && selectedOptionText) {
        let selectedOption = baseQuestion.options.find(
          (opt: any) => opt.option_text === selectedOptionText
        );

        // If not found in English and a language is provided, check translations.
        if (!selectedOption && lang && lang !== "en") {
          const translationDoc = await db
            .collection("quiz_questions")
            .doc(questionId)
            .collection("translations")
            .doc(lang)
            .get();

          if (translationDoc.exists) {
            const translatedOptions = translationDoc.data()?.options || [];
            const optionIndex = translatedOptions.findIndex((opt: any) => opt.option_text === selectedOptionText);
            if (optionIndex !== -1) selectedOption = baseQuestion.options[optionIndex];
          }
        }

        if (selectedOption?.persona_scores) {
          for (const persona in selectedOption.persona_scores) {
            scores[persona] =
              (scores[persona] || 0) + selectedOption.persona_scores[persona];
          }
        }
      }
    }

    if (Object.keys(scores).length === 0) {
      // Fallback to a default persona if no scores were calculated
      return res.status(200).json({ persona: "All-Rounder" });
    }

    // Find the persona with the highest score
    const dominantPersona = Object.keys(scores).reduce(
      (a, b) => (scores[a] > scores[b] ? a : b),
      Object.keys(scores)[0] // Provide the first key as the initial value
    );

    // The persona IDs in the DB are kebab-case, but the shared persona object uses PascalCase.
    // We should return a format the client expects. Let's assume the client can handle the kebab-case ID.
    res.status(200).json({ persona: dominantPersona });
  } catch (error: any) {
    console.error("Error calculating persona:", error);
    res
      .status(500)
      .json({ message: "An error occurred while calculating the persona." });
  }
});

export default router;
