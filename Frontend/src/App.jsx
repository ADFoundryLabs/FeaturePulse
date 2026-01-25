import { useState, useEffect } from 'react'
import './App.css'
import IntentRules from './components/IntentRules'
import Dashboard from './components/Dashboard'
import Pricing from './components/Pricing'
import Header from './components/Header'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [installationId, setInstallationId] = useState(null);

  useEffect(() => {
    // 1. Check URL for installation_id (Github Redirect)
    const queryParams = new URLSearchParams(window.location.search);
    const urlId = queryParams.get('installation_id');

    if (urlId) {
      // Save to storage so it persists on refresh
      localStorage.setItem('fp_installation_id', urlId);
      setInstallationId(urlId);
      
      // Clean URL (remove ugly query params)
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Auto-switch to pricing if just installed
      setActiveTab('pricing');
    } else {
      // 2. Load from storage
      const storedId = localStorage.getItem('fp_installation_id');
      if (storedId) setInstallationId(storedId);
    }
  }, []);

  return (
    <div className="app">
      <Header />
      <div className="app-container">
        <nav className="sidebar">
          <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}>
            📊 Dashboard
          </button>
          <button onClick={() => setActiveTab('pricing')} className={activeTab === 'pricing' ? 'active' : ''}>
            💳 Pricing {installationId && '✅'}
          </button>
          <button onClick={() => setActiveTab('rules')} className={activeTab === 'rules' ? 'active' : ''}>
            📋 Intent Rules
          </button>
        </nav>
        <main className="main-content">
          {activeTab === 'dashboard' && <Dashboard installationId={installationId} />}
          {activeTab === 'rules' && <IntentRules installationId={installationId} />}
          {activeTab === 'pricing' && <Pricing installationId={installationId} />}
        </main>
      </div>
    </div>
  )
}

export default App