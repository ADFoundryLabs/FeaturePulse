import React, { useState } from 'react';
import { BookOpen, Code2, Shield, Zap, GitBranch, ChevronRight, Copy, Check } from 'lucide-react';

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [copiedCode, setCopiedCode] = useState('');

  const sections = [
    { id: 'getting-started', label: 'Getting Started', icon: Zap },
    { id: 'api-reference', label: 'API Reference', icon: Code2 },
    { id: 'webhooks', label: 'Webhooks', icon: GitBranch },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const CodeBlock = ({ code, language = 'javascript' }) => (
    <div className="relative">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <button
        onClick={() => copyToClipboard(code)}
        className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
      >
        {copiedCode === code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Documentation</h1>
          <p className="text-xl text-gray-600">
            Everything you need to integrate FeaturePulse into your workflow
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Navigation</h3>
              <ul className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <li key={section.id}>
                      <button
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                          activeSection === section.id
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{section.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Getting Started */}
            {activeSection === 'getting-started' && (
              <div className="space-y-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
                  <p className="text-gray-600 mb-6">
                    Follow these steps to integrate FeaturePulse into your development workflow.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Install the GitHub App</h3>
                      <p className="text-gray-600 mb-3">
                        Install the FeaturePulse GitHub App from the GitHub Marketplace:
                      </p>
                      <a
                        href="https://github.com/apps/featurepulse"
                        className="inline-flex items-center text-primary-600 hover:text-primary-700"
                      >
                        Install FeaturePulse App
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </a>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Create an intent.md file</h3>
                      <p className="text-gray-600 mb-3">
                        Add an <code className="bg-gray-100 px-2 py-1 rounded">intent.md</code> file to your repository root:
                      </p>
                      <CodeBlock
                        code={`# Project Intent Rules

## Core Principles
- All code must be well-documented
- Security is our top priority
- Performance optimizations are encouraged

## Branch Rules
- **master**: Only critical bug fixes and releases
- **develop**: Feature development and integration
- **feature/***: Individual feature branches

## Code Quality Standards
- Test coverage must be above 80%
- No hardcoded secrets or API keys
- Follow established coding conventions`}
                        language="markdown"
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Configure Webhooks</h3>
                      <p className="text-gray-600 mb-3">
                        Ensure webhooks are enabled for pull request events:
                      </p>
                      <CodeBlock
                        code={`curl -X POST https://api.github.com/repos/owner/repo/hooks \\
  -H "Authorization: token YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "web",
    "active": true,
    "events": ["pull_request"],
    "config": {
      "url": "https://your-featurepulse-instance.com/webhook",
      "content_type": "json"
    }
  }'`}
                        language="bash"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* API Reference */}
            {activeSection === 'api-reference' && (
              <div className="space-y-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">API Reference</h2>
                  <p className="text-gray-600 mb-6">
                    RESTful API endpoints for integrating FeaturePulse into your applications.
                  </p>

                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Authentication</h3>
                      <p className="text-gray-600 mb-3">
                        Include your API key in the Authorization header:
                      </p>
                      <CodeBlock
                        code={`curl -H "Authorization: Bearer YOUR_API_KEY" \\
     https://api.featurepulse.com/v1/analysis`}
                        language="bash"
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Endpoints</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Analyze Pull Request</h4>
                          <p className="text-gray-600 mb-2">POST /v1/analysis/{'{owner}/{repo}/{pr_number}'}</p>
                          <CodeBlock
                            code={`curl -X POST \\
  https://api.featurepulse.com/v1/analysis/owner/repo/123 \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "force_analysis": true
  }'`}
                            language="bash"
                          />
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Get Analysis Results</h4>
                          <p className="text-gray-600 mb-2">GET /v1/analysis/{'{owner}/{repo}/{pr_number}'}</p>
                          <CodeBlock
                            code={`curl -H "Authorization: Bearer YOUR_API_KEY" \\
     https://api.featurepulse.com/v1/analysis/owner/repo/123`}
                            language="bash"
                          />
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Response Format</h4>
                          <CodeBlock
                            code={`{
  "id": "analysis_123",
  "pr_number": 123,
  "decision": "APPROVE",
  "confidence": 0.95,
  "detected_intent": "Add user authentication feature",
  "reasoning": "The PR implements secure OAuth2 authentication...",
  "summary": "✅ This PR aligns with project intent and security standards",
  "file_analysis": [
    {
      "filename": "src/auth.js",
      "risk_level": "low",
      "suggestions": ["Consider adding input validation"]
    }
  ],
  "created_at": "2024-01-15T10:30:00Z"
}`}
                            language="json"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Webhooks */}
            {activeSection === 'webhooks' && (
              <div className="space-y-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Webhooks</h2>
                  <p className="text-gray-600 mb-6">
                    Configure webhooks to receive real-time events from FeaturePulse.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Supported Events</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li><strong>pull_request.opened</strong> - When a new PR is created</li>
                        <li><strong>pull_request.synchronize</strong> - When new commits are pushed to a PR</li>
                        <li><strong>pull_request.reopened</strong> - When a closed PR is reopened</li>
                        <li><strong>analysis.completed</strong> - When AI analysis is complete</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Webhook Payload</h3>
                      <CodeBlock
                        code={`{
  "event": "analysis.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "repository": {
      "name": "my-repo",
      "owner": "my-organization"
    },
    "pull_request": {
      "number": 123,
      "title": "Add new feature",
      "author": "developer",
      "base_branch": "main",
      "head_branch": "feature/new-feature"
    },
    "analysis": {
      "decision": "APPROVE",
      "confidence": 0.95,
      "summary": "✅ PR approved by FeaturePulse AI",
      "risk_level": "low"
    }
  }
}`}
                        language="json"
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Security</h3>
                      <p className="text-gray-600 mb-3">
                        All webhook requests include a signature header for verification:
                      </p>
                      <CodeBlock
                        code={`// Verify webhook signature
const crypto = require('crypto');
const signature = req.headers['x-featurepulse-signature'];
const hmac = crypto.createHmac('sha256', 'your_webhook_secret');
const expectedSignature = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

if (signature !== expectedSignature) {
  return res.status(401).send('Invalid signature');
}`}
                        language="javascript"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security */}
            {activeSection === 'security' && (
              <div className="space-y-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Security</h2>
                  <p className="text-gray-600 mb-6">
                    Learn about FeaturePulse's security features and best practices.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Protection</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• End-to-end encryption for all data in transit</li>
                        <li>• AES-256 encryption for data at rest</li>
                        <li>• Regular security audits and penetration testing</li>
                        <li>• SOC 2 Type II compliance</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">API Key Security</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Use environment variables to store API keys</li>
                        <li>• Rotate keys regularly (recommended every 90 days)</li>
                        <li>• Use the minimum required permissions</li>
                        <li>• Monitor API key usage and revoke suspicious activity</li>
                      </ul>
                      <CodeBlock
                        code={`# Environment variable example
FEATUREPULSE_API_KEY=fp_live_your_api_key_here
FEATUREPULSE_WEBHOOK_SECRET=your_webhook_secret_here`}
                        language="bash"
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Rate Limiting</h3>
                      <p className="text-gray-600 mb-3">
                        API requests are rate limited to prevent abuse:
                      </p>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Free tier: 100 requests/hour</li>
                        <li>• Pro tier: 1,000 requests/hour</li>
                        <li>• Enterprise: Custom limits</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Best Practices</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Never commit API keys to version control</li>
                        <li>• Use webhook signature verification</li>
                        <li>• Implement proper error handling</li>
                        <li>• Log security events for auditing</li>
                        <li>• Keep dependencies updated</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
