import { useState, useEffect } from 'react'
import { fetchDashboardStats, fetchRecentAnalyses, fetchSubscription } from '../services/api'
import './Dashboard.css'

function Dashboard({ installationId }) {
  const [stats, setStats] = useState({ totalPRs: 0, approved: 0, warnings: 0, blocked: 0 })
  const [recentAnalyses, setRecentAnalyses] = useState([])
  
  useEffect(() => {
    fetchDashboardStats().then(setStats)
    fetchRecentAnalyses().then(setRecentAnalyses)
  }, [installationId])

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
        <p className="subtitle">Overview</p>
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
                <div className="analysis-header">
                  <div className="analysis-title-section">
                    <span className="pr-number">#{analysis.prNumber}</span>
                    <h4 className="pr-title">{analysis.title}</h4>
                  </div>
                  
                  <div className="score-display">
                    <div className="score-text" style={{ color: getScoreColor(analysis.score) }}>
                      {analysis.score}%
                    </div>
                    <div className="score-track">
                      <div 
                        className="score-fill"
                        style={{ 
                          width: `${analysis.score}%`, 
                          backgroundColor: getScoreColor(analysis.score),
                          boxShadow: `0 0 8px ${getScoreColor(analysis.score)}`
                        }}
                      />
                    </div>
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
