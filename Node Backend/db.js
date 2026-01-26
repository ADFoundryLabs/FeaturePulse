import fs from "fs";
const DB_FILE = "database.json";

function loadDB() {
  if (!fs.existsSync(DB_FILE)) return {};
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export function getSubscription(installationId) {
  const db = loadDB();
  // Default structure now includes settings
  return db[installationId] || { 
    features: [], 
    settings: { authorityMode: "gatekeeper" } // Default to Gatekeeper
  };
}

export function updateSubscription(installationId, features) {
  const db = loadDB();
  const current = db[installationId] || { settings: { authorityMode: "gatekeeper" } };
  
  db[installationId] = { 
    ...current,
    features, 
    updatedAt: new Date().toISOString() 
  };
  saveDB(db);
}

export function updateSettings(installationId, settings) {
  const db = loadDB();
  const current = db[installationId] || { features: [] };
  
  db[installationId] = {
    ...current,
    settings: { ...current.settings, ...settings },
    updatedAt: new Date().toISOString()
  };
  saveDB(db);
}

/**
 * Removes a subscription from the database.
 * Used when the GitHub App is uninstalled.
 */
export function deleteSubscription(installationId) {
  const db = loadDB();
  if (db[installationId]) {
    delete db[installationId];
    saveDB(db);
    return true;
  }
  return false;
}
