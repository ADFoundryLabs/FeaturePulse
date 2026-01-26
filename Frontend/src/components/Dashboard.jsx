import { useState, useEffect } from 'react'
import { fetchDashboardStats, fetchRecentAnalyses, fetchSubscription, saveSettings } from '../services/api'
import './Dashboard.css'

function Dashboard({ installationId }) {
  const [stats, setStats] = useState({ totalPRs: 0, approved: 0, warnings: 0, blocked: 0 })
  const [recentAnalyses, setRecentAnalyses] = useState([])
  
  // Settings State
  const [authorityMode, setAuthorityMode] = useState('gatekeeper')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Fetch Stats & Recent (Existing Logic)
    fetchDashboardStats().then(setStats)
    fetchRecentAnalyses().then(setRecentAnalyses)

    // Fetch Current Settings
    if (installationId) {
      fetchSubscription(installationId).then(data => {
        if (data.settings && data.settings.authorityMode) {
          setAuthorityMode(data.settings.authorityMode)
        }
      })
    }
  }, [installationId])

  const handleModeChange = async (mode) => {
    setAuthorityMode(mode)
    setIsSaving(true)
    try {
      await saveSettings(installationId, { authorityMode: mode })
    } catch (err) {
      alert("Failed to save setting")
    } finally {
      setIsSaving(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
  }

  const getDecisionBadge = (decision) => {
    const colors = { 'APPROVE': '#10b981', 'WARN': '#f59e0b', 'BLOCK': '#ef4444' }
    return colors[decision] || '#6b7280'
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p className="subtitle">Overview and Configuration</p>
      </div>

      {/* --- SETTINGS SECTION --- */}
      <div className="settings-panel">
        <h3>🛡️ Merge Authority Configuration</h3>
        <p className="settings-desc">Define how FeaturePulse acts when it detects risks.</p>
        
        <div className="mode-selector">
          <label className={`mode-option ${authorityMode === 'advisory' ? 'selected' : ''}`}>
            <input 
              type="radio" 
              name="mode" 
              value="advisory" 
              checked={authorityMode === 'advisory'}
              onChange={() => handleModeChange('advisory')}
            />
            <div className="mode-info">
              <span className="mode-title">Advisory Mode</span>
              <span className="mode-detail">Warns only. Never blocks merges. Best for starting out.</span>
            </div>
          </label>

          <label className={`mode-option ${authorityMode === 'gatekeeper' ? 'selected' : ''}`}>
            <input 
              type="radio" 
              name="mode" 
              value="gatekeeper" 
              checked={authorityMode === 'gatekeeper'}
              onChange={() => handleModeChange('gatekeeper')}
            />
            <div className="mode-info">
              <span className="mode-title">Gatekeeper Mode</span>
              <span className="mode-detail">Blocks merges on High Risk or Misalignment.</span>
            </div>
          </label>

          <label className={`mode-option ${authorityMode === 'auto-approve' ? 'selected' : ''}`}>
            <input 
              type="radio" 
              name="mode" 
              value="auto-approve" 
              checked={authorityMode === 'auto-approve'}
              onChange={() => handleModeChange('auto-approve')}
            />
            <div className="mode-info">
              <span className="mode-title">Auto-Approve Mode</span>
              <span className="mode-detail">Explicitly approves safe PRs (Passes checks).</span>
            </div>
          </label>
        </div>
        {isSaving && <span className="saving-indicator">Saving...</span>}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalPRs}</div>
            <div className="stat-label">Total PRs</div>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.warnings}</div>
            <div className="stat-label">Warnings</div>
          </div>
        </div>
        <div className="stat-card error">
          <div className="stat-icon">🚫</div>
          <div className="stat-content">
            <div className="stat-value">{stats.blocked}</div>
            <div className="stat-label">Blocked</div>
          </div>
        </div>
      </div>

      <div className="recent-section">
        <h3>Recent Analyses</h3>
        <div className="analyses-list">
          {recentAnalyses.length === 0 ? (
            <div className="empty-state">
              <p>No analyses yet.</p>
            </div>
          ) : (
            recentAnalyses.map(analysis => (
              <div key={analysis.id} className="analysis-card">
                {/* HEADER: Title and Score Only */}
                <div className="analysis-header">
                  <div className="analysis-title-section">
                    <span className="pr-number">#{analysis.prNumber}</span>
                    <h4 className="pr-title">{analysis.title}</h4>
                  </div>
                  <div 
                    className="score-badge"
                    style={{ backgroundColor: getScoreColor(analysis.score) }}
                  >
                    {analysis.score}%
                  </div>
                </div>
                <div className="analysis-meta">
                  <span 
                    className="decision-badge"
                    style={{ backgroundColor: getDecisionBadge(analysis.decision) }}
                  >
                    {analysis.decision}
                  </span>
                  <span className="repo-name">{analysis.repo}</span>
                  <span className="analysis-date">{analysis.date}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard