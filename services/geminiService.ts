
import { GoogleGenAI, Type } from "@google/genai";
import { RiskLevel, Stats } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAIAnalysis = async (stats: Stats): Promise<string> => {
  const prompt = `Act as a professional urban safety analyst. 
  Current crowd statistics:
  - People Count: ${stats.people_count}
  - Risk Level: ${stats.risk_level}
  - Time: ${stats.timestamp}
  
  Provide a concise 2-sentence summary of the situation and 3 actionable safety recommendations.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });
    
    return response.text || "Unable to generate analysis at this time.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error generating AI insights. Please check connectivity.";
  }
};
