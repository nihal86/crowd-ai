
import { GoogleGenAI, Type } from "@google/genai";
import { RiskLevel, Stats } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAIAnalysis = async (stats: Stats): Promise<string> => {
  const prompt = `Act as a Senior Crowd Intelligence & Urban Operations Analyst for CrowdSense AI. 
  Current Indian node telemetry:
  - Detection Count: ${stats.people_count} individuals
  - Risk Assessment Level: ${stats.risk_level}
  - Time Stamp: ${stats.timestamp}
  
  Provide a professional summary (2 sentences) and 3 tactical recommendations for urban safety personnel or the Command and Control Center (CCC). Focus on density management, crowd flow, and safety compliance in a high-density Indian urban context.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.65,
        topP: 0.9,
      }
    });
    
    return response.text || "Crowd Intelligence Engine currently offline.";
  } catch (error) {
    console.error("Crowd-Intelligence Analysis Error:", error);
    return "Protocol failure: Unable to synthesize crowd safety data. Please check CCC uplink.";
  }
};
