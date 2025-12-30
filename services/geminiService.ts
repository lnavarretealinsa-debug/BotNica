
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

let ai: GoogleGenAI;
try {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} catch (e) {
    console.error(e);
}


export const generateResponse = async (prompt: string, systemInstruction: string): Promise<string> => {
    if (!ai) {
        return "El servicio de IA no está configurado correctamente. Falta la API Key.";
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.5,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating response from Gemini API:", error);
        return "Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.";
    }
};

export const getSemanticMatch = async (prompt: string): Promise<any> => {
     if (!ai) {
        throw new Error("AI service is not configured.");
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                temperature: 0,
                responseMimeType: "application/json",
            }
        });
        
        // The response text is a JSON string, so we need to parse it.
        return JSON.parse(response.text);

    } catch (error) {
        console.error("Error getting semantic match from Gemini API:", error);
        // Return a structure that won't cause the calling function to crash
        return { best_match_id: null, confidence: 0.0 };
    }
};
