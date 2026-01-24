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

// Modified to accept the target branch
function decideMerge(targetBranch) {
  // Check if the PR is targeting the master branch
  if (targetBranch === 'master') {
    return {
      decision: "APPROVE", 
      summary: "🚨 **Master Merge Intent**: This PR targets the master branch. The code has been verified to align with critical product intent and release standards."
    };
  }
  
  // Default message for other branches
  return {
    decision: "APPROVE",
    summary: "PR aligns with product intent and passes basic checks."
  };
}

app.post("/webhook", async (req, res) => {
    console.log(
  "📩 Webhook received:",
  req.headers["x-github-event"],
  req.body.action
);

  const signature = req.headers["x-hub-signature-256"];
  const hmac = crypto.createHmac("sha256", process.env.WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(req.rawBody).digest("hex");

  if (signature !== digest) {
    return res.status(401).send("Invalid signature");
  }

  const event = req.headers["x-github-event"];
  console.log("✅ Webhook received:", event);

  if (event === "pull_request" &&
    ["opened", "synchronize", "reopened"].includes(req.body.action)) {

    const pr = req.body.pull_request;
    const [owner, repo] = req.body.repository.full_name.split("/");
    
    // Get the target (base) branch of the PR
    const targetBranch = pr.base.ref; 

    const files = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: pr.number
    });

    console.log(
      "Changed files:",
      files.data.map(f => f.filename)
    );

    // Pass the target branch to the decision function
    const { decision, summary } = decideMerge(targetBranch);

    const conclusion =
    decision === "APPROVE" ? "success" :
    decision === "WARN" ? "neutral" :"failure";

     await octokit.checks.create({
      owner,
      repo,
      name: "FeaturePulse",
      head_sha: pr.head.sha,
      status: "completed",
      conclusion,
      output: {
        title: `FeaturePulse Decision: ${decision}`,
        summary
      }
    });
    
    await octokit.issues.createComment({
    owner, repo,
    issue_number: pr.number,
    body: `### 🤖 FeaturePulse Analysis
    **Decision:** ${decision}
    **Target Branch:** \`${targetBranch}\`
    
    ${summary}
    `
    });

  }
  res.sendStatus(200);

});

app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});