import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    // Ensure proper Bearer token format
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('githubUser');
      // Redirect to login instead of callback
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // GitHub OAuth
  initiateGitHubAuth: () => api.get('/api/auth/github'),
  handleGitHubCallback: (code) => api.post('/api/auth/github/callback', { code }),
  validateToken: () => api.get('/api/auth/validate'),
  logout: () => api.post('/api/auth/logout'),
  
  // PR Analysis
  getPRAnalysis: (owner, repo, prNumber) => 
    api.get(`/api/analysis/${owner}/${repo}/${prNumber}`),
  createPRAnalysis: (owner, repo, prNumber, data) =>
    api.post(`/api/analysis/${owner}/${repo}/${prNumber}`, data),
  
  // Dashboard
  getDashboardStats: () => api.get('/api/dashboard/stats'),
  getDashboardAnalyses: () => api.get('/api/dashboard/analyses'),
  
  // Security Center - API Keys
  getAPIKeys: () => api.get('/api/security/keys'),
  createAPIKey: (keyData) => api.post('/api/security/keys', keyData),
  revokeAPIKey: (keyId) => api.delete(`/api/security/keys/${keyId}`),
  
  // Webhook Management
  getWebhooks: () => api.get('/api/webhooks'),
  createWebhook: (webhookData) => api.post('/api/webhooks', webhookData),
  deleteWebhook: (webhookId) => api.delete(`/api/webhooks/${webhookId}`),
  
  // Dashboard
  getDashboardStats: () => api.get('/api/dashboard/stats'),
  getRecentAnalyses: () => api.get('/api/dashboard/analyses'),
};

export default api;
