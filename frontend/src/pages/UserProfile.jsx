import React, { useState, useEffect } from 'react';
import { Github, Mail, Calendar, Shield, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setError('');
      await logout();
      navigate('/');
    } catch (err) {
      setError('Failed to logout. Please try again.');
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {/* Main Profile Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Background */}
          <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-700" />

          {/* Profile Content */}
          <div className="px-6 pb-6">
            {/* Avatar and Name */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16 mb-8">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
              <div className="mt-4 sm:mt-0 flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{user.name || user.login}</h1>
                <div className="flex items-center text-gray-600 mt-2">
                  <Github className="w-4 h-4 mr-2" />
                  <a
                    href={`https://github.com/${user.login}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-600 hover:underline"
                  >
                    @{user.login}
                  </a>
                </div>
              </div>
            </div>

            {/* Profile Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* User ID */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <Shield className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">GitHub ID</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{user.id}</p>
                </div>
              </div>

              {/* Email */}
              {user.email && (
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1 break-all">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Account Status */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <Github className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Account Status</p>
                  <div className="flex items-center mt-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <p className="text-lg font-semibold text-gray-900">Connected with GitHub</p>
                  </div>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr className="my-8" />

            {/* Actions */}
            <div className="space-y-3">
              <a
                href={`https://github.com/${user.login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors text-center"
              >
                View GitHub Profile
              </a>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </>
                )}
              </button>
            </div>

            {/* Security Info */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Security:</strong> Your GitHub authentication is secure and encrypted. 
                You can revoke access at any time from your GitHub settings.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Account Type</h3>
            <p className="text-2xl font-bold text-gray-900">GitHub User</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Status</h3>
            <p className="text-2xl font-bold text-green-600">✓ Active</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Access Level</h3>
            <p className="text-2xl font-bold text-gray-900">Premium</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
