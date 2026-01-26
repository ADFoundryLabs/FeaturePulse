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

  // --- STRICT PRD PROMPT ---
  const prompt = `
  You are 'FeaturePulse', a Product Compliance & Security Bot.
  
  YOUR GOAL:
  Compare the [CODE CHANGES] against the [PRD / INTENT RULES].
  You MUST generate a structured report.
  
  ---
  [1. PRD / INTENT RULES]
  ${intentRules}
  
  [2. SECURITY REPORT]
  ${securityContext}

  [3. REDUNDANCY REPORT]
  ${redundancyContext}

  [4. PR METADATA]
  Title: ${prDetails.title}
  Description: ${prDetails.body || "No description provided."}
  
  [5. CODE DIFF]
  ${fileChanges.substring(0, 15000)} ... (truncated)
  ---

  [DECISION LOGIC]
  1. BLOCK: If Security is HIGH/CRITICAL OR Intent Match < 50%.
  2. WARN: If Intent Match < 80% OR Redundancy found.
  3. APPROVE: If Intent Match > 80% AND Security LOW.

  RESPONSE FORMAT (JSON ONLY):
  {
    "decision": "APPROVE" | "WARN" | "BLOCK",
    "completion_score": "Percentage (e.g., '85%')",
    "summary": "MARKDOWN STRING containing the report below"
  }

  For the 'summary' field, generate a Markdown string with EXACTLY this structure:

  ### 📝 Executive Summary
  (A 2-sentence summary of what this PR does and if it meets the PRD goals.)

  ### 📋 PRD Compliance
  * ✅ **Implemented:** (List features from the PRD that are present)
  * ⚠️ **Missing/Incomplete:** (List features from the PRD that are missing)
  * 🛑 **Out of Scope:** (List features added that were NOT in the PRD)

  ### 🛡️ Security & Quality
  * **Security Risk:** ${securityResult.riskLevel}
  * **Vulnerabilities:** (Summarize findings from Security Report)
  * **Redundancy:** (Summarize findings from Redundancy Report)

  ### 💡 Recommendations
  (Actionable advice for the developer)
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
          { role: "system", content: "You are a JSON-only API. Output strictly valid JSON." },
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
    
    // Fallback: If AI fails to generate a summary, create a basic one
    if (!parsed.summary) {
      parsed.summary = "### ⚠️ Summary Not Generated\nThe AI analyzed the code but failed to generate the text report.";
    }

    return parsed;

  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      completion_score: "0%",
      decision: "WARN",
      summary: `### ⚠️ Analysis Failed\n\n**Error:** ${error.message}\n\nPlease check your server logs and API keys.`
    };
  }
}
