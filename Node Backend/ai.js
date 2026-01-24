import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeWithAI(intentRules, prDetails, fileChanges) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
  You are a Senior Project Manager Bot named FeaturePulse.
  
  CORE INSTRUCTIONS:
  1. Read the Project Intent Rules below.
  2. Analyze the PR Title, Description, and File Changes.
  3. Answer: "Based on intent.md, what is the intent of this PR and should it be approved?"

  ---
  [PROJECT INTENT RULES]
  ${intentRules}
  ---

  [PR CONTEXT]
  Title: ${prDetails.title}
  Description: ${prDetails.body || "No description provided."}
  
  [FILE CHANGES]
  ${fileChanges.substring(0, 5000)} ... (truncated)

  RESPONSE FORMAT (JSON ONLY):
  {
    "detected_intent": "Brief description of what this code does",
    "decision": "APPROVE" or "WARN" or "BLOCK",
    "reasoning": "Explanation comparing the code to the intent rules",
    "summary": "A friendly comment to the developer"
  }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // Clean up potential markdown formatting in JSON response
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Error:", error);
    return {
      decision: "WARN",
      detected_intent: "Analysis Failed",
      reasoning: "AI could not process the request.",
      summary: "I encountered an error analyzing your code."
    };
  }
}