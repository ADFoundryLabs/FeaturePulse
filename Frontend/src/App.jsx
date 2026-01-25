import { useState, useEffect } from 'react'
import './App.css'
import IntentRules from './components/IntentRules'
import Dashboard from './components/Dashboard'
import Header from './components/Header'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

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
          <button 
            className={activeTab === 'rules' ? 'active' : ''}
            onClick={() => setActiveTab('rules')}
          >
            📋 Intent Rules
          </button>
        </nav>
        <main className="main-content">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'rules' && <IntentRules />}
        </main>
      </div>
    </div>
  )
}

export default App
