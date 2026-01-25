import { useState, useEffect } from 'react';
import './Pricing.css';

const FEATURE_PRICES = { intent: 499, security: 499, summary: 299 };

// REPLACE THIS with your specific GitHub App Link
const GITHUB_APP_URL = "https://github.com/apps/featurepulse-merge";

export default function Pricing({ installationId }) {
  const [selectedFeatures, setSelectedFeatures] = useState({
    intent: false, security: false, summary: false
  });
  const [activeSubscription, setActiveSubscription] = useState([]);

  useEffect(() => {
    if (installationId) {
      // Fetch current subscription from our backend
      fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/subscription/${installationId}`)
        .then(res => res.json())
        .then(data => setActiveSubscription(data.features || []))
        .catch(err => console.error("Failed to fetch sub", err));
    }
  }, [installationId]);

  const toggleFeature = (feature) => {
    if (activeSubscription.includes(feature)) return; // Already bought
    setSelectedFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
  };

  const calculateTotal = () => {
    let total = 0;
    Object.keys(selectedFeatures).forEach(f => {
      if (selectedFeatures[f]) total += FEATURE_PRICES[f];
    });
    // 20% discount if buying all 3 NEW features
    if (selectedFeatures.intent && selectedFeatures.security && selectedFeatures.summary) {
      total = Math.floor(total * 0.8);
    }
    return total;
  };

  const handlePayment = async () => {
    const featuresToBuy = Object.keys(selectedFeatures).filter(k => selectedFeatures[k]);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: featuresToBuy, installationId })
      });
      const order = await res.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "FeaturePulse",
        order_id: order.id,
        handler: async function (response) {
          const verifyRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              features: featuresToBuy,
              installationId
            })
          });
          const data = await verifyRes.json();
          if (data.status === 'success') {
            alert("Success! Features Active.");
            window.location.reload();
          }
        }
      };
      new window.Razorpay(options).open();
    } catch (err) {
      alert("Payment failed");
    }
  };

  if (!installationId) {
    return (
      <div className="pricing-container">
        <h2>Connect GitHub First</h2>
        <p>Please install FeaturePulse on your repository to configure billing.</p>
        <a href={GITHUB_APP_URL} className="install-btn">
          Install FeaturePulse on GitHub
        </a>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="pricing-container">
      <div className="header-status">
        <h2>Configure Plan</h2>
        <span className="badge">Installation ID: {installationId}</span>
      </div>

      <div className="features-grid">
        {['intent', 'security', 'summary'].map(f => {
          const isPurchased = activeSubscription.includes(f);
          const isSelected = selectedFeatures[f];
          
          return (
            <div 
              key={f}
              className={`feature-card ${isSelected || isPurchased ? 'selected' : ''} ${isPurchased ? 'purchased' : ''}`}
              onClick={() => toggleFeature(f)}
            >
              <h3>{f.toUpperCase()}</h3>
              <p>{f === 'intent' ? 'AI Product Alignment' : f === 'security' ? 'Vuln Scanning' : 'PR Summaries'}</p>
              <span className="price">{isPurchased ? 'ACTIVE' : `₹${FEATURE_PRICES[f]}/mo`}</span>
            </div>
          );
        })}
      </div>

      <div className="checkout-bar">
        <span>Total: ₹{total}</span>
        <button className="pay-btn" onClick={handlePayment} disabled={total === 0}>
          {total === 0 ? "Select Features" : "Pay & Upgrade"}
        </button>
      </div>
    </div>
  );
}