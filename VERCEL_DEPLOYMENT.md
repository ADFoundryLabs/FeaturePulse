# Vercel Deployment Guide

## Prerequisites

1. **GitHub Account** - Your repository is already on GitHub
2. **Vercel Account** - Sign up at https://vercel.com
3. **Environment Variables** - Have all `.env` variables ready

## Step 1: Deploy Frontend to Vercel

### Option A: Using Vercel CLI (Recommended for quick deployment)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel
```

### Option B: Using Vercel Dashboard (Recommended for ongoing deployments)

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Select your GitHub repository `Visha-sk99/knowcode3.0`
4. Select the `frontend` folder as the root directory
5. Add Environment Variables:
   - `VITE_API_URL`: Your backend URL (e.g., https://your-backend.vercel.app)
6. Click "Deploy"

### Frontend Environment Variables to Add on Vercel:

```
VITE_API_URL=https://your-backend-url.vercel.app
VITE_APP_NAME=FeaturePulse
VITE_APP_URL=https://your-frontend-url.vercel.app
```

**Get your Frontend URL after deployment:**
- Vercel will provide a URL like: `https://featurepulse-xxxx.vercel.app`

---

## Step 2: Deploy Backend to Vercel

### Backend Deployment Steps:

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Select your GitHub repository `Visha-sk99/knowcode3.0`
4. Select "Node Backend" folder as the root directory
5. Framework: **Other** (Express.js)
6. Build Command: `npm install`
7. Start Command: `node index.js`

### Backend Environment Variables to Add on Vercel:

```
APP_ID=your_github_app_id
PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
your_full_private_key_here
-----END RSA PRIVATE KEY-----
INSTALLATION_ID=your_installation_id
WEBHOOK_SECRET=your_webhook_secret
GEMINI_API_KEY=your_gemini_api_key
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_REDIRECT_URI=https://your-frontend-url.vercel.app/github-callback
PORT=3000
```

---

## Step 3: Update Frontend API Configuration

After deploying the backend, update your frontend environment variables:

1. Go to Vercel Dashboard → Select Frontend Project
2. Settings → Environment Variables
3. Update `VITE_API_URL` to your backend Vercel URL
4. Redeploy frontend

---

## Step 4: Update GitHub OAuth Callback URL

1. Go to your GitHub App Settings: https://github.com/settings/apps
2. Update:
   - **Authorization callback URL**: `https://your-frontend-url.vercel.app/github-callback`
   - **Webhook URL**: `https://your-backend-url.vercel.app/webhook`

---

## Step 5: Test Deployment

### Test Frontend:
```
Visit: https://your-frontend-url.vercel.app
- Homepage should load
- Sign In button should work
- Dashboard should load after authentication
```

### Test Backend:
```
Test API endpoints:
- GET https://your-backend-url.vercel.app/api/auth/github
  Should return GitHub auth URL
```

---

## Troubleshooting

### Issue: Frontend shows blank page
**Solution:**
- Check browser console (F12) for errors
- Verify `VITE_API_URL` is correct in Vercel environment
- Ensure backend is running and accessible

### Issue: Can't login with GitHub
**Solution:**
- Verify `GITHUB_REDIRECT_URI` in GitHub App matches your frontend URL
- Check backend environment variables
- Ensure backend is deployed and running

### Issue: API calls failing
**Solution:**
- Check that backend URL in frontend environment variables is correct
- Verify backend environment variables are set correctly
- Check Vercel logs: Vercel Dashboard → Project → Deployments → Logs

### Issue: Build fails
**Solution:**
- Check Vercel build logs
- Ensure all dependencies are installed
- Verify `package.json` scripts are correct

---

## Viewing Logs

### Frontend Logs:
1. Vercel Dashboard → Frontend Project → Deployments
2. Click latest deployment
3. Click "Logs" tab

### Backend Logs:
1. Vercel Dashboard → Backend Project → Deployments
2. Click latest deployment
3. Click "Logs" or "Runtime Logs" tab

---

## Custom Domain (Optional)

1. Vercel Dashboard → Project Settings
2. Domains section
3. Add your custom domain
4. Follow DNS configuration instructions

---

## Environment Variables Reference

### Frontend (`VITE_*` variables)
```
VITE_API_URL          → Backend API endpoint
VITE_APP_NAME         → App name (default: FeaturePulse)
VITE_APP_URL          → Frontend URL
VITE_DEBUG            → Debug mode (false)
```

### Backend
```
APP_ID                → GitHub App ID
PRIVATE_KEY           → GitHub App private key
INSTALLATION_ID       → GitHub App installation ID
WEBHOOK_SECRET        → GitHub webhook secret
GEMINI_API_KEY        → Google AI API key
GITHUB_CLIENT_ID      → OAuth client ID
GITHUB_CLIENT_SECRET  → OAuth client secret
GITHUB_REDIRECT_URI   → OAuth callback URL
PORT                  → Server port (3000)
```

---

## Important Security Notes

⚠️ **Never commit `.env` files to GitHub**
- Use Vercel environment variables instead
- Keep secrets secure
- Rotate keys regularly
- Use strong secrets

---

## Deployment Checklist

- [ ] GitHub repository is up to date
- [ ] Frontend `vercel.json` is configured
- [ ] Backend `vercel.json` is configured
- [ ] All environment variables are ready
- [ ] GitHub App is configured with correct URLs
- [ ] Frontend is deployed to Vercel
- [ ] Backend is deployed to Vercel
- [ ] Frontend environment variables are set
- [ ] Backend environment variables are set
- [ ] GitHub OAuth callback URL is updated
- [ ] Webhook URL is updated in GitHub App
- [ ] Test login flow works
- [ ] Test API calls work
- [ ] Check both browser console and server logs
- [ ] Set custom domain (optional)

---

## Support & Next Steps

1. **Monitor Deployments**: Check Vercel dashboard regularly
2. **View Logs**: Use Vercel logs for debugging
3. **Performance**: Check Vercel Analytics for performance metrics
4. **Auto-Deployments**: Vercel automatically deploys on `git push` to main branch
5. **Rollback**: Easy rollback to previous deployments in Vercel dashboard

---

## Quick Links

- Frontend Dashboard: https://vercel.com/dashboard
- Vercel Docs: https://vercel.com/docs
- GitHub App Settings: https://github.com/settings/apps
- Your Repository: https://github.com/Visha-sk99/knowcode3.0

