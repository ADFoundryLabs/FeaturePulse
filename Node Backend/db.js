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
  return db[installationId] || { features: [] };
}

export function updateSubscription(installationId, features) {
  const db = loadDB();
  db[installationId] = { features, updatedAt: new Date().toISOString() };
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
