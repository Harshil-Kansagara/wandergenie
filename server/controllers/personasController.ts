import { Request, Response } from "express";
import { ApiResponse } from "../utils/api-response";
import { AppError } from "../middlewares/errorHandler";
import { getTranslatedPersonas } from "../services/persona-service";

/**
 * Retrieves a list of all available travel personas.
 * @param _req The Express request object.
 * @param res The Express response object.
 */
export const getPersonas = async (_req: Request, res: Response) => {
  const langHeader = _req.headers["accept-language"] || "en";
  const targetLang = langHeader.split(",")[0].split("-")[0];

  try {
    const personas = await getTranslatedPersonas(targetLang);
    res.status(200).json(ApiResponse.success(personas));
  } catch (error) {
    console.error("Error fetching personas:", error);
    throw new AppError("Failed to fetch personas", 400);
  }
};
