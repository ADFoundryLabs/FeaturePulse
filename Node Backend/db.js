import fs from 'fs';
import path from 'path';

const DB_FILE = path.resolve('data.json');

// Initialize DB file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({}));
}

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (error) {
    return {};
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export function getSubscription(installationId) {
  const db = readDB();
  return db[installationId] || { features: [] };
}

export function updateSubscription(installationId, newFeatures) {
  const db = readDB();
  const currentFeatures = db[installationId]?.features || [];
  // Merge and remove duplicates
  const combinedFeatures = [...new Set([...currentFeatures, ...newFeatures])];

  db[installationId] = {
    features: combinedFeatures,
    updatedAt: Date.now()
  };

  writeDB(db);
  console.log(`💾 DB Updated: Installation ${installationId} has features: ${combinedFeatures}`);
}