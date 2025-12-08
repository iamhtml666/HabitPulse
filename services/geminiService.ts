import { GoogleGenAI } from "@google/genai";
import { Habit, HabitLog } from "../types";

const initAI = () => {
  if (!process.env.API_KEY) return null;
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeHabitData = async (habit: Habit, logs: HabitLog[], periodDescription: string): Promise<string> => {
  const ai = initAI();
  if (!ai) return "API Key not configured.";

  const logSummary = logs.map(l => ({
    date: new Date(l.timestamp).toLocaleDateString(),
    amount: l.value
  }));

  const prompt = `
    Analyze the following habit data for a user.
    Habit: ${habit.name} (${habit.type}).
    Goal: To ${habit.type === 'helpful' ? 'maintain or increase' : 'reduce or quit'} usage.
    Period: ${periodDescription}
    Data: ${JSON.stringify(logSummary)}

    Please provide a concise, 2-3 sentence insight or encouragement based on the trend.
    If it's an obstructive habit and they are doing well (low/zero counts), congratulate them.
    If usage is high for an obstructive habit, provide a gentle warning.
    Do not use markdown formatting, just plain text with emojis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error analyzing data. Please check your connection or API key.";
  }
};