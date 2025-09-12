import { Request, Response } from "express";
import { db } from "../config/firebase";
import { Persona } from "@shared/schema";
import { ApiResponse } from "../utils/api-response";
import { AppError } from "../middlewares/errorHandler";

/**
 * Retrieves a list of all available travel personas.
 * @param _req The Express request object.
 * @param res The Express response object.
 */
export const getPersonas = async (_req: Request, res: Response) => {
  const personasSnapshot = await db.collection("personas").get();
  if (personasSnapshot.empty) {
    throw new AppError("No personas found", 404);
  }
  const personas = personasSnapshot.docs.map((doc) => doc.data() as Persona);
  res.status(200).json(ApiResponse.success(personas));
};
