/**
 * Security Analysis Module (GuardPulse Layer)
 * Implements FR-4: Dependency Vulnerability Scanning & Sensitive Module Detection
 */

const OSV_QUERY_URL = "https://api.osv.dev/v1/query";

// FR-4.2: Sensitive Module Detection Patterns
const SENSITIVE_PATTERNS = [
  /auth/i, /login/i, /password/i, /secret/i, /credential/i, // Authentication
  /\.env/i, /config\.js/i, /secrets/i, // Configuration
  /payment/i, /stripe/i, /billing/i, // Payments
  /crypto/i, /encrypt/i, /decrypt/i, // Cryptography
  /database/i, /schema/i // Data persistence
];

/**
 * Main entry point for security analysis
 * @param {string} diffText - The full diff string from the PR
 */
export async function analyzeSecurity(diffText) {
  // 1. Parse changed files from the custom "FILE: " format in diffText
  const files = parseFilesFromDiff(diffText);
  
  // 2. Detect Sensitive Files
  const sensitiveFiles = files.filter(file => 
    SENSITIVE_PATTERNS.some(pattern => pattern.test(file))
  );

  // 3. Scan Dependencies (currently supports package.json for MVP)
  const vulnerabilities = await scanNPMDependencies(diffText);

  // 4. Calculate Risk Score (FR-4.3)
  let riskLevel = "LOW";

  if (vulnerabilities.length > 0) {
    // If any vulnerability is found, bump to at least HIGH
    // Ideally we check specific severity from OSV, but assuming HIGH for found CVEs in MVP
    riskLevel = "HIGH"; 
    // If we had detailed severity, we would check for "CRITICAL" here
  } else if (sensitiveFiles.length > 0) {
    riskLevel = "MEDIUM";
  }

  return {
    riskLevel, // LOW, MEDIUM, HIGH, CRITICAL
    sensitiveFiles,
    vulnerabilities // Array of { package, version, id, summary }
  };
}

/**
 * Extract filenames from the diff text format used in github.js
 */
function parseFilesFromDiff(diffText) {
  const regex = /FILE: (.*)/g;
  const files = [];
  let match;
  while ((match = regex.exec(diffText)) !== null) {
    files.push(match[1].trim());
  }
  return files;
}

/**
 * Heuristic parser for package.json changes in diff
 */
async function scanNPMDependencies(diffText) {
  const vulns = [];
  
  // Split diff into file sections
  const sections = diffText.split("FILE: ");

  for (const section of sections) {
    // Only look at package.json files
    const firstLine = section.split("\n")[0].trim();
    if (!firstLine.endsWith("package.json")) continue;

    // Regex to find added lines that look like: + "package": "version"
    // This is a simplified regex for MVP
    const addedLineRegex = /^\+\s*"([^"]+)"\s*:\s*"([^"]+)"/gm;
    
    let match;
    while ((match = addedLineRegex.exec(section)) !== null) {
      const pkgName = match[1];
      const rawVersion = match[2];
      
      // Clean version string (remove ^, ~, v)
      const version = rawVersion.replace(/[\^~=v]/g, "");

      // Query OSV Database
      const vuln = await checkOSV(pkgName, version, "npm");
      if (vuln) {
        vulns.push(vuln);
      }
    }
  }
  return vulns;
}

/**
 * Query OSV API for vulnerabilities
 */
async function checkOSV(name, version, ecosystem) {
  try {
    const response = await fetch(OSV_QUERY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        version,
        package: { name, ecosystem }
      })
    });

    const data = await response.json();

    if (data.vulns && data.vulns.length > 0) {
      // Return the first/most relevant vulnerability found
      const v = data.vulns[0];
      return {
        package: name,
        version: version,
        id: v.id,
        severity: "HIGH", // Defaulting to HIGH for detection in MVP
        summary: v.summary || "Known vulnerability detected"
      };
    }
  } catch (error) {
    console.warn(`⚠️ OSV Check failed for ${name}:`, error.message);
  }
  return null;
}
