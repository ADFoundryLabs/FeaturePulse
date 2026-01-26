import { useState, useEffect } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import Pricing from './components/Pricing'
import IntentRules from './components/IntentRules'
import './App.css'

function App() {
  const [installationId, setInstallationId] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const urlId = queryParams.get('installation_id');

    // Case 1: New Installation Redirect (Always valid initially)
    if (urlId) {
      localStorage.setItem('fp_installation_id', urlId);
      setInstallationId(urlId);
      window.history.replaceState({}, document.title, window.location.pathname);
      setActiveTab('pricing');
    } 
    // Case 2: Returning User (Check if ID is still valid)
    else {
      const storedId = localStorage.getItem('fp_installation_id');
      if (storedId) {
        // Verify with backend
        fetch(`http://localhost:3000/api/installation-status/${storedId}`)
          .then(res => res.json())
          .then(data => {
            if (data.valid) {
              setInstallationId(storedId);
            } else {
              console.log("⚠️ Installation not found (Uninstalled). Clearing session.");
              localStorage.removeItem('fp_installation_id');
              setInstallationId(null);
            }
          })
          .catch(err => {
            console.error("Verification failed:", err);
            // Fallback: If backend is down, we might want to keep the session 
            // or clear it. Here we keep it to prevent accidental logouts.
            setInstallationId(storedId); 
          });
      }
    }
  }, [])

  return (
    <div className="app">
      <Header 
        installationId={installationId} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      <main className="main-content">
        {!installationId ? (
          <div className="landing-page">
            <div className="hero">
              <h1>Automated Gatekeeper for Your Pull Requests</h1>
              <p>Enforce product intent and security rules before code merges.</p>
              
              <div className="install-action">
                {/* Replace with your actual GitHub App URL */}
                <a href="https://github.com/apps/featurepulse-bot/installations/new" className="install-button primary">
                  Install FeaturePulse on GitHub
                </a>
              </div>
            </div>
            
            <div className="features-grid">
              <div className="feature-card">
                <h3>🤖 AI Intent Analysis</h3>
                <p>Ensures PRs align with your product goals (intent.md).</p>
              </div>
              <div className="feature-card">
                <h3>🛡️ Security Guardrails</h3>
                <p>Auto-detects vulnerabilities and sensitive file changes.</p>
              </div>
              <div className="feature-card">
                <h3>⚡ Redundancy Checks</h3>
                <p>Prevents duplicate code and feature bloat.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <Dashboard installationId={installationId} />}
            {activeTab === 'pricing' && <Pricing installationId={installationId} />}
            {activeTab === 'rules' && <IntentRules installationId={installationId} />}
          </>
        )}
      </main>
    </div>
  )
}

export default App
