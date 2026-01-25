# FeaturePulse - AI-Powered PR Analysis Platform

FeaturePulse is an intelligent platform that uses AI to analyze pull requests against your project's intent rules, providing automated insights and recommendations to streamline your development workflow.

## 🚀 Features

- **AI-Powered Analysis**: Advanced AI models analyze your pull requests against project intent rules
- **Security First**: Enterprise-grade security with encrypted API keys and secure authentication
- **Smart Branching**: Intelligent branch-aware analysis for different deployment strategies
- **Real-time Insights**: Get instant feedback and detailed analysis reports for every PR
- **GitHub Integration**: Seamless integration with GitHub via webhooks and OAuth
- **Modern UI**: Beautiful, responsive frontend built with React and Tailwind CSS

## 📁 Project Structure

```
FeaturePulse-master/
├── Node Backend/           # Express.js backend server
│   ├── index.js           # Main server file with API routes
│   ├── ai.js              # Google AI integration
│   ├── github.js          # GitHub API integration
│   ├── package.json       # Backend dependencies
│   └── .env.example       # Environment variables template
└── frontend/              # React frontend application
    ├── src/
    │   ├── components/    # React components
    │   ├── pages/         # Page components
    │   ├── services/      # API service layer
    │   └── utils/         # Utility functions
    ├── package.json       # Frontend dependencies
    └── README.md          # Frontend setup instructions
```

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **Google Generative AI** (Gemini 2.0 Flash)
- **GitHub Apps API** with Octokit
- **Environment-based configuration**

### Frontend
- **React 18** with modern hooks
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- GitHub App credentials
- Google AI API key

### Backend Setup

1. Navigate to the backend directory:
```bash
cd "Node Backend"
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Start the backend server:
```bash
npm run dev
```

The backend will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env if needed
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔧 Configuration

### GitHub App Setup

1. Create a GitHub App at https://github.com/settings/apps
2. Configure the following permissions:
   - Repository permissions: Read access to code, pull requests, issues
   - Organization permissions: Read access to members
3. Set the webhook URL to `http://localhost:3000/webhook`
4. Note the App ID, Private Key, and Installation ID

### Google AI Setup

1. Get a Google AI API key from https://makersuite.google.com/app/apikey
2. Add it to your `.env` file as `GEMINI_API_KEY`

### Environment Variables

See `.env.example` for all required environment variables:
- `APP_ID`: GitHub App ID
- `PRIVATE_KEY`: GitHub App private key
- `INSTALLATION_ID`: GitHub App installation ID
- `GITHUB_CLIENT_ID`: OAuth client ID (optional)
- `GITHUB_CLIENT_SECRET`: OAuth client secret (optional)
- `WEBHOOK_SECRET`: Webhook secret for GitHub
- `GEMINI_API_KEY`: Google AI API key

## 📖 Usage

1. **Install the GitHub App**: Install your configured GitHub App to your repositories
2. **Create intent.md**: Add an `intent.md` file to your repository root with project rules
3. **Open Pull Requests**: FeaturePulse will automatically analyze new PRs
4. **View Dashboard**: Use the web interface to manage settings and view analysis history

## 🔌 API Endpoints

### Authentication
- `GET /api/auth/github` - Initiate GitHub OAuth
- `POST /api/auth/github/callback` - Handle OAuth callback

### Analysis
- `GET /api/analysis/:owner/:repo/:prNumber` - Get PR analysis
- `POST /api/analysis/:owner/:repo/:prNumber` - Trigger new analysis

### Security
- `GET /api/security/keys` - List API keys
- `POST /api/security/keys` - Create API key
- `DELETE /api/security/keys/:keyId` - Revoke API key

### Webhooks
- `GET /api/webhooks` - List webhooks
- `POST /api/webhooks` - Create webhook
- `DELETE /api/webhooks/:webhookId` - Delete webhook

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/analyses` - Get recent analyses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔒 Security

- All API keys are encrypted at rest
- Webhook signatures are verified
- OAuth tokens are handled securely
- No sensitive data is logged

## 📞 Support

For issues and questions:
- Create an issue in this repository
- Check the documentation at `/docs` in the web interface
- Review the API documentation for integration help
