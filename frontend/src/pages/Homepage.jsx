import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Github, Zap, Shield, BookOpen, CheckCircle, BarChart3, GitBranch } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Homepage = () => {
  const { isAuthenticated, user } = useAuth();
  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Analysis',
      description: 'Advanced AI models analyze your pull requests against project intent rules',
    },
    {
      icon: Shield,
      title: 'Security First',
      description: 'Enterprise-grade security with encrypted API keys and secure authentication',
    },
    {
      icon: GitBranch,
      title: 'Smart Branching',
      description: 'Intelligent branch-aware analysis for different deployment strategies',
    },
    {
      icon: BarChart3,
      title: 'Real-time Insights',
      description: 'Get instant feedback and detailed analysis reports for every PR',
    },
  ];

  const stats = [
    { label: 'PRs Analyzed', value: '10,000+' },
    { label: 'Hours Saved', value: '500+' },
    { label: 'Teams Using', value: '50+' },
    { label: 'Accuracy Rate', value: '98%' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered
              <span className="gradient-text"> PR Analysis</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              FeaturePulse automatically analyzes pull requests against your project intent, 
              providing intelligent insights and recommendations to streamline your development workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link to="/security" className="btn-primary inline-flex items-center justify-center">
                    <Shield className="mr-2 w-5 h-5" />
                    Go to Dashboard
                  </Link>
                  <Link to="/features" className="btn-secondary inline-flex items-center justify-center">
                    Explore Features
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/features" className="btn-primary inline-flex items-center justify-center">
                    Explore Features
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link to="/login" className="btn-secondary inline-flex items-center justify-center">
                    <Github className="mr-2 w-5 h-5" />
                    Sign In with GitHub
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose FeaturePulse?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our intelligent system helps teams maintain code quality and project alignment
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card text-center hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in minutes with our simple setup process
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Connect GitHub', description: 'Authorize your repositories and set up webhooks' },
              { step: '2', title: 'Define Intent Rules', description: 'Create project-specific rules and guidelines' },
              { step: '3', title: 'Get Analysis', description: 'Receive instant AI-powered PR analysis and recommendations' },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                  <h3 className="ml-4 text-xl font-semibold text-gray-900">
                    {item.title}
                  </h3>
                </div>
                <p className="text-gray-600 ml-14">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Transform Your PR Workflow?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join teams that are already saving hours of code review time with FeaturePulse
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/security" className="btn-primary">
                Access Your Dashboard
              </Link>
            ) : (
              <Link to="/login" className="btn-primary">
                <Github className="mr-2 w-5 h-5" />
                Get Started Now
              </Link>
            )}
            <Link to="/docs" className="btn-secondary">
              <BookOpen className="mr-2 w-5 h-5" />
              Read Documentation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
