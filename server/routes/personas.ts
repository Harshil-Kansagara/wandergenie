import { Router } from "express";
import { db } from "../firebase";
import { Translate } from "@google-cloud/translate/build/src/v2";

const router = Router();


router.get("/", async (req, res) => {
  try {

    const googleCloudTranslationApiKey = process.env.CLOUD_TRANSLATION_API_KEY;

    if (!googleCloudTranslationApiKey) {
  console.warn("CLOUD_TRANSLATION_API_KEY is not set. Translation API will not work.");
    }
    // Initialize the Google Cloud Translation client.
    // This will automatically use the service account credentials if running in a Google Cloud environment (like Cloud Functions).
    const translate = new Translate({key : googleCloudTranslationApiKey});
    
    // 1. Get the desired language from the 'Accept-Language' header.
    const langHeader = req.headers["accept-language"] || "en";
    const targetLang = langHeader.split(",")[0].split("-")[0];
    const personasSnapshot = await db.collection("personas").get();
    if (personasSnapshot.empty) {
      return res.status(404).json({ error: "No personas found" });
    }

    // 2. Process each persona to get the correct translation.
    const personas = await Promise.all(
      personasSnapshot.docs.map(async (doc) => {
        const baseData = doc.data();
        const translationsRef = doc.ref.collection("translations");

        // 2a. Fetch the English translation to use as a base or fallback.
        const englishTranslation = baseData || {};

        // 2b. If the target language is English, return the base data merged with English translation.
        if (targetLang === "en") {
          return { ...baseData, ...englishTranslation, id: doc.id };
        }

        // 3. Try to fetch the translation for the target language.
        const targetTranslationDoc = await translationsRef.doc(targetLang).get();

        // 3a. If the translation for the target language exists, return it.
        if (targetTranslationDoc.exists) {
          return { ...baseData, ...targetTranslationDoc.data(), id: doc.id };
        }

        console.log("language received = "+JSON.stringify(englishTranslation))

        // 4. If translation doesn't exist and we have a valid English source, create it.
        if (englishTranslation.name && englishTranslation.tagline && englishTranslation.description) {
          const textToTranslate = [
            englishTranslation.name,
            englishTranslation.tagline,
            englishTranslation.description
          ];


          // 5. Use the Google Cloud Translation API.
          const [translations] = await translate.translate(
            textToTranslate,
            targetLang
          );

          // 5a. Structure the new translation data.
          const newTranslation = {
            name: translations[0],
            tagline: translations[1],
            description : translations[2]
           };

          // 6. IMPORTANT: Save the new translation back to Firestore for next time.
          await translationsRef.doc(targetLang).set(newTranslation);
          return { ...baseData, ...newTranslation, id: doc.id };
        }

        // 7. Fallback to English if the target translation couldn't be fetched or created.
        return { ...baseData, ...englishTranslation, id: doc.id };
      }),
    );

    res.json(personas);
  } catch (error: any) {
    console.error("Error fetching personas:", error);
    res.status(500).json({ error: "Failed to fetch personas" });
  }
});

export default router;
