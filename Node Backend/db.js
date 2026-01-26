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
  
  // 🚨 HACKATHON MODE (Stability Fix): 
  // If the DB is empty (Railway wiped it), return default active features.
  if (!db[installationId]) {
    console.log(`⚠️ No DB record for ${installationId}. Using Default Subscription.`);
    return { features: ['intent', 'security', 'summary'] };
  }
  
  return db[installationId];
}

export function updateSubscription(installationId, features) {
  const db = loadDB();
  const current = db[installationId] || {};
  
  db[installationId] = { 
    ...current,
    features, 
    updatedAt: new Date().toISOString() 
  };
  saveDB(db);
}

export function deleteSubscription(installationId) {
  const db = loadDB();
  if (db[installationId]) {
    delete db[installationId];
    saveDB(db);
    return true;
  }
  return false;
}
