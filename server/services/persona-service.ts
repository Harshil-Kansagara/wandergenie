import { db } from "../config/firebase";
import { Persona } from "@shared/schema";
import { getTranslateClient } from "../utils/google-cloud-wrapper.js";
import { AppError } from "../middlewares/errorHandler";

/**
 * Retrieves a list of all available travel personas, translated to the target language.
 * @param targetLang The language code to translate to (e.g., "es", "fr").
 * @returns A promise that resolves to an array of translated Persona objects.
 */
export async function getTranslatedPersonas(
  targetLang: string
): Promise<Persona[]> {
  const cloudTranslationApiKey = process.env.CLOUD_TRANSLATION_API_KEY;
  if (!cloudTranslationApiKey) {
    throw new AppError(
      "Translation service is not configured on the server.",
      500
    );
  }
  const translate = await getTranslateClient();

  const personasSnapshot = await db.collection("personas").get();
  if (personasSnapshot.empty) {
    throw new AppError("No personas found", 404);
  }

  const personas = await Promise.all(
    personasSnapshot.docs.map(async (doc) => {
      const baseData = doc.data() as Persona;
      const translationsRef = doc.ref.collection("translations");

      // If the target language is English, return the base data.
      if (targetLang === "en") {
        return { ...baseData, id: doc.id };
      }

      // Try to fetch the translation for the target language.
      const targetTranslationDoc = await translationsRef.doc(targetLang).get();
      if (targetTranslationDoc.exists) {
        return { ...baseData, ...targetTranslationDoc.data(), id: doc.id };
      }

      // If translation doesn't exist, create it.
      if (baseData.name && baseData.tagline && baseData.description) {
        const textToTranslate = [
          baseData.name,
          baseData.tagline,
          baseData.description,
        ];

        const [translations] = await translate.translate(
          textToTranslate,
          targetLang
        );

        const newTranslation = {
          name: translations[0],
          tagline: translations[1],
          description: translations[2],
        };

        // Save the new translation back to Firestore for next time.
        await translationsRef.doc(targetLang).set(newTranslation);
        return { ...baseData, ...newTranslation, id: doc.id };
      }

      // Fallback to English if translation couldn't be created.
      return { ...baseData, id: doc.id };
    })
  );

  return personas as Persona[];
}
