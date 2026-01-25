import { useState, useEffect } from 'react'
import './App.css'
import IntentRules from './components/IntentRules'
import Dashboard from './components/Dashboard'
import Pricing from './components/Pricing' // 1. Import Pricing
import Header from './components/Header'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [installationId, setInstallationId] = useState(null);

  useEffect(() => {
    // 2. Check URL for installation_id (GitHub Redirect)
    const queryParams = new URLSearchParams(window.location.search);
    const urlId = queryParams.get('installation_id');

    if (urlId) {
      // Save ID and clean URL
      localStorage.setItem('fp_installation_id', urlId);
      setInstallationId(urlId);
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Auto-switch to pricing page on first install
      setActiveTab('pricing');
    } else {
      // Load from storage if returning
      const storedId = localStorage.getItem('fp_installation_id');
      if (storedId) setInstallationId(storedId);
    }
  }, []);

  return (
    <div className="app">
      <Header />
      <div className="app-container">
        <nav className="sidebar">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          
          {/* 3. Add Pricing Button */}
          <button 
            className={activeTab === 'pricing' ? 'active' : ''}
            onClick={() => setActiveTab('pricing')}
          >
            💳 Pricing {installationId ? '✅' : ''}
          </button>

          <button 
            className={activeTab === 'rules' ? 'active' : ''}
            onClick={() => setActiveTab('rules')}
          >
            📋 Intent Rules
          </button>
        </nav>
        <main className="main-content">
          {activeTab === 'dashboard' && <Dashboard installationId={installationId} />}
          {activeTab === 'rules' && <IntentRules installationId={installationId} />}
          
          {/* 4. Render Pricing Component */}
          {activeTab === 'pricing' && <Pricing installationId={installationId} />}
        </main>
      </div>
    </div>
  )
}

export default App