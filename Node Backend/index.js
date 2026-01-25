import express from "express";
import crypto from "crypto";
import dotenv from "dotenv";
import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

dotenv.config();

const app = express();

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: process.env.APP_ID,
    privateKey: process.env.PRIVATE_KEY,
    installationId: process.env.INSTALLATION_ID
  }
});

/**
 * Decision based on AI confidence score
 */
function decideFromConfidence(score) {
  if (score < 50) {
    return { decision: "BLOCK", conclusion: "failure" };
  }
  if (score < 80) {
    return { decision: "WARN", conclusion: "neutral" };
  }
  return { decision: "APPROVE", conclusion: "success" };
}

app.post("/webhook", async (req, res) => {
  console.log(
    "📩 Webhook received:",
    req.headers["x-github-event"],
    req.body.action
  );

  // Verify webhook signature
  const signature = req.headers["x-hub-signature-256"];
  const hmac = crypto.createHmac("sha256", process.env.WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(req.rawBody).digest("hex");

  if (signature !== digest) {
    return res.status(401).send("Invalid signature");
  }

  const event = req.headers["x-github-event"];

  if (
    event === "pull_request" &&
    ["opened", "synchronize", "reopened"].includes(req.body.action)
  ) {
    try {
      const pr = req.body.pull_request;
      const [owner, repo] = req.body.repository.full_name.split("/");
      const targetBranch = pr.base.ref;

      // 🔜 TEMP MOCK (will come from ai.js)
      const aiResult = {
        intent: "Documentation Update",
        confidence: 82,
        reason: "PR modifies markdown files and aligns with intent.md rules."
      };

      const { decision, conclusion } = decideFromConfidence(aiResult.confidence);

      // Create GitHub Check
      await octokit.checks.create({
        owner,
        repo,
        name: "FeaturePulse",
        head_sha: pr.head.sha,
        status: "completed",
        conclusion,
        output: {
          title: `FeaturePulse Decision: ${decision}`,
          summary: `Intent: ${aiResult.intent}\nConfidence: ${aiResult.confidence}%\n\n${aiResult.reason}`
        }
      });

      // Create PR Comment
      await octokit.issues.createComment({
        owner,
        repo,
        issue_number: pr.number,
        body: `### 🤖 FeaturePulse AI Intent Analysis

**Detected Intent:** ${aiResult.intent}  
**Confidence Score:** ${aiResult.confidence}%  
**Decision:** ${decision}  
**Target Branch:** \`${targetBranch}\`

${aiResult.reason}
`
      });

      console.log("✅ FeaturePulse intent analysis posted");
    } catch (err) {
      console.error("❌ FeaturePulse error:", err.message);
    }
  }

  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
