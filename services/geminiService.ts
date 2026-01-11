
import { GoogleGenAI, Type } from "@google/genai";
import { ChangeList, AIReview } from "../types";

export const getAIReview = async (change: ChangeList): Promise<AIReview> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const filesString = change.files.map(f => `File: ${f.path}\nContent:\n${f.content}`).join("\n\n---\n\n");
  
  const prompt = `
    You are a world-class senior software architect. Analyze the following code change for:
    1. Overall summary of what the developer is trying to achieve.
    2. Potential bugs or edge cases.
    3. Security vulnerabilities.
    4. Code style or best practice improvements.

    Return the analysis strictly in JSON format matching the schema provided.

    Context:
    Subject: ${change.subject}
    Project: ${change.project}
    Files:
    ${filesString}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            overallSentiment: { 
              type: Type.STRING,
              description: "Must be POSITIVE, NEUTRAL, or NEGATIVE"
            },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  file: { type: Type.STRING },
                  line: { type: Type.NUMBER },
                  message: { type: Type.STRING },
                  severity: { 
                    type: Type.STRING,
                    description: "LOW, MEDIUM, or HIGH"
                  }
                },
                required: ["file", "message", "severity"]
              }
            }
          },
          required: ["summary", "overallSentiment", "suggestions"]
        }
      }
    });

    return JSON.parse(response.text || "{}") as AIReview;
  } catch (error) {
    console.error("AI Review failed:", error);
    throw error;
  }
};
