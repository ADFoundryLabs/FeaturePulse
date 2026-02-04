<div align="center">

# 🎯 FeaturePulse

### AI-Powered Pull Request Guardian for Product Intent & Security

[![GitHub App](https://img.shields.io/badge/GitHub%20App-Install-2088FF?logo=github&logoColor=white)](https://github.com/apps/featurepulse-merge)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

<p align="center">
  <strong>Automatically enforce product requirements, detect security vulnerabilities, and eliminate code redundancy on every pull request.</strong>
</p>

[Quick Start](#-quick-start) • [Features](#-features) • [Architecture](#-architecture) • [Configuration](#-configuration) • [API Reference](#-api-reference) • [Contributing](#-contributing)

---

</div>

## 🌟 What is FeaturePulse?

FeaturePulse is an intelligent **GitHub App** that acts as an automated product manager and security auditor for your codebase. It analyzes every pull request against your project's defined intent rules (PRD/requirements) and provides:

- 📊 **Intent Score** – Measures how well code changes align with your product requirements
- 🛡️ **Security Scanning** – Detects vulnerabilities in dependencies using the OSV database
- ⚡ **Redundancy Detection** – Identifies duplicate or conflicting file names using Levenshtein distance
- 🤖 **AI-Powered Decisions** – Leverages Gemini/OpenRouter AI for intelligent compliance analysis

> **Think of it as having a tireless product manager and security engineer reviewing every PR 24/7.**

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎯 Intent Analysis
Compares code changes against your `intent.md` requirements document to ensure features are implemented correctly.

```
✅ Implemented Features
⚠️ Missing/Incomplete Items  
🛑 Out-of-Scope Changes
```

</td>
<td width="50%">

### 🔒 Security Scanning
Automatically scans new dependencies for known vulnerabilities using the **OSV Database**.

```
📦 Dependency Analysis
🚨 CVE Detection
⚠️ Sensitive File Detection
```

</td>
</tr>
<tr>
<td width="50%">

### 🔄 Redundancy Detection
Uses Levenshtein distance to detect:
- Duplicate filenames in different directories
- Near-identical file naming patterns
- Potential code duplication

</td>
<td width="50%">

### ⚙️ Merge Authority Modes
Choose how FeaturePulse enforces decisions:

| Mode | Behavior |
|------|----------|
| **Advisory** | Warns only, never blocks |
| **Gatekeeper** | Blocks risky/misaligned PRs |
| **Auto-Approve** | Approves safe PRs automatically |

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FeaturePulse                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────┐    Webhook    ┌─────────────────────────────────┐    │
│   │   GitHub    │──────────────▶│        Node.js Backend          │    │
│   │ Pull Request│               │                                 │    │
│   └─────────────┘               │  ┌─────────┐  ┌──────────────┐  │    │
│                                 │  │ github  │  │    ai.js     │  │    │
│   ┌─────────────┐               │  │   .js   │  │ Gemini/      │  │    │
│   │  intent.md  │───────────────│──│         │  │ OpenRouter   │  │    │
│   │  (Your PRD) │               │  └─────────┘  └──────────────┘  │    │
│   └─────────────┘               │                                 │    │
│                                 │  ┌──────────┐  ┌────────────┐   │    │
│   ┌─────────────┐               │  │ security │  │ redundancy │   │    │
│   │  OSV.dev    │◀──────────────│──│   .js    │  │    .js     │   │    │
│   │  Database   │               │  └──────────┘  └────────────┘   │    │
│   └─────────────┘               │                                 │    │
│                                 └─────────────────────────────────┘    │
│                                              │                          │
│                                              ▼                          │
│                                 ┌─────────────────────────────────┐    │
│                                 │      React Dashboard (Vite)     │    │
│                                 │  • PR Analysis Stats            │    │
│                                 │  • Feature Subscriptions        │    │
│                                 │  • Authority Mode Settings      │    │
│                                 └─────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Install the GitHub App

Click the button below to install FeaturePulse on your repositories:

[![Install FeaturePulse](https://img.shields.io/badge/Install-FeaturePulse-2088FF?style=for-the-badge&logo=github&logoColor=white)](https://github.com/apps/featurepulse-merge)

### 2. Create Your Intent File

Add an `intent.md` file to your repository (preferably at `.featurepulse/intent.md`):

```markdown
# Project Intent Rules

## Supported Features
1. User authentication via OAuth
2. Dashboard with real-time metrics
3. REST API with rate limiting

## Quality Standards
- All endpoints must have error handling
- Unit test coverage > 80%
- No hardcoded secrets

## Security Requirements
- HTTPS only
- Input validation on all forms
- SQL injection prevention
```

### 3. Open a Pull Request

FeaturePulse will automatically:
1. ✅ Analyze your code changes
2. ✅ Compare against your intent rules
3. ✅ Scan for security vulnerabilities
4. ✅ Check for code redundancy
5. ✅ Post results as a GitHub Check and PR comment

---

## 📁 Project Structure

```
FeaturePulse/
├── Frontend/                    # React Dashboard (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx    # Main dashboard with stats & settings
│   │   │   ├── Pricing.jsx      # Subscription plans
│   │   │   ├── IntentRules.jsx  # Intent rules editor
│   │   │   └── Header.jsx       # Navigation header
│   │   ├── services/
│   │   │   └── api.js           # Backend API client
│   │   ├── App.jsx              # Main application component
│   │   └── main.jsx             # Entry point
│   └── package.json
│
├── Node Backend/                # Express.js API Server
│   ├── index.js                 # Main server & webhook handler
│   ├── ai.js                    # AI analysis (Gemini/OpenRouter)
│   ├── security.js              # CVE scanning via OSV
│   ├── redundancy.js            # File redundancy detection
│   ├── github.js                # GitHub API interactions
│   ├── db.js                    # JSON file database
│   └── package.json
│
├── intent.md                    # Example intent rules template
└── README.md                    # This file
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `Node Backend` directory:

```env
# GitHub App Configuration (Required)
APP_ID=your_github_app_id
PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
WEBHOOK_SECRET=your_webhook_secret

# AI Provider (At least one required)
GEMINI_API_KEY=your_gemini_api_key
# OR
OPENROUTER_API_KEY=your_openrouter_api_key

# Payment Integration (Optional)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Frontend Environment

Create a `.env` file in the `Frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

---

## 🛠️ Local Development

### Prerequisites

- **Node.js** v18 or higher
- **npm** v8 or higher
- GitHub App credentials (for full functionality)

### Backend Setup

```bash
cd "Node Backend"
npm install
npm run dev    # Starts with nodemon for hot-reload
```

### Frontend Setup

```bash
cd Frontend
npm install
npm run dev    # Starts Vite dev server
```

### Running Both

```bash
# Terminal 1 - Backend (Port 3000)
cd "Node Backend" && npm run dev

# Terminal 2 - Frontend (Port 5173)
cd Frontend && npm run dev
```

---

## 📡 API Reference

### Webhook Endpoint

```http
POST /webhook
```

Handles GitHub webhook events for pull requests and app installations.

| Event | Action | Description |
|-------|--------|-------------|
| `pull_request` | `opened`, `synchronize`, `reopened` | Triggers PR analysis |
| `installation` | `deleted` | Cleans up subscription data |

### REST Endpoints

#### Get Installation Status

```http
GET /api/installation-status/:id
```

Verifies if a GitHub App installation is valid.

**Response:**
```json
{
  "valid": true
}
```

#### Get Subscription

```http
GET /api/subscription/:id
```

Returns subscription details and settings for an installation.

**Response:**
```json
{
  "features": ["intent", "security", "summary"],
  "settings": {
    "authorityMode": "gatekeeper"
  }
}
```

#### Update Settings

```http
POST /api/settings
```

Updates authority mode and other settings.

**Request Body:**
```json
{
  "installationId": "12345",
  "settings": {
    "authorityMode": "advisory"
  }
}
```

#### Create Payment Order

```http
POST /api/create-order
```

Creates a Razorpay order for feature subscription.

**Request Body:**
```json
{
  "features": ["intent", "security", "summary"],
  "installationId": "12345"
}
```

---

## 📝 Intent File Reference

FeaturePulse looks for `intent.md` in the following order:

1. `.featurepulse/intent.md` (recommended)
2. Any `intent.md` in the repository root or subdirectories

### Supported Intent Categories

| Category | Risk Level | Default Decision |
|----------|------------|------------------|
| Documentation Update | Low | APPROVE |
| Bug Fix | Medium | APPROVE |
| New Feature | High | WARN |
| Refactor | Medium | APPROVE |
| Test Improvement | Low | APPROVE |
| General Improvement | Low | APPROVE |

### Decision Logic

```
BLOCK  → Security HIGH/CRITICAL OR Intent Match < 50%
WARN   → Intent Match < 80% OR Redundancy found
APPROVE → Intent Match > 80% AND Security LOW
```

---

## 🔐 Security Features

### Dependency Vulnerability Scanning

FeaturePulse integrates with the [OSV Database](https://osv.dev/) to scan npm dependencies added in pull requests for known CVEs.

### Sensitive File Detection

The following patterns trigger security warnings:

- Authentication: `auth`, `login`, `password`, `secret`, `credential`
- Configuration: `.env`, `config.js`, `secrets`
- Payments: `payment`, `stripe`, `billing`
- Cryptography: `crypto`, `encrypt`, `decrypt`
- Database: `database`, `schema`

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation for API changes
- Use conventional commit messages

---

## 📊 PR Analysis Output

When FeaturePulse analyzes a pull request, it provides:

### GitHub Check

```
✅ FeaturePulse
   Decision: APPROVE | Score: 85%
```

### PR Comment

```markdown
## 🤖 FeaturePulse Analysis

**📊 Intent Score:** 85%
**🛡️ Decision:** APPROVE
**⚡ Authority Mode:** GATEKEEPER

---

### 📝 Executive Summary
This PR implements the user authentication feature as specified in the PRD.

### 📋 PRD Compliance
* ✅ **Implemented:** OAuth login, session management
* ⚠️ **Missing/Incomplete:** Rate limiting
* 🛑 **Out of Scope:** None

### 🛡️ Security & Quality
* **Security Risk:** LOW
* **Vulnerabilities:** None detected
* **Redundancy:** No conflicts found

### 💡 Recommendations
Consider adding rate limiting before the next release.
```

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) & [OpenRouter](https://openrouter.ai/) for AI capabilities
- [OSV Database](https://osv.dev/) for vulnerability data
- [Octokit](https://github.com/octokit) for GitHub API integration
- [Razorpay](https://razorpay.com/) for payment processing

---

<div align="center">

**Built with ❤️ for developers who care about code quality**

[⬆ Back to Top](#-featurepulse)

</div>
