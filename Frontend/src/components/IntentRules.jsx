import { useState, useEffect } from 'react'
import './IntentRules.css'

function IntentRules() {
  const [rules, setRules] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch from backend API when available
    // For now, using mock data based on intent.md
    setTimeout(() => {
      setRules({
        categories: [
          {
            name: 'Documentation Update',
            riskLevel: 'Low',
            defaultDecision: 'APPROVE',
            description: 'Changes that improve or modify README files, markdown documentation, or code comments.'
          },
          {
            name: 'Bug Fix',
            riskLevel: 'Medium',
            defaultDecision: 'APPROVE',
            description: 'Changes that correct broken functionality, incorrect logic, or runtime errors. Must not introduce unrelated changes.'
          },
          {
            name: 'New Feature',
            riskLevel: 'High',
            defaultDecision: 'WARN',
            description: 'Changes that introduce new functionality, new modules or endpoints, or new user-facing behavior. Should include clear description and intent.'
          },
          {
            name: 'Refactor',
            riskLevel: 'Medium',
            defaultDecision: 'APPROVE',
            description: 'Changes that improve code structure, readability or maintainability without changing behavior.'
          },
          {
            name: 'Test Improvement',
            riskLevel: 'Low',
            defaultDecision: 'APPROVE',
            description: 'Changes that add tests, improve test coverage, or fix failing tests.'
          },
          {
            name: 'General Improvement',
            riskLevel: 'Low',
            defaultDecision: 'APPROVE',
            description: 'Minor changes that do not fit other categories.'
          }
        ],
        branchRules: {
          master: {
            description: 'Pull requests targeting master must clearly match one of the supported intent categories, avoid experimental or unfinished features, and align with production stability. FeaturePulse applies stricter evaluation for master merges.'
          }
        }
      })
      setLoading(false)
    }, 500)
  }, [])

  const getRiskColor = (risk) => {
    const colors = {
      'Low': '#10b981',
      'Medium': '#f59e0b',
      'High': '#ef4444'
    }
    return colors[risk] || '#6b7280'
  }

  const getDecisionColor = (decision) => {
    const colors = {
      'APPROVE': '#10b981',
      'WARN': '#f59e0b',
      'BLOCK': '#ef4444'
    }
    return colors[decision] || '#6b7280'
  }

  if (loading) {
    return (
      <div className="intent-rules">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading intent rules...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="intent-rules">
      <div className="rules-header">
        <h2>Intent Rules</h2>
        <p className="subtitle">
          These rules define how FeaturePulse evaluates pull requests. 
          Rules are read from <code>intent.md</code> in your repository.
        </p>
      </div>

      <div className="rules-content">
        <section className="categories-section">
          <h3>Supported Intent Categories</h3>
          <div className="categories-grid">
            {rules.categories.map((category, index) => (
              <div key={index} className="category-card">
                <div className="category-header">
                  <h4>{category.name}</h4>
                  <div className="category-badges">
                    <span 
                      className="risk-badge"
                      style={{ backgroundColor: getRiskColor(category.riskLevel) }}
                    >
                      {category.riskLevel} Risk
                    </span>
                    <span 
                      className="decision-badge"
                      style={{ backgroundColor: getDecisionColor(category.defaultDecision) }}
                    >
                      {category.defaultDecision}
                    </span>
                  </div>
                </div>
                <p className="category-description">{category.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="branch-rules-section">
          <h3>Branch-Specific Rules</h3>
          <div className="branch-rules">
            <div className="branch-rule-card">
              <div className="branch-header">
                <h4>Master Branch</h4>
                <span className="branch-badge">Strict Evaluation</span>
              </div>
              <p>{rules.branchRules.master.description}</p>
            </div>
          </div>
        </section>

        <section className="how-it-works-section">
          <h3>How FeaturePulse Uses These Rules</h3>
          <div className="steps-list">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Reads intent.md</h4>
                <p>FeaturePulse reads the intent.md file from your repository</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Compares PR Details</h4>
                <p>Compares PR title, description, and commit context against defined intent rules</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>AI Analysis</h4>
                <p>Uses AI reasoning to determine detected intent, risk level, and merge decision</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Posts Results</h4>
                <p>Posts results as a GitHub Check and pull request comment</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default IntentRules
