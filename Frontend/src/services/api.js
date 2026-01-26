/**
 * API service for communicating with the FeaturePulse backend
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Fetch subscription data (including settings)
 */
export async function fetchSubscription(installationId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/subscription/${installationId}`);
    if (!response.ok) throw new Error('Failed to fetch subscription');
    return await response.json();
  } catch (error) {
    console.error('Error fetching subscription:', error);
    throw error;
  }
}

/**
 * Update configuration settings (Authority Mode)
 */
export async function saveSettings(installationId, settings) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ installationId, settings })
    });
    if (!response.ok) throw new Error('Failed to save settings');
    return await response.json();
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

// --- MOCK / PLACEHOLDERS (Keep these for now to avoid breaking other components) ---

export async function fetchRecentAnalyses() {
  return [
    { id: 1, prNumber: 123, title: 'Add user authentication', score: 85, decision: 'APPROVE', repo: 'myorg/myrepo', date: '2026-01-24' },
    { id: 2, prNumber: 121, title: 'Refactor API', score: 65, decision: 'WARN', repo: 'myorg/myrepo', date: '2026-01-23' }
  ];
}

export async function fetchDashboardStats() {
  return { totalPRs: 42, approved: 28, warnings: 10, blocked: 4 };
}
