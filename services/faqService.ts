
import { FAQItem } from '../types';
import { FUZZY_SEARCH_THRESHOLD } from '../constants';
import { getSemanticMatch } from './geminiService';

interface SemanticMatchResult {
  best_match_id: string | null;
  confidence: number;
}

export const findBestFAQMatch = async (query: string, faqs: FAQItem[]): Promise<FAQItem | null> => {
  if (!query || faqs.length === 0) {
    return null;
  }

  const faqListForPrompt = faqs.map(faq => `ID: "${faq.id}", Pregunta: "${faq.question}"`).join('\n');

  const prompt = `
    Eres un motor de búsqueda semántica. Tu tarea es encontrar la mejor coincidencia de una lista de preguntas frecuentes (FAQ) para una consulta de usuario dada.
    Analiza el significado de la consulta del usuario y compáralo con el significado de cada pregunta en la lista de FAQ.

    **Consulta del Usuario:**
    "${query}"

    **Lista de FAQ Disponibles:**
    ${faqListForPrompt}

    **Instrucciones de Respuesta:**
    Responde ÚNICAMENTE con un objeto JSON que contenga dos claves:
    1.  "best_match_id": El ID de la pregunta del FAQ que mejor coincida semánticamente. Si ninguna pregunta es una buena coincidencia, el valor debe ser null.
    2.  "confidence": Un número entre 0 y 1 que represente tu confianza en la coincidencia. Si no hay una buena coincidencia, la confianza debe ser 0.

    Ejemplo de respuesta si encuentras una buena coincidencia:
    {
      "best_match_id": "faq-2",
      "confidence": 0.95
    }

    Ejemplo de respuesta si no encuentras una buena coincidencia:
    {
      "best_match_id": null,
      "confidence": 0.0
    }

    No añadas ninguna otra explicación o texto fuera del objeto JSON.
  `;

  try {
    const responseJson = await getSemanticMatch(prompt);
    
    // Basic validation of the parsed object
    if (responseJson && typeof responseJson.best_match_id !== 'undefined' && typeof responseJson.confidence === 'number') {
        const { best_match_id, confidence } = responseJson as SemanticMatchResult;
    
        if (best_match_id && confidence >= FUZZY_SEARCH_THRESHOLD) {
          const matchedFaq = faqs.find(faq => faq.id === best_match_id);
          return matchedFaq || null;
        }
    } else {
        console.warn("Semantic match response was not in the expected format:", responseJson);
    }

  } catch (error) {
    console.error("Error during semantic FAQ match:", error);
    // Fallback or ignore, so the app doesn't crash.
    // The chatbot will proceed to the general Gemini API call.
  }


  return null;
};
