import { Router } from "express";
import { db } from "../firebase";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const personasSnapshot = await db.collection("personas").get();
    if (personasSnapshot.empty) {
      return res.status(404).json({ error: "No personas found" });
    }
    const personas = personasSnapshot.docs.map((doc) => doc.data());
    res.json(personas);
  } catch (error: any) {
    console.error("Error fetching personas:", error);
    res.status(500).json({ error: "Failed to fetch personas" });
  }
});

export default router;
