import { Router } from "express";
import aiRoutes from "./ai";
import tripRoutes from "./trips";
import placesRoutes from "./places";
import personaRoutes from "./personas";
import utilityRoutes from "./utility";
import quizRoutes from "./quiz";

const router = Router();

router.use("/ai", aiRoutes);
router.use("/trips", tripRoutes);
router.use("/places", placesRoutes);
router.use("/personas", personaRoutes);
router.use("/utility", utilityRoutes);
router.use("/quiz", quizRoutes);

// A simple health check endpoint
router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

export default router;
