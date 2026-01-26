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
      "HTTP-Referer": "https://github.com/AyushJha2008/FeaturePulse",
      "X-Title": "FeaturePulse",
    },
  });
} else {
  console.warn("⚠️ No valid AI API Key found (Gemini or OpenRouter).");
}

/**
 * Orchestrate AI analysis with Security and Redundancy Context
 */
export async function analyzeWithAI(intentRules, prDetails, fileChanges, securityResult, redundancyResult) {
  
  // Format security findings
  const securityContext = `
  [SECURITY SCAN DATA]
  - Risk Level: ${securityResult.riskLevel}
  - Sensitive Files: ${securityResult.sensitiveFiles.length > 0 ? securityResult.sensitiveFiles.join(", ") : "None"}
  - Vulnerabilities: ${JSON.stringify(securityResult.vulnerabilities)}
  `;

  // Format redundancy findings
  const redundancyContext = `
  [REDUNDANCY SCAN DATA]
  ${redundancyResult && redundancyResult.length > 0 ? redundancyResult.join("\n- ") : "No code redundancy detected."}
  `;

  // --- ENHANCED PRD-STYLE PROMPT ---
  const prompt = `
  You are 'FeaturePulse', a Senior Product Quality & Security Analyst.
  
  YOUR MISSION:
  Conduct a rigorous review of the [CODE CHANGES] against the [PROJECT INTENT (PRD)].
  Generate a structured compliance report in JSON format.
  
  ---
  [1. PROJECT INTENT (PRD / REQUIREMENTS)]
  ${intentRules}
  
  [2. AUTOMATED SECURITY REPORT]
  ${securityContext}

  [3. CODE REDUNDANCY REPORT]
  ${redundancyContext}

  [4. PULL REQUEST METADATA]
  Title: ${prDetails.title}
  Description: ${prDetails.body || "No description provided."}
  
  [5. CODE IMPLEMENTATION (DIFF)]
  ${fileChanges.substring(0, 12000)} ... (truncated if too long)
  ---

  [DECISION LOGIC MATRIX]
  - **BLOCK**: If Security is HIGH/CRITICAL OR Intent Alignment < 50%.
  - **WARN**: If Redundancy found OR Security is MEDIUM OR Intent Alignment < 80%.
  - **APPROVE**: If Intent Alignment > 80% AND Security LOW AND No Redundancy.

  RESPONSE FORMAT (Strict JSON Only):
  {
    "decision": "APPROVE" | "WARN" | "BLOCK",
    "completion_score": "Percentage (0-100%)",
    "prd_analysis": {
      "fully_implemented": ["List of intent features clearly found in code"],
      "missing_features": ["List of intent features NOT found"],
      "out_of_scope": ["New features added that were NOT in the Intent/PRD"]
    },
    "risk_assessment": {
      "security_level": "${securityResult.riskLevel}",
      "concerns": ["List specific security or redundancy concerns"]
    },
    "summary": "A Markdown-formatted string. MUST be structured with these headers: '## 📋 PRD Compliance', '## 🛡️ Security & Quality', '## 💡 Recommendations'. Provide specific, actionable feedback."
  }
  `;

  try {
    let jsonStr = "";

    if (useGemini && genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      // Clean up markdown code blocks if Gemini adds them
      jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    } 
    else if (useOpenRouter && openAI) {
      const completion = await openAI.chat.completions.create({
        model: "google/gemini-2.0-flash-001",
        messages: [
          { role: "system", content: "You are a specialized JSON-outputting API. Do not output markdown blocks." },
          { role: "user", content: prompt }
        ],
      });
      const text = completion.choices[0].message.content;
      jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    } 
    else {
      throw new Error("No AI provider configured.");
    }

    // Parse and Return
    const parsed = JSON.parse(jsonStr);
    
    // Ensure back-compat with index.js if the AI changes structure slightly
    if (!parsed.completed_features) parsed.completed_features = parsed.prd_analysis?.fully_implemented || [];
    if (!parsed.pending_features) parsed.pending_features = parsed.prd_analysis?.missing_features || [];

    return parsed;

  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      completion_score: "0%",
      decision: "WARN",
      summary: "⚠️ **Analysis Failed**: I encountered an error connecting to the AI provider. Please check the server logs.",
      completed_features: [],
      pending_features: ["Analysis Error"]
    };
  }
}
