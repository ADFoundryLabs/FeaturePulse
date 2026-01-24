import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import dotenv from "dotenv";

dotenv.config();

export const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: process.env.APP_ID,
    privateKey: process.env.PRIVATE_KEY,
    installationId: process.env.INSTALLATION_ID
  }
});

export async function fetchIntentRules(owner, repo) {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: "intent.md",
    });
    return Buffer.from(data.content, "base64").toString("utf-8");
  } catch (error) {
    console.warn("⚠️ intent.md not found. Using default rules.");
    return "Rule: Ensure code is clean, well-documented, and safe.";
  }
}