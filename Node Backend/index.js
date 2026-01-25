import express from "express";
import crypto from "crypto";
importHv dotenv from "dotenv";
import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

import { fetchIntentRules, fetchPRChanges } from "./github.js";
import { analyzeWithAI } from "./ai.js";
import { analyzeSecurity } from "./security.js"; // Import Security Module

dotenv.config();

const app = express();

/**
 * REQUIRED for GitHub webhook signature verification
 */
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);

/**
 * Create Octokit for a specific installation
 */
function getInstallationOctokit(installationId) {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.APP_ID,
      privateKey: process.env.PRIVATE_KEY,
      installationId
    }
  });
}

app.post("/webhook", async (req, res) => {
  const signature = req.headers["x-hub-signature-256"];
  const hmac = crypto.createHmac("sha256", process.env.WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(req.rawBody).digest("hex");

  if (signature !== digest) {
    console.warn("❌ Invalid webhook signature");
    return res.status(401).send("Invalid signature");
  }

  const event = req.headers["x-github-event"];
  const action = req.body.action;

  console.log("📩 Webhook received:", event, action);

  if (
    event === "pull_request" &&
    ["opened", "synchronize", "reopened"].includes(action)
  ) {
    try {
      const pr = req.body.pull_request;
      const installationId = req.body.installation.id;
      const [owner, repo] = req.body.repository.full_name.split("/");

      // 🔐 Create installation-scoped Octokit
      const octokit = getInstallationOctokit(installationId);

      // 1️⃣ Read intent.md
      const intentRules = await fetchIntentRules(octokit, owner, repo);

      // 2️⃣ Read PR file changes
      const prChanges = await fetchPRChanges(
        octokit,
        owner,
        repo,
        pr.number
      );

      // 3️⃣ NEW: Security Analysis (GuardPulse)
      console.log("🛡️ Running Security Scan...");
      const securityResult = await analyzeSecurity(prChanges);
      console.log("   Security Risk:", securityResult.riskLevel);

      // 4️⃣ AI Analysis (Intent + Security Context)
      console.log("wf Running AI Analysis...");
      const aiResult = await analyzeWithAI(
        intentRules,
        {
          title: pr.title,
          body: pr.body
        },
        prChanges,
        securityResult // Pass security context to AI
      );

      // Map AI decision to GitHub Check conclusion
      let conclusion = "neutral";
      if (aiResult.decision === "APPROVE") conclusion = "success";
      else if (aiResult.decision === "BLOCK") conclusion = "failure";

      // 5️⃣ Create GitHub Check
      await octokit.checks.create({
        owner,
        repo,
        name: "FeaturePulse",
        head_sha: pr.head.sha,
        status: "completed",
        conclusion,
        output: {
          title: `Decision: ${aiResult.decision}`,
          summary: `Risk: ${aiResult.security_risk} | Intent Score: ${aiResult.completion_score}`,
          text: `
### 🛡️ FeaturePulse Decision: ${aiResult.decision}

**Reasoning:**
${aiResult.summary}

---
### 🔒 Security Analysis (GuardPulse)
* **Risk Level:** ${securityResult.riskLevel}
* **Sensitive Files:** ${securityResult.sensitiveFiles.length ? securityResult.sensitiveFiles.join(", ") : "None"}
* **Vulnerabilities:** ${securityResult.vulnerabilities.length > 0 ? "⚠️ Found " + securityResult.vulnerabilities.length + " vulnerabilities" : "✅ None detected"}

### ✅ Intent Alignment
${aiResult.completed_features.map(f => `- ${f}`).join("\n")}

### ⚠️ Missing / Pending
${aiResult.pending_features.map(f => `- ${f}`).join("\n")}
          `
        }
      });

      // 6️⃣ Comment on PR
      await octokit.issues.createComment({
        owner,
        repo,
        issue_number: pr.number,
        body: `
## 🤖 FeaturePulse Analysis

| Metric | Result |
|--------|--------|
| **Decision** | **${aiResult.decision}** |
| **Intent Score** | ${aiResult.completion_score} |
| **Security Risk** | ${aiResult.security_risk} |

### Summary
${aiResult.summary}

---
_Analyzed by FeaturePulse (GuardPulse Layer Active)_
        `
      });

      console.log("✅ FeaturePulse analysis completed");

    } catch (err) {
      console.error("❌ FeaturePulse error:", err.message);
      if (err.response) {
        console.error("GitHub API error:", err.response.data);
      }
    }
  }

  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("🚀 FeaturePulse running on port 3000");
});
