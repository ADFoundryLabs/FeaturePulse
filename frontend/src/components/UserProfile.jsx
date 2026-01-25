import React, { useState } from 'react';
import { Github, LogOut, User, ExternalLink, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <img
          src={user.avatar_url}
          alt={user.login}
          className="w-8 h-8 rounded-full"
        />
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900">{user.name || user.login}</div>
          <div className="text-xs text-gray-500 flex items-center">
            <Github className="w-3 h-3 mr-1" />
            Connected with GitHub
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            {/* User Info Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{user.name || user.login}</h3>
                  <p className="text-sm text-gray-500">@{user.login}</p>
                  {user.email && (
                    <p className="text-xs text-gray-400">{user.email}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-3 flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                <Github className="w-3 h-3 mr-1" />
                Account linked with GitHub
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              <a
                href={`https://github.com/${user.login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View GitHub Profile</span>
              </a>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <p className="text-xs text-gray-500">
                GitHub ID: {user.id}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;
