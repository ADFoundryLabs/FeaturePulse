import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Github, Shield, BookOpen, Home, Zap, BarChart3, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import UserProfile from './UserProfile';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, initiateGitHubAuth } = useAuth();

  const navigation = [
    { name: 'Home', href: '/', icon: Home, public: true },
    { name: 'Features', href: '/features', icon: Zap, public: true },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, public: false },
    { name: 'Security', href: '/security', icon: Shield, public: false },
    { name: 'Documentation', href: '/docs', icon: BookOpen, public: true },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.public || isAuthenticated
  );

  const isActive = (href) => location.pathname === href;

  const handleLogin = () => {
    initiateGitHubAuth();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">FeaturePulse</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-primary-600 p-2 rounded-md"
                    title="Profile"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                  <UserProfile />
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  className="btn-primary inline-flex items-center"
                >
                  <Github className="w-4 h-4 mr-2" />
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            {isAuthenticated && (
              <Link
                to="/profile"
                className="text-gray-700 hover:text-primary-600"
              >
                <User className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-600 p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Auth Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                {isAuthenticated ? (
                  <div className="px-3 py-2">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={user?.avatar_url}
                        alt={user?.login}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{user?.name || user?.login}</div>
                        <div className="text-sm text-gray-500">Connected with GitHub</div>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      handleLogin();
                      setIsOpen(false);
                    }}
                    className="w-full btn-primary inline-flex items-center justify-center"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
