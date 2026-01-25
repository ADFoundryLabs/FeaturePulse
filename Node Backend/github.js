
import dotenv from "dotenv";

dotenv.config();

// Initialize a dedicated Octokit client for this module


/**
 * Fetch intent.md rules from the repository.
 * Priority:
 * 1. .featurepulse/intent.md (Standard Config)
 * 2. Search entire repo for 'intent.md' (Fallback)
 */
export async function fetchIntentRules(owner, repo) {
  // Helper to fetch content of a specific path
  const fetchContent = async (path) => {
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
      });
      // GitHub API returns content in base64
      return Buffer.from(data.content, "base64").toString("utf-8");
    } catch (error) {
      return null;
    }
  };

  try {
    console.log(`🔍 Looking for intent.md in ${owner}/${repo}...`);

    // 1. Priority: Check the standard configuration directory
    const configPath = ".featurepulse/intent.md";
    let content = await fetchContent(configPath);
    
    if (content) {
      console.log(`✅ Found intent at ${configPath}`);
      return content;
    }

    // 2. Fallback: Search the entire codebase
    console.log("   Not found in .featurepulse/. Searching entire repository...");
    const foundPath = await searchRepoForFile(owner, repo, "intent.md");

    if (foundPath) {
      console.log(`✅ Found intent via search at: ${foundPath}`);
      content = await fetchContent(foundPath);
      return content;
    }

    // 3. If absolutely nothing is found, throw error to trigger defaults
    throw new Error("File not found in .featurepulse/ or via recursive search.");

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
 * Recursively searches the repository tree for a specific filename.
 * Uses the Git Tree API for efficiency.
 */
async function searchRepoForFile(owner, repo, filename) {
  try {
    // 1. Get the default branch (usually master/main)
    const { data: repoData } = await octokit.repos.get({ owner, repo });
    const defaultBranch = repoData.default_branch;

    // 2. Get the recursive tree for that branch
    const { data: treeData } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: defaultBranch,
      recursive: "1", // This enables recursive fetching
    });

    if (treeData.truncated) {
      console.warn("⚠️ Repository is too large; file search may be incomplete.");
    }

    // 3. Filter for the file
    const matches = treeData.tree
      .filter(item => item.path.endsWith(filename))
      // Filter out garbage directories
      .filter(item => !item.path.includes("node_modules/") && 
                      !item.path.includes("vendor/") &&
                      !item.path.includes("dist/") &&
                      !item.path.includes(".git/"));

    if (matches.length === 0) return null;

    // 4. Sort matches by path length (assume shorter path = closer to root = more relevant)
    matches.sort((a, b) => a.path.length - b.path.length);

    // Return the path of the best match
    return matches[0].path;

  } catch (error) {
    console.error("❌ Error searching repository tree:", error.message);
    return null;
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
