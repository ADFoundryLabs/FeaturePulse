import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// Logic: Use Gemini if key is present. If not, try OpenRouter.
const geminiKey = process.env.GEMINI_API_KEY;
const openRouterKey = process.env.OPENROUTER_API_KEY;

const useGemini = geminiKey && geminiKey.trim().length > 0;
const useOpenRouter = !useGemini && openRouterKey && openRouterKey.trim().length > 0;

let genAI;
let openAI;

if (useGemini) {
  console.log("🔹 Using Google Gemini API");
  genAI = new GoogleGenerativeAI(geminiKey);
} else if (useOpenRouter) {
  console.log("🔹 Using OpenRouter API");
  openAI = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: openRouterKey,
    defaultHeaders: {
      "HTTP-Referer": "https://github.com/AyushJha2008/FeaturePulse", // Optional: required by some OpenRouter models for rankings
      "X-Title": "FeaturePulse",
    },
  });
} else {
  console.warn("⚠️ No valid AI API Key found (Gemini or OpenRouter).");
}

export async function analyzeWithAI(intentRules, prDetails, fileChanges) {
  const prompt = `
  You are a Senior Project Manager Bot named FeaturePulse.
  
  CORE INSTRUCTIONS:
  1. Read the [PROJECT INTENT RULES] (intent.md). Extract every single requirement.
  2. Analyze the [FILE CHANGES] to see which requirements are implemented.
  3. Calculate "How much implementation is done" based *only* on the code visible in the PR and the rules.
  
  ---
  [PROJECT INTENT RULES]
  ${intentRules}
  ---

  [PR CONTEXT]
  Title: ${prDetails.title}
  Description: ${prDetails.body || "No description provided."}
  
  [FILE CHANGES]
  ${fileChanges.substring(0, 8000)} ... (truncated)

  RESPONSE FORMAT (JSON ONLY):
  {
    "completion_score": "A percentage (e.g., '40%', '100%') representing how many intent rules are satisfied",
    "completed_features": ["List of intent items that are FULLY implemented in this code"],
    "pending_features": ["List of intent items that are MISSING or incomplete"],
    "decision": "APPROVE" (if score is high or progress is good) or "WARN" (if critical intent is missing),
    "summary": "A brief status update for the developer about their progress."
  }
  `;

  try {
    let jsonStr = "";

    if (useGemini && genAI) {
      // --- Gemini Logic ---
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    } 
    else if (useOpenRouter && openAI) {
      // --- OpenRouter Logic ---
      const completion = await openAI.chat.completions.create({
        model: "google/gemini-2.0-flash-001", // OpenRouter model ID (can be changed to openai/gpt-4 etc.)
        messages: [
          { role: "system", content: "You are a helpful AI that strictly responds in JSON." },
          { role: "user", content: prompt }
        ],
      });
      const text = completion.choices[0].message.content;
      jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    } 
    else {
      throw new Error("No AI provider configured.");
    }

    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("AI Error:", error);
    return {
      completion_score: "0%",
      completed_features: [],
      pending_features: ["Analysis Failed"],
      decision: "WARN",
      summary: "I encountered an error analyzing your code. Please check your API keys."
    };
  }
}