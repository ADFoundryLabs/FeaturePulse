import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Github, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';

const GitHubCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const error_param = searchParams.get('error');
    const error_description = searchParams.get('error_description');

    if (error_param) {
      setStatus('error');
      setError(error_description || 'Authentication failed');
      return;
    }

    if (code) {
      handleGitHubCallback(code);
    } else {
      // If no code, show the connect GitHub page
      setStatus('connect');
    }
  }, [searchParams]);

  const handleGitHubCallback = async (code) => {
    try {
      setStatus('loading');
      const response = await apiService.handleGitHubCallback(code);
      
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('githubUser', JSON.stringify(response.data.user));
        setUserData(response.data.user);
        setStatus('success');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/security');
        }, 2000);
      } else {
        setStatus('error');
        setError(response.data.message || 'Authentication failed');
      }
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.message || 'Failed to authenticate with GitHub');
    }
  };

  const initiateGitHubAuth = async () => {
    try {
      const response = await apiService.initiateGitHubAuth();
      window.location.href = response.data.authUrl;
    } catch (err) {
      setError('Failed to initiate GitHub authentication');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Authenticating with GitHub
          </h2>
          <p className="text-gray-600">Please wait while we connect your account...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Successfully Connected!
          </h2>
          <p className="text-gray-600 mb-4">
            Welcome, {userData?.name || userData?.login}! Your GitHub account has been connected.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to Security Center...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Authentication Failed
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => setStatus('connect')}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Default: Show connect GitHub page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Github className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Connect Your GitHub Account
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Authorize FeaturePulse to access your repositories and provide intelligent PR analysis
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            What FeaturePulse Can Access
          </h2>
          <div className="space-y-4">
            {[
              {
                title: 'Repository Access',
                description: 'Read access to your repositories to analyze pull requests and code changes'
              },
              {
                title: 'Pull Request Information',
                description: 'Access PR details, files, and metadata to provide intelligent analysis'
              },
              {
                title: 'Webhook Management',
                description: 'Create and manage webhooks to receive real-time PR events'
              },
              {
                title: 'Commit History',
                description: 'Analyze commit messages and changes for context-aware insights'
              }
            ].map((permission, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">{permission.title}</h3>
                  <p className="text-gray-600 text-sm">{permission.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            🔒 Security & Privacy
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li>• We never store your GitHub password</li>
            <li>• All data is encrypted in transit and at rest</li>
            <li>• You can revoke access at any time</li>
            <li>• Minimal permissions required for core functionality</li>
          </ul>
        </div>

        <div className="text-center">
          <button
            onClick={initiateGitHubAuth}
            className="btn-primary inline-flex items-center text-lg px-8 py-4"
          >
            <Github className="mr-3 w-6 h-6" />
            Connect GitHub Account
          </button>
          <p className="text-sm text-gray-500 mt-4">
            You'll be redirected to GitHub to authorize this application
          </p>
        </div>
      </div>
    </div>
  );
};

export default GitHubCallback;
