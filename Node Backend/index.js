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
import { getSubscription, updateSubscription, deleteSubscription, updateSettings } from "./db.js"; 

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

// --- NEW: INSTALLATION VERIFICATION ENDPOINT ---
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

// --- SETTINGS ENDPOINTS ---

app.post("/api/settings", (req, res) => {
  const { installationId, settings } = req.body;
  if (!installationId || !settings) return res.status(400).send("Missing data");
  
  updateSettings(installationId, settings);
  res.json({ status: "success", settings });
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
  const signature = req.headers["x-hub-signature-256"];
  const hmac = crypto.createHmac("sha256", process.env.WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(req.rawBody).digest("hex");

  if (signature !== digest) return res.status(401).send("Invalid signature");

  const event = req.headers["x-github-event"];
  const action = req.body.action;

  // 1. Handle Uninstalls
  if (event === "installation" && action === "deleted") {
    const installationId = req.body.installation.id;
    console.log(`❌ Installation ${installationId} deleted. Cleaning up DB.`);
    deleteSubscription(installationId);
    return res.sendStatus(200);
  }

  // 2. Handle Pull Requests
  if (event === "pull_request" && ["opened", "synchronize", "reopened"].includes(action)) {
    try {
      const pr = req.body.pull_request;
      const installationId = req.body.installation.id;
      const [owner, repo] = req.body.repository.full_name.split("/");

      const subscription = getSubscription(installationId);
      
      // ==========================================================
      // START OF FIX: Force enable features for testing
      // ==========================================================
      const activeFeatures = ["intent", "security", "summary"]; 
      // const activeFeatures = subscription.features; // <--- Original line commented out
      // ==========================================================

      const authorityMode = subscription.settings?.authorityMode || "gatekeeper";

      console.log(`Checking Subscription for ${installationId}:`, activeFeatures);

      if (activeFeatures.length === 0) {
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
          summary: "FeaturePulse is checking product intent and security."
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

      // --- MERGE AUTHORITY ENFORCEMENT ---
      let conclusion = "success"; // Default to passing
      let decisionDisplay = aiResult.decision;

      if (aiResult.decision === "BLOCK") {
        if (authorityMode === "gatekeeper") {
          // Gatekeeper: BLOCK means FAIL check (red X)
          conclusion = "failure";
        } else if (authorityMode === "advisory") {
          // Advisory: BLOCK means WARN (green check, but warning text)
          conclusion = "success"; // Or 'neutral'
          decisionDisplay = "WARN (Advisory Override)";
          aiResult.summary = `**⚠️ [ADVISORY MODE]** FeaturePulse recommends **BLOCK**, but merge is allowed in Advisory mode.\n\n${aiResult.summary}`;
        }
      } 
      // Auto-approve logic is implicit: 'success' allows merge.

      await octokit.checks.create({
        owner,
        repo,
        name: "FeaturePulse",
        head_sha: pr.head.sha,
        status: "completed",
        conclusion,
        output: {
          title: `Decision: ${decisionDisplay}`,
          summary: aiResult.summary,
          text: "See PR comment for details."
        }
      });

      const commentBody = `## 🤖 FeaturePulse Analysis
**Authority Mode:** ${authorityMode.toUpperCase()}
**Decision:** ${decisionDisplay}

### 📝 Executive Summary
${aiResult.summaries?.standard || "Not available"}

### 👶 Simple Explanation
${aiResult.summaries?.simple || "Not available"}

### 🧑‍💻 Developer Details
${aiResult.summaries?.developer || "Not available"}
`;

      await octokit.issues.createComment({
        owner,
        repo,
        issue_number: pr.number,
        body: `## 🤖 FeaturePulse Analysis\n\n**Authority Mode:** ${authorityMode.toUpperCase()}\n\n${aiResult.summary}`
      });

    } catch (err) {
      console.error("Webhook Error:", err);
    }
  }
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
