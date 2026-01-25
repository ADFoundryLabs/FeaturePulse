import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyze PR intent alignment using Gemini
 */
export async function analyzeWithAI(intentRules, prDetails, fileChanges) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
You are FeaturePulse, an AI intent analysis system.

PROJECT INTENT RULES:
${intentRules}

PULL REQUEST CONTEXT:
Title: ${prDetails.title}
Description: ${prDetails.body || "No description provided."}

FILE CHANGES (TRUNCATED):
${fileChanges.substring(0, 8000)}

TASK:
1. Identify the primary intent of this pull request.
2. Estimate how well this PR aligns with the intent rules.
3. Provide a confidence score from 0 to 100.
4. Explain your reasoning briefly.

RESPOND ONLY IN VALID JSON:
{
  "intent": "Short intent label",
  "confidence": 0-100,
  "completed_features": ["List of intent rules satisfied"],
  "pending_features": ["List of intent rules not satisfied"],
  "summary": "Short explanation for the developer"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Remove markdown fences if present
    const cleanText = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanText);

    // Hard safety guards
    return {
      intent: parsed.intent || "Unknown",
      confidence: Number(parsed.confidence) || 0,
      completed_features: parsed.completed_features || [],
      pending_features: parsed.pending_features || [],
      summary: parsed.summary || "No summary provided."
    };
  } catch (error) {
    console.error("❌ Gemini AI Error:", error.message);

    return {
      intent: "Unknown",
      confidence: 0,
      completed_features: [],
      pending_features: ["AI analysis failed"],
      summary: "AI analysis could not be completed."
    };
  }
}
