import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import dotenv from "dotenv";

dotenv.config();

// Initialize a dedicated Octokit client for this module
const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: process.env.APP_ID,
    privateKey: process.env.PRIVATE_KEY,
    installationId: process.env.INSTALLATION_ID
  }
});

/**
 * Fetch intent.md rules from the repository.
 * Checks root first, then 'Node Backend/' folder.
 */
export async function fetchIntentRules(owner, repo) {
  // Helper function to try fetching a specific path
  const tryFetch = async (path) => {
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
      });
      // GitHub API returns content in base64
      return Buffer.from(data.content, "base64").toString("utf-8");
    } catch (error) {
      return null; // Return null if not found
    }
  };

  try {
    console.log(`🔍 Looking for intent.md in ${owner}/${repo}...`);

    // 1. Try finding it in the ROOT directory
    let content = await tryFetch("intent.md");
    
    // 2. If not found, try inside "Node Backend" folder
    if (!content) {
      console.log("   Not found in root. Checking 'Node Backend/intent.md'...");
      content = await tryFetch("Node Backend/intent.md");
    }

    // 3. If found, return it
    if (content) {
      console.log("✅ Found intent.md!");
      return content;
    }

    // 4. If neither found, throw error to trigger fallback
    throw new Error("File not found in root or 'Node Backend/'");

  } catch (error) {
    console.warn("⚠️ intent.md lookup failed. Using default rules.");
    return `
Default Intent Rules (Fallback):
1. Security: No hardcoded secrets.
2. Quality: Code must be clean and commented.
3. Purpose: PR must align with the repository goal.
`;
  }
}

/**
 * Fetch file changes and patches for a pull request
 */
export async function fetchPRChanges(owner, repo, pullNumber) {
  try {
    const files = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber,
      per_page: 100
    });

    return files.data
      .map(file => {
        return `
FILE: ${file.filename}
STATUS: ${file.status}
PATCH:
${file.patch || "No diff available (Large or Binary file)"}
`;
      })
      .join("\n");
  } catch (error) {
    console.error("❌ Error fetching PR changes:", error.message);
    return "Error fetching file changes.";
  }
}
