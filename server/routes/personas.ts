import { Router } from "express";
import { getPersonas } from "../controllers/personasController";
import { catchAsync } from "../middlewares/catchAsync";

const router = Router();

router.get("/", catchAsync(getPersonas));

export default router;
