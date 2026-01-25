import express from "express";
import crypto from "crypto";
import dotenv from "dotenv";
import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

import { fetchIntentRules } from "./github.js";
import { analyzeWithAI } from "./ai.js";

dotenv.config();

const app = express();

// REQUIRED for GitHub signature verification
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);

// GitHub App auth
const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: process.env.APP_ID,
    privateKey: process.env.PRIVATE_KEY,
    installationId: process.env.INSTALLATION_ID
  }
});

app.post("/webhook", async (req, res) => {
  const signature = req.headers["x-hub-signature-256"];
  const hmac = crypto.createHmac("sha256", process.env.WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(req.rawBody).digest("hex");

  if (signature !== digest) {
    return res.status(401).send("Invalid signature");
  }

  const event = req.headers["x-github-event"];
  const action = req.body.action;

  console.log("📩 Webhook:", event, action);

  if (
    event === "pull_request" &&
    ["opened", "synchronize", "reopened"].includes(action)
  ) {
    try {
      const pr = req.body.pull_request;
      const [owner, repo] = req.body.repository.full_name.split("/");

      // 1️⃣ Read intent.md
      const intentRules = await fetchIntentRules(owner, repo);

      // 2️⃣ Get PR diff
      const diffResponse = await octokit.pulls.get({
        owner,
        repo,
        pull_number: pr.number,
        mediaType: { format: "diff" }
      });

      const diffText = diffResponse.data;

      // 3️⃣ AI analysis
      const aiResult = await analyzeWithAI(
        intentRules,
        {
          title: pr.title,
          body: pr.body
        },
        diffText
      );

      const score = parseInt(aiResult.completion_score);

      let conclusion = "failure";
      if (score >= 80) conclusion = "success";
      else if (score >= 50) conclusion = "neutral";

      // 4️⃣ Create GitHub Check
      await octokit.checks.create({
        owner,
        repo,
        name: "FeaturePulse",
        head_sha: pr.head.sha,
        status: "completed",
        conclusion,
        output: {
          title: `Intent Completion: ${aiResult.completion_score}`,
          summary: aiResult.summary,
          text: `
### ✅ Completed Features
${aiResult.completed_features.map(f => `- ${f}`).join("\n")}

### ⚠️ Pending Features
${aiResult.pending_features.map(f => `- ${f}`).join("\n")}
          `
        }
      });

      // 5️⃣ Comment on PR
      await octokit.issues.createComment({
        owner,
        repo,
        issue_number: pr.number,
        body: `
## 🤖 FeaturePulse Intent Analysis

**Completion Score:** ${aiResult.completion_score}  
**Decision:** ${aiResult.decision}

### Summary
${aiResult.summary}
        `
      });

      console.log("✅ FeaturePulse analysis posted");

    } catch (err) {
      console.error("❌ FeaturePulse error:", err.message);
    }
  }

  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("🚀 FeaturePulse running on port 3000");
});
