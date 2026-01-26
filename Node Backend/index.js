import express from "express";
import crypto from "crypto";
import dotenv from "dotenv";
import cors from "cors";
import Razorpay from "razorpay";
import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

import { fetchIntentRules, fetchPRChanges, fetchRepoStructure } from "./github.js";
import { analyzeWithAI } from "./ai.js";
import { analyzeSecurity } from "./security.js";
import { analyzeRedundancy } from "./redundancy.js";
// Removed updateSettings import
import { getSubscription, updateSubscription, deleteSubscription } from "./db.js"; 

dotenv.config();

const app = express();
app.use(cors());

// Webhook signature verification
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PRICES = { intent: 499, security: 499, summary: 299 };

// --- INSTALLATION VERIFICATION ---
app.get("/api/installation-status/:id", async (req, res) => {
  try {
    const appOctokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: process.env.APP_ID,
        privateKey: process.env.PRIVATE_KEY,
      },
    });

    await appOctokit.apps.getInstallation({
      installation_id: req.params.id,
    });

    res.json({ valid: true });
  } catch (error) {
    res.json({ valid: false });
  }
});

// --- PAYMENT ENDPOINTS ---

app.post("/api/create-order", async (req, res) => {
  try {
    const { features, installationId } = req.body;
    if (!installationId) return res.status(400).json({ error: "Missing Installation ID" });
    
    let totalAmount = 0;
    features.forEach(f => { if (PRICES[f]) totalAmount += PRICES[f]; });

    if (features.length === 3) totalAmount = Math.floor(totalAmount * 0.8);

    const options = {
      amount: totalAmount * 100, // paise
      currency: "INR",
      receipt: `rcpt_${installationId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).send("Error creating order");
  }
});

app.post("/api/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, features, installationId } = req.body;

  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest("hex");

  if (generated_signature === razorpay_signature) {
    updateSubscription(installationId, features);
    res.json({ status: "success" });
  } else {
    res.status(400).json({ status: "failure" });
  }
});

app.get("/api/subscription/:id", (req, res) => {
  const sub = getSubscription(req.params.id);
  res.json(sub);
});

// --- GITHUB WEBHOOK ---

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
  console.log("🔔 Webhook received!"); 

  const signature = req.headers["x-hub-signature-256"];
  const hmac = crypto.createHmac("sha256", process.env.WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(req.rawBody).digest("hex");

  if (signature !== digest) {
    console.error("❌ Invalid Signature");
    return res.status(401).send("Invalid signature");
  }

  const event = req.headers["x-github-event"];
  const action = req.body.action;
  console.log(`Event: ${event}, Action: ${action}`);

  // 1. Handle Uninstalls
  if (event === "installation" && action === "deleted") {
    const installationId = req.body.installation.id;
    console.log(`❌ Installation ${installationId} deleted.`);
    deleteSubscription(installationId);
    return res.sendStatus(200);
  }

  // 2. Handle Pull Requests
  if (event === "pull_request" && ["opened", "synchronize", "reopened"].includes(action)) {
    try {
      const pr = req.body.pull_request;
      const installationId = req.body.installation.id;
      const [owner, repo] = req.body.repository.full_name.split("/");

      console.log(`Processing PR #${pr.number} for ${owner}/${repo}`);

      const subscription = getSubscription(installationId);
      const activeFeatures = subscription.features;

      console.log(`Features: ${activeFeatures}`);

      if (!activeFeatures || activeFeatures.length === 0) {
        console.log("⚠️ No active subscription. Skipping analysis.");
        return res.sendStatus(200);
      }

      const octokit = getInstallationOctokit(installationId);
      
      // Post "Pending" status
      await octokit.checks.create({
        owner,
        repo,
        name: "FeaturePulse",
        head_sha: pr.head.sha,
        status: "in_progress",
        output: {
          title: "Analyzing...",
          summary: "FeaturePulse is checking product intent, security, and redundancy."
        }
      });

      const intentRules = await fetchIntentRules(octokit, owner, repo);
      const prChanges = await fetchPRChanges(octokit, owner, repo, pr.number);

      let redundancyResult = [];
      try {
        const existingFiles = await fetchRepoStructure(octokit, owner, repo, pr.base.ref);
        redundancyResult = analyzeRedundancy(prChanges, existingFiles);
      } catch (err) {
        console.error("Redundancy check failed:", err);
      }

      let securityResult = { riskLevel: "UNKNOWN", sensitiveFiles: [], vulnerabilities: [] };
      if (activeFeatures.includes('security')) {
        securityResult = await analyzeSecurity(prChanges);
      }

      const aiInput = { title: pr.title, body: pr.body, features: activeFeatures };
      let aiResult = await analyzeWithAI(
          intentRules, 
          aiInput, 
          prChanges, 
          securityResult, 
          redundancyResult
      );

      // --- STANDARD DECISION LOGIC (No Authority Overrides) ---
      let conclusion = aiResult.decision === "BLOCK" ? "failure" : "success";

      console.log(`Final Decision: ${aiResult.decision} (Conclusion: ${conclusion})`);

      await octokit.checks.create({
        owner,
        repo,
        name: "FeaturePulse",
        head_sha: pr.head.sha,
        status: "completed",
        conclusion,
        output: {
          title: `Decision: ${aiResult.decision}`,
          summary: aiResult.summary,
          text: "See PR comment for details."
        }
      });

      await octokit.issues.createComment({
        owner,
        repo,
        issue_number: pr.number,
        body: `## 🤖 FeaturePulse Analysis\n\n${aiResult.summary}`
      });

    } catch (err) {
      console.error("Webhook Error:", err);
    }
  }
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
