import { Router } from "express";
import { db } from "../firebase";

const router = Router();

router.get("/questions", async (_req, res) => {
  try {
    const questionsSnapshot = await db.collection("quiz_questions").get();
    if (questionsSnapshot.empty) {
      return res.status(404).json({ error: "No quiz questions found" });
    }
    const questions = questionsSnapshot.docs.map((doc) => doc.data());
    res.json(questions);
  } catch (error: any) {
    console.error("Error fetching quiz questions:", error);
    res.status(500).json({ error: "Failed to fetch quiz questions" });
  }
});

export default router;
