# FeaturePulse - Backend & Frontend Integration Setup Guide

## Overview

FeaturePulse is a full-stack application that combines an Express.js backend with a React frontend to provide AI-powered GitHub PR analysis. This guide covers complete setup and integration.

## Architecture

### Backend (Node.js + Express)
- **Location**: `Node Backend/`
- **Port**: 3000
- **Key Features**:
  - GitHub OAuth 2.0 authentication
  - GitHub App for webhook processing
  - AI-powered PR analysis using Google Gemini API
  - API key management
  - Webhook management

### Frontend (React + Vite)
- **Location**: `frontend/`
- **Port**: 5173 (dev) / 4173 (preview)
- **Key Features**:
  - Authentication with GitHub OAuth
  - Dashboard for viewing analyses
  - Security Center for API keys and webhooks
  - User profile management

## Prerequisites

### System Requirements
- Node.js 16+ and npm/yarn
- Git
- A GitHub account
- Google Cloud account (for Gemini API)

### GitHub App Setup

1. **Create a GitHub App**:
   - Go to GitHub Settings → Developer settings → GitHub Apps
   - Click "New GitHub App"
   - Fill in the following:
     - **App name**: `FeaturePulse-Dev` (or your preferred name)
     - **Homepage URL**: `http://localhost:5173`
     - **Webhook URL**: `http://localhost:3000/webhook`
     - **Webhook secret**: Generate a random secret (save it!)
   
2. **Permissions**:
   - **Repository permissions**:
     - Checks: Read & write
     - Pull requests: Read & write
     - Contents: Read-only
   
3. **Events to subscribe to**:
   - Pull request
   - Check run

4. **Generate Private Key**:
   - Scroll to "Private keys" section
   - Click "Generate a private key" and save the file

5. **Get Installation ID**:
   - Install the app on your repository
   - After installation, visit: `https://github.com/settings/installations`
   - Click the app and copy the Installation ID from the URL: `https://github.com/settings/installations/{INSTALLATION_ID}`

### Google Gemini API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the API key

### GitHub OAuth Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: `FeaturePulse-Dev`
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:5173/github-callback`
4. Copy the **Client ID** and **Client Secret**

## Installation & Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd "Node Backend"

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env with your values
# APP_ID=your_github_app_id
# PRIVATE_KEY=your_private_key_here
# INSTALLATION_ID=your_installation_id
# GITHUB_CLIENT_ID=your_oauth_client_id
# GITHUB_CLIENT_SECRET=your_oauth_client_secret
# GITHUB_REDIRECT_URI=http://localhost:5173/github-callback
# WEBHOOK_SECRET=your_webhook_secret
# GEMINI_API_KEY=your_gemini_api_key
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file from example
cp .env.example .env.local

# .env.local should contain:
# VITE_API_URL=http://localhost:3000
```

### 3. Start Development Servers

**Terminal 1 - Backend**:
```bash
cd "Node Backend"
npm start
# Server should run on http://localhost:3000
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
# Application should run on http://localhost:5173
```

## API Endpoints Reference

### Authentication
- `GET /api/auth/github` - Get GitHub OAuth URL
- `POST /api/auth/github/callback` - Handle OAuth callback
- `GET /api/auth/validate` - Validate auth token
- `POST /api/auth/logout` - Logout user

### Dashboard
- `GET /api/dashboard/stats` - Get user stats (analyses, keys, webhooks count)
- `GET /api/dashboard/analyses` - Get list of all user analyses

### PR Analysis
- `GET /api/analysis/:owner/:repo/:prNumber` - Get analysis for specific PR
- `POST /api/analysis/:owner/:repo/:prNumber` - Create/update analysis

### Security
- `GET /api/security/keys` - List API keys
- `POST /api/security/keys` - Create new API key
- `DELETE /api/security/keys/:keyId` - Revoke API key

### Webhooks
- `GET /api/webhooks` - List webhooks
- `POST /api/webhooks` - Create webhook
- `DELETE /api/webhooks/:webhookId` - Delete webhook
- `POST /webhook` - GitHub webhook handler (public endpoint)

## Data Flow

### Authentication Flow
1. User clicks "Sign In" on frontend
2. Frontend redirects to `GET /api/auth/github`
3. Backend returns GitHub OAuth URL
4. User authorizes on GitHub
5. GitHub redirects to `/github-callback` with authorization code
6. Frontend sends code to `POST /api/auth/github/callback`
7. Backend exchanges code for GitHub access token
8. Backend creates session and returns auth token
9. Frontend stores token in localStorage
10. User redirected to Dashboard

### PR Analysis Flow
1. GitHub webhook sends PR event to `POST /webhook`
2. Backend validates webhook signature
3. Backend fetches PR files from GitHub API
4. Backend sends content to Google Gemini AI for analysis
5. Backend stores analysis result
6. Frontend fetches analysis via `GET /api/analysis/:owner/:repo/:prNumber`
7. Frontend displays analysis on Dashboard

## Environment Variables

### Backend (.env)
```
APP_ID=                          # GitHub App ID
PRIVATE_KEY=                     # GitHub App Private Key (multiline)
INSTALLATION_ID=                 # GitHub App Installation ID
GITHUB_CLIENT_ID=                # OAuth Client ID
GITHUB_CLIENT_SECRET=            # OAuth Client Secret
GITHUB_REDIRECT_URI=             # OAuth Redirect URL
WEBHOOK_SECRET=                  # Webhook signature secret
GEMINI_API_KEY=                  # Google Gemini API key
PORT=3000                        # Server port
NODE_ENV=development             # Environment
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:3000    # Backend API URL
```

## Features & Usage

### Dashboard
- View summary statistics (total analyses, API keys, webhooks)
- See recent PR analyses with decisions
- Monitor team activity

### Security Center
- **API Keys Tab**: Create and manage API keys for external integrations
- **Webhooks Tab**: Configure custom webhooks for events

### User Profile
- View GitHub profile information
- Manage account settings
- Sign out

## Troubleshooting

### Issue: "Invalid or expired token"
**Solution**: Clear browser storage and login again
```javascript
localStorage.clear()
// Then reload the page
```

### Issue: Webhook not being received
**Solution**: 
1. Check webhook URL is publicly accessible
2. Verify webhook secret matches in GitHub settings
3. Check backend logs for validation errors

### Issue: GitHub OAuth fails
**Solution**:
1. Verify Client ID and Secret are correct
2. Check GitHub OAuth App settings match your environment
3. Ensure callback URL exactly matches

### Issue: AI Analysis fails
**Solution**:
1. Verify GEMINI_API_KEY is valid
2. Check Google Cloud API quota
3. Check backend logs for specific error

## Testing

### Manual API Testing
```bash
# Using curl to test endpoints

# Get OAuth URL
curl http://localhost:3000/api/auth/github

# Create PR analysis (requires valid token)
curl -X POST http://localhost:3000/api/analysis/owner/repo/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"force_analysis": true}'
```

### Frontend Testing
1. Navigate to http://localhost:5173
2. Click "Sign In with GitHub"
3. Authorize the GitHub App
4. You should be redirected to Dashboard
5. Create test API keys and webhooks
6. View your profile

## Production Deployment

### Environment Variables
- Use secure environment variable management (e.g., AWS Secrets Manager)
- Never commit `.env` files
- Rotate secrets regularly

### Security Considerations
- Set `NODE_ENV=production`
- Use HTTPS for all endpoints
- Implement rate limiting
- Add request validation
- Use database instead of in-memory storage
- Implement proper logging and monitoring

### Scaling
- Move from in-memory storage to MongoDB/PostgreSQL
- Implement job queue for AI analysis (Bull, RabbitMQ)
- Add Redis for session/cache management
- Use CDN for frontend assets
- Implement load balancing

## Support & Resources

- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Google Generative AI](https://ai.google.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## License

See LICENSE file for details.
