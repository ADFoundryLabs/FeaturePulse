import React, { useState, useEffect } from 'react';
import { Shield, Key, Plus, Trash2, Copy, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';

const SecurityCenter = () => {
  const [activeTab, setActiveTab] = useState('api-keys');
  const [apiKeys, setApiKeys] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [showCreateWebhook, setShowCreateWebhook] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newKey, setNewKey] = useState({
    name: '',
    permissions: ['read'],
    expiresAt: ''
  });

  const [newWebhook, setNewWebhook] = useState({
    url: '',
    events: ['pull_request'],
    secret: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [keysResponse, webhooksResponse] = await Promise.all([
        apiService.getAPIKeys(),
        apiService.getWebhooks()
      ]);
      setApiKeys(keysResponse.data || []);
      setWebhooks(webhooksResponse.data || []);
    } catch (err) {
      setError('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const createAPIKey = async () => {
    try {
      const response = await apiService.createAPIKey(newKey);
      setApiKeys([...apiKeys, response.data]);
      setShowCreateKey(false);
      setNewKey({ name: '', permissions: ['read'], expiresAt: '' });
      setSuccess('API key created successfully');
    } catch (err) {
      setError('Failed to create API key');
    }
  };

  const revokeAPIKey = async (keyId) => {
    try {
      await apiService.revokeAPIKey(keyId);
      setApiKeys(apiKeys.filter(key => key.id !== keyId));
      setSuccess('API key revoked successfully');
    } catch (err) {
      setError('Failed to revoke API key');
    }
  };

  const createWebhook = async () => {
    try {
      const response = await apiService.createWebhook(newWebhook);
      setWebhooks([...webhooks, response.data]);
      setShowCreateWebhook(false);
      setNewWebhook({ url: '', events: ['pull_request'], secret: '' });
      setSuccess('Webhook created successfully');
    } catch (err) {
      setError('Failed to create webhook');
    }
  };

  const deleteWebhook = async (webhookId) => {
    try {
      await apiService.deleteWebhook(webhookId);
      setWebhooks(webhooks.filter(webhook => webhook.id !== webhookId));
      setSuccess('Webhook deleted successfully');
    } catch (err) {
      setError('Failed to delete webhook');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard');
  };

  const tabs = [
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'webhooks', label: 'Webhooks', icon: Shield },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading security settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Center</h1>
          <p className="text-gray-600">Manage your API keys, webhooks, and security settings</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* API Keys Tab */}
          {activeTab === 'api-keys' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">API Keys</h2>
                <button
                  onClick={() => setShowCreateKey(true)}
                  className="btn-primary inline-flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create API Key
                </button>
              </div>

              {apiKeys.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Key className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No API keys found. Create your first API key to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{key.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Created: {new Date(key.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Permissions: {key.permissions.join(', ')}
                          </p>
                          {key.expiresAt && (
                            <p className="text-sm text-gray-500">
                              Expires: {new Date(key.expiresAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => copyToClipboard(key.key)}
                            className="p-2 text-gray-500 hover:text-gray-700"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => revokeAPIKey(key.id)}
                            className="p-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Create API Key Modal */}
              {showCreateKey && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 className="text-lg font-semibold mb-4">Create API Key</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={newKey.name}
                          onChange={(e) => setNewKey({...newKey, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="My API Key"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Permissions
                        </label>
                        <div className="space-y-2">
                          {['read', 'write', 'admin'].map((permission) => (
                            <label key={permission} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={newKey.permissions.includes(permission)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewKey({...newKey, permissions: [...newKey.permissions, permission]});
                                  } else {
                                    setNewKey({...newKey, permissions: newKey.permissions.filter(p => p !== permission)});
                                  }
                                }}
                                className="mr-2"
                              />
                              <span className="capitalize">{permission}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expires At (optional)
                        </label>
                        <input
                          type="date"
                          value={newKey.expiresAt}
                          onChange={(e) => setNewKey({...newKey, expiresAt: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        onClick={() => setShowCreateKey(false)}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={createAPIKey}
                        className="btn-primary"
                      >
                        Create Key
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Webhooks Tab */}
          {activeTab === 'webhooks' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Webhooks</h2>
                <button
                  onClick={() => setShowCreateWebhook(true)}
                  className="btn-primary inline-flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Webhook
                </button>
              </div>

              {webhooks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No webhooks configured. Create your first webhook to receive real-time events.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {webhooks.map((webhook) => (
                    <div key={webhook.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{webhook.url}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Events: {webhook.events.join(', ')}
                          </p>
                          <p className="text-sm text-gray-500">
                            Created: {new Date(webhook.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteWebhook(webhook.id)}
                          className="p-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Create Webhook Modal */}
              {showCreateWebhook && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 className="text-lg font-semibold mb-4">Create Webhook</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          URL
                        </label>
                        <input
                          type="url"
                          value={newWebhook.url}
                          onChange={(e) => setNewWebhook({...newWebhook, url: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="https://your-domain.com/webhook"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Events
                        </label>
                        <div className="space-y-2">
                          {['pull_request', 'push', 'issues'].map((event) => (
                            <label key={event} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={newWebhook.events.includes(event)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewWebhook({...newWebhook, events: [...newWebhook.events, event]});
                                  } else {
                                    setNewWebhook({...newWebhook, events: newWebhook.events.filter(e => e !== event)});
                                  }
                                }}
                                className="mr-2"
                              />
                              <span>{event}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Secret (optional)
                        </label>
                        <input
                          type="password"
                          value={newWebhook.secret}
                          onChange={(e) => setNewWebhook({...newWebhook, secret: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Webhook secret"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        onClick={() => setShowCreateWebhook(false)}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={createWebhook}
                        className="btn-primary"
                      >
                        Create Webhook
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityCenter;
