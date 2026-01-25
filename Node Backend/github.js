/**
 * Fetch intent.md rules from the repository
 */
export async function fetchIntentRules(octokit, owner, repo) {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: "intent.md",
    });

    return Buffer.from(data.content, "base64").toString("utf-8");
  } catch (error) {
    console.warn("⚠️ intent.md not found. Using default rules.");
    return `
Default Intent Rules:
- Changes must be intentional and documented
- No breaking changes without explanation
- Code should be safe and maintainable
`;
  }
}

/**
 * Fetch file changes and patches for a pull request
 */
export async function fetchPRChanges(octokit, owner, repo, pullNumber) {
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
${file.patch || "No diff available"}
`;
    })
    .join("\n");
}
