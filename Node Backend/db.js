import fs from 'fs';
import path from 'path';

// Define the file path (saves in the backend folder)
const DB_FILE = path.resolve('data.json');

// Initialize DB file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({}));
}

/**
 * Read the entire database
 */
function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

/**
 * Write data to database
 */
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

/**
 * Get active features for an installation
 */
export function getSubscription(installationId) {
  const db = readDB();
  return db[installationId] || { features: [] }; // Default: No features
}

/**
 * Update active features for an installation
 */
export function updateSubscription(installationId, newFeatures) {
  const db = readDB();
  
  // Merge new features with existing ones (avoid duplicates)
  const currentFeatures = db[installationId]?.features || [];
  const combinedFeatures = [...new Set([...currentFeatures, ...newFeatures])];

  db[installationId] = {
    features: combinedFeatures,
    updatedAt: Date.now()
  };

  writeDB(db);
  console.log(`💾 DB Updated: Installation ${installationId} now has [${combinedFeatures}]`);
}
