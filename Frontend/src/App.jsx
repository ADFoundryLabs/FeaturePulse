import { useState, useEffect } from 'react'
import './App.css'
import IntentRules from './components/IntentRules'
import Dashboard from './components/Dashboard'
import Pricing from './components/Pricing'
import Header from './components/Header'
import { API_BASE_URL } from './services/api' // Ensure this export exists in api.js

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [installationId, setInstallationId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkInstallation = async () => {
      const queryParams = new URLSearchParams(window.location.search)
      const urlId = queryParams.get('installation_id')

      // Case 1: Fresh Install via URL
      if (urlId) {
        localStorage.setItem('fp_installation_id', urlId)
        setInstallationId(urlId)
        window.history.replaceState({}, document.title, window.location.pathname)
        setActiveTab('pricing')
        setLoading(false)
        return
      }

      // Case 2: Returning User - VERIFY ID WITH BACKEND
      const storedId = localStorage.getItem('fp_installation_id')
      if (storedId) {
        try {
          // You must have the /api/installation-status endpoint in backend index.js
          const res = await fetch(`${API_BASE_URL}/api/installation-status/${storedId}`)
          const data = await res.json()

          if (data.valid) {
            setInstallationId(storedId)
          } else {
            console.warn("⚠️ Installation invalid or uninstalled. Clearing session.")
            localStorage.removeItem('fp_installation_id')
            setInstallationId(null)
          }
        } catch (error) {
          console.error("Failed to verify installation:", error)
          // If backend is down, decide whether to keep them logged in or not.
          // For safety, we keep them logged in but you might want to force logout.
          setInstallationId(storedId)
        }
      }
      setLoading(false)
    }

    checkInstallation()
  }, [])

  if (loading) {
    return <div className="loading-screen">Loading FeaturePulse...</div>
  }

  return (
    <div className="app">
      <Header />
      
      {/* CONDITIONAL RENDERING: Landing Page vs App Content */}
      {!installationId ? (
        <div className="landing-page">
          <div className="hero-content">
            <h1>Automated Guardrails for Your Code</h1>
            <p>Connect FeaturePulse to your GitHub repository to enforce product intent and security rules.</p>
            <a 
              href="https://github.com/apps/featurepulse-bot/installations/new" 
              className="install-button"
            >
              Install on GitHub
            </a>
          </div>
          <div className="features-preview">
            <div className="feature-item">🤖 AI Intent Analysis</div>
            <div className="feature-item">🛡️ Security Scanning</div>
            <div className="feature-item">⚡ Redundancy Checks</div>
          </div>
        </div>
      ) : (
        <div className="app-container">
          <nav className="sidebar">
            <button 
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
            <button 
              className={activeTab === 'pricing' ? 'active' : ''}
              onClick={() => setActiveTab('pricing')}
            >
              💳 Pricing
            </button>
            <button 
              className={activeTab === 'rules' ? 'active' : ''}
              onClick={() => setActiveTab('rules')}
            >
              📋 Intent Rules
            </button>
            
            <div className="sidebar-footer">
               <button 
                 className="logout-button"
                 onClick={() => {
                   localStorage.removeItem('fp_installation_id');
                   setInstallationId(null);
                 }}
               >
                 Disconnect
               </button>
            </div>
          </nav>

          <main className="main-content">
            {activeTab === 'dashboard' && <Dashboard installationId={installationId} />}
            {activeTab === 'rules' && <IntentRules installationId={installationId} />}
            {activeTab === 'pricing' && <Pricing installationId={installationId} />}
          </main>
        </div>
      )}
    </div>
  )
}

export default App
