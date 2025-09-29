import { AppError } from "server/middlewares/errorHandler";

export async function getTranslateClient() {
  try {
    // Use dynamic import to handle the problematic Google Cloud package
    const { Translate } = await import(
      "@google-cloud/translate/build/src/v2/index.js"
    );
    const cloudTranslationApiKey = process.env.CLOUD_TRANSLATION_API_KEY;
    if (!cloudTranslationApiKey) {
      throw new AppError(
        "Cloud Translation API key is not configured on the server.",
        500
      );
    }
    return new Translate({ key: cloudTranslationApiKey });
  } catch (error) {
    console.error("Failed to initialize Google Translate client:", error);
    throw error;
  }
}

export async function getGeminiClient() {
  try {
    const { GoogleGenAI } = await import("@google/genai");
    const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new AppError(
        "Google Gemini API key is not configured on the server.",
        500
      );
    }
    return new GoogleGenAI({ apiKey: geminiApiKey });
  } catch (error) {
    console.error("Failed to initialize Google Gemini client:", error);
    throw error;
  }
}
