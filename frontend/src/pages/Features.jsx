import React, { useState } from 'react';
import { CheckCircle, Zap, Shield, GitBranch, BarChart3, Code2, Users, Clock } from 'lucide-react';

const Features = () => {
  const [activeTab, setActiveTab] = useState('analysis');

  const features = {
    analysis: [
      {
        icon: Code2,
        title: 'Smart Code Analysis',
        description: 'AI-powered analysis understands your code context and provides meaningful insights',
        benefits: ['Reduces review time by 80%', 'Catches potential issues early', 'Maintains code consistency']
      },
      {
        icon: GitBranch,
        title: 'Branch-Aware Rules',
        description: 'Different analysis rules for different branches based on deployment strategy',
        benefits: ['Master branch protection', 'Feature branch flexibility', 'Release branch validation']
      },
      {
        icon: BarChart3,
        title: 'Detailed Reports',
        description: 'Comprehensive analysis reports with actionable recommendations',
        benefits: ['Visual insights', 'Trend analysis', 'Team performance metrics']
      }
    ],
    security: [
      {
        icon: Shield,
        title: 'Enterprise Security',
        description: 'Bank-level encryption and security protocols to protect your code',
        benefits: ['End-to-end encryption', 'SOC 2 compliant', 'Regular security audits']
      },
      {
        icon: Users,
        title: 'Role-Based Access',
        description: 'Granular permissions and access control for team members',
        benefits: ['Custom roles', 'Audit logs', 'Secure API keys']
      }
    ],
    collaboration: [
      {
        icon: Users,
        title: 'Team Collaboration',
        description: 'Seamless integration with your existing development workflow',
        benefits: ['Real-time notifications', 'Team insights', 'Shared knowledge base']
      },
      {
        icon: Clock,
        title: 'Time-Saving Automation',
        description: 'Automate repetitive review tasks and focus on what matters',
        benefits: ['Automated checks', 'Smart suggestions', 'Quick approvals']
      }
    ]
  };

  const tabs = [
    { id: 'analysis', label: 'AI Analysis', icon: Zap },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'collaboration', label: 'Collaboration', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Powerful Features for
            <span className="gradient-text"> Modern Development</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            FeaturePulse combines cutting-edge AI with enterprise-grade security to deliver 
            the most intelligent PR analysis platform available.
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 inline-flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features[activeTab].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="card hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Technical Specs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Capabilities</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Models</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Google Gemini 2.0 Flash integration</li>
                <li>• Custom fine-tuned models for code analysis</li>
                <li>• Multi-language support (50+ programming languages)</li>
                <li>• Context-aware analysis with project history</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• GitHub Apps & OAuth integration</li>
                <li>• RESTful API with webhooks</li>
                <li>• Slack & Microsoft Teams notifications</li>
                <li>• CI/CD pipeline integration</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-gradient-to-r from-primary-600 to-blue-500 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Performance Metrics</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { metric: '< 2s', label: 'Average Analysis Time' },
              { metric: '99.9%', label: 'Uptime SLA' },
              { metric: '10GB+', label: 'Code Processed Daily' },
              { metric: '50+', label: 'Supported Languages' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold mb-2">{item.metric}</div>
                <div className="text-blue-100">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
