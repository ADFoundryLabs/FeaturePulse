import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import dotenv from "dotenv"; // Fixed typo here

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
      "HTTP-Referer": "https://github.com/AyushJha2008/FeaturePulse",
      "X-Title": "FeaturePulse",
    },
  });
} else {
  console.warn("⚠️ No valid AI API Key found (Gemini or OpenRouter).");
}

/**
 * Orchestrate AI analysis with Security Context
 */
export async function analyzeWithAI(intentRules, prDetails, fileChanges, securityResult) {
  
  // Format security findings for the prompt
  const securityContext = `
  [SECURITY SCAN RESULTS]
  Risk Level: ${securityResult.riskLevel}
  Sensitive Files Touched: ${securityResult.sensitiveFiles.length > 0 ? securityResult.sensitiveFiles.join(", ") : "None"}
  Vulnerabilities Found: ${JSON.stringify(securityResult.vulnerabilities)}
  `;

  const prompt = `
  You are a Senior Project Manager Bot named FeaturePulse.
  
  CORE INSTRUCTIONS:
  1. Read the [PROJECT INTENT RULES] and [SECURITY SCAN RESULTS].
  2. Analyze the [FILE CHANGES] to see if they align with intent.
  3. Combine Intent Alignment + Security Risk to form a FINAL DECISION based on this Logic Matrix:
  
  [DECISION LOGIC MATRIX]
  - IF Security Risk = "HIGH" or "CRITICAL" -> Decision MUST be "BLOCK" (Reason: Security Risk)
  - IF Intent Match < 50% -> Decision MUST be "BLOCK" (Reason: Misalignment)
  - IF Security Risk = "MEDIUM" -> Decision is "WARN"
  - IF Intent Match >= 80% AND Security = "LOW" -> Decision is "APPROVE"
  - ELSE -> Decision is "WARN"

  ---
  [PROJECT INTENT RULES]
  ${intentRules}
  
  ${securityContext}
  ---

  [PR CONTEXT]
  Title: ${prDetails.title}
  Description: ${prDetails.body || "No description provided."}
  
  [FILE CHANGES]
  ${fileChanges.substring(0, 8000)} ... (truncated)

  RESPONSE FORMAT (JSON ONLY):
  {
    "completion_score": "Percentage (0-100%)",
    "security_risk": "${securityResult.riskLevel}",
    "completed_features": ["List of intent items FULLY implemented"],
    "pending_features": ["List of intent items MISSING"],
    "decision": "APPROVE" | "WARN" | "BLOCK",
    "summary": "A human-readable explanation of the decision. Mention specific security risks if any."
  }
  `;

  try {
    let jsonStr = "";

    if (useGemini && genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    } 
    else if (useOpenRouter && openAI) {
      const completion = await openAI.chat.completions.create({
        model: "google/gemini-2.0-flash-001",
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
      security_risk: "UNKNOWN",
      completed_features: [],
      pending_features: ["Analysis Failed"],
      decision: "WARN",
      summary: "I encountered an error analyzing your code. Please check your API keys."
    };
  }
}
