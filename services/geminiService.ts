
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API Key not found. Symptom suggestion feature will be disabled.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const suggestSymptomDetails = async (symptoms: string): Promise<string[]> => {
  if (!ai) {
    return Promise.resolve([]); // Return empty array if API key is not available
  }

  const prompt = `A dental patient is describing their symptoms as: "${symptoms}". 
Suggest 3-5 related keywords or short descriptive phrases they could use to better explain their condition to a dentist.
Return the suggestions as a JSON array of strings. For example, if the input is 'tooth hurts', suggestions could be ["sharp pain when biting", "dull ache in upper molar", "sensitivity to cold"].
Ensure the output is ONLY a valid JSON array of strings.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.5, // Lower temperature for more factual suggestions
      },
    });
    
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; // Matches ```json ... ``` or ``` ... ```
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsedData = JSON.parse(jsonStr);
    if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'string')) {
      return parsedData as string[];
    }
    console.error("Gemini response was not a valid JSON array of strings:", parsedData);
    return [];
  } catch (error) {
    console.error("Error fetching symptom suggestions from Gemini:", error);
    return []; // Return empty array on error
  }
};
    