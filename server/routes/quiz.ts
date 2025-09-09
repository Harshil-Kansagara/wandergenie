import { Router, Request, Response } from "express";
import { db } from "../firebase";

const router = Router();

router.get("/questions", async (_req, res) => {
  try {
    const questionsSnapshot = await db.collection("quiz_questions").get();
    if (questionsSnapshot.empty) {
      return res.status(404).json({ error: "No quiz questions found" });
    }
    // Map over the questions and remove the persona_scores from each option
    const questions = questionsSnapshot.docs.map((doc) => {
      const data = doc.data();
      const options = data.options.map((opt: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { persona_scores, ...rest } = opt;
        return rest;
      });
      return { ...data, id: doc.id, options };
    });

    res.json(questions);
  } catch (error: any) {
    console.error("Error fetching quiz questions:", error);
    res.status(500).json({ error: "Failed to fetch quiz questions" });
  }
});

router.post("/calculate-persona", async (req: Request, res: Response) => {
  const { answers } = req.body;

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
      const question = questionsMap.get(questionId);
      const selectedOptionText = answers[questionId].option_text;

      if (question && selectedOptionText) {
        const selectedOption = question.options.find(
          (opt: any) => opt.option_text === selectedOptionText
        );

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
