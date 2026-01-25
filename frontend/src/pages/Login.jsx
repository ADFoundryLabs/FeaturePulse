import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Github, ArrowRight, CheckCircle, AlertCircle, Loader2, Shield, Users, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, initiateGitHubAuth, isAuthenticated } = useAuth();
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const error_param = searchParams.get('error');
    const error_description = searchParams.get('error_description');

    if (isAuthenticated) {
      navigate('/security');
      return;
    }

    if (error_param) {
      setStatus('error');
      setError(error_description || 'Authentication failed');
      return;
    }

    if (code) {
      handleGitHubCallback(code);
    }
  }, [searchParams, isAuthenticated, navigate]);

  const handleGitHubCallback = async (code) => {
    try {
      setStatus('loading');
      await login(code);
      setStatus('success');
      
      // Redirect to security center after successful login
      setTimeout(() => {
        navigate('/security');
      }, 1500);
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.message || 'Failed to authenticate with GitHub');
    }
  };

  const handleLogin = () => {
    initiateGitHubAuth();
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Authenticating with GitHub
          </h2>
          <p className="text-gray-600">Setting up your account...</p>
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
            Your GitHub account has been linked successfully.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to your dashboard...
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
            onClick={() => setStatus('idle')}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Login Form */}
          <div>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Github className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to FeaturePulse
              </h1>
              <p className="text-xl text-gray-600">
                Sign in with your GitHub account to get started
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                GitHub Authentication
              </h2>
              
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-6">
                    Connect your GitHub account to access AI-powered PR analysis
                  </p>
                  
                  <button
                    onClick={handleLogin}
                    className="btn-primary w-full inline-flex items-center justify-center text-lg px-8 py-4"
                  >
                    <Github className="mr-3 w-6 h-6" />
                    Continue with GitHub
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-gray-900 mb-4">What you'll get:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Automatic account creation with your GitHub profile</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Secure authentication via GitHub OAuth</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Access to all FeaturePulse features</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </div>
          </div>

          {/* Right Column - Features */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Why Choose FeaturePulse?
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    AI-Powered Analysis
                  </h3>
                  <p className="text-gray-600">
                    Advanced AI models analyze your pull requests against project intent rules
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Enterprise Security
                  </h3>
                  <p className="text-gray-600">
                    Bank-level encryption and security protocols to protect your code
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Team Collaboration
                  </h3>
                  <p className="text-gray-600">
                    Seamless integration with your existing development workflow
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                🔒 Secure & Private
              </h3>
              <ul className="space-y-1 text-blue-800 text-sm">
                <li>• We never store your GitHub password</li>
                <li>• All data is encrypted in transit and at rest</li>
                <li>• You can revoke access at any time</li>
                <li>• Minimal permissions required for core functionality</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
