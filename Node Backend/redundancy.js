/**
 * Calculates Levenshtein distance between two strings.
 * Used to find similar filenames (e.g., "login.js" vs "login-user.js").
 */
function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1,   // insertion
            matrix[i - 1][j] + 1    // deletion
          )
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Analyzes PR changes against existing files to detect redundancy.
 * * @param {string} prFilesDiff - The output string from fetchPRChanges
 * @param {string[]} existingFilePaths - List of all files in the repo
 */
export function analyzeRedundancy(prFilesDiff, existingFilePaths) {
  const redundancyWarnings = [];
  
  // 1. Parse new filenames from the diff text
  // Looking for "FILE: path/to/file.js" headers from github.js output
  const newFilesRegex = /FILE: (.*)/g;
  const newFiles = [];
  let match;
  while ((match = newFilesRegex.exec(prFilesDiff)) !== null) {
    const filename = match[1].trim();
    // Only check if it's not a deletion (simple check)
    newFiles.push(filename);
  }

  // 2. Compare each new file against existing repository files
  newFiles.forEach((newFile) => {
    const newBaseName = newFile.split('/').pop(); // e.g., "login.js"
    
    existingFilePaths.forEach((existingFile) => {
      // Skip if it's the same file (modification)
      if (existingFile === newFile) return;

      const existingBaseName = existingFile.split('/').pop();

      // HEURISTIC 1: Exact filename match in different directory
      if (newBaseName === existingBaseName) {
        redundancyWarnings.push(
          `Potential Duplicate: '${newFile}' has the same filename as existing '${existingFile}'. Check if this functionality is redundant.`
        );
        return;
      }

      // HEURISTIC 2: High similarity (Levenshtein)
      // Only check if strings are somewhat similar in length to avoid noise
      if (Math.abs(newBaseName.length - existingBaseName.length) < 3) {
        const distance = levenshtein(newBaseName, existingBaseName);
        // If they differ by fewer than 3 characters (e.g., userAuth.js vs user-auth.js)
        if (distance <= 3 && distance > 0) {
           redundancyWarnings.push(
            `Naming Conflict: '${newFile}' is very similar to existing '${existingFile}'.`
          );
        }
      }
    });
  });

  return redundancyWarnings;
}
