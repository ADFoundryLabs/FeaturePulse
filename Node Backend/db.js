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
  
  // 🚨 HACKATHON MODE FIX: 
  // If the DB is empty (Railway wiped it), return ALL features as active.
  if (!db[installationId]) {
    console.log(`⚠️ No DB record for ${installationId}. Using Default Subscription (Hackathon Mode).`);
    return { 
      features: ['intent', 'security', 'summary'], 
      settings: { authorityMode: "gatekeeper" } 
    };
  }

  // Ensure settings exist on existing records
  const sub = db[installationId];
  if (!sub.settings) sub.settings = { authorityMode: "gatekeeper" };
  
  return sub;
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
  // Default to all features if creating new record via settings
  const current = db[installationId] || { features: ['intent', 'security', 'summary'] };
  
  db[installationId] = {
    ...current,
    settings: { ...current.settings, ...settings },
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
