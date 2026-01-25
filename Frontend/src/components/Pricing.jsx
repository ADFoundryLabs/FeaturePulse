import { useState, useEffect } from 'react';
import './Pricing.css'; // Ensure you have the CSS file too!

const FEATURE_PRICES = { intent: 499, security: 499, summary: 299 };
const GITHUB_APP_URL = "hhttps://github.com/apps/featurepulse-merge"; // Update this with YOUR App Link

export default function Pricing({ installationId }) {
  const [selectedFeatures, setSelectedFeatures] = useState({
    intent: false, security: false, summary: false
  });
  const [activeSubscription, setActiveSubscription] = useState([]);

  useEffect(() => {
    if (installationId) {
      // Check subscription status from backend
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/subscription/${installationId}`)
        .then(res => res.json())
        .then(data => setActiveSubscription(data.features || []))
        .catch(err => console.error("Failed to fetch sub", err));
    }
  }, [installationId]);

  const toggleFeature = (feature) => {
    if (activeSubscription.includes(feature)) return;
    setSelectedFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
  };

  const calculateTotal = () => {
    let total = 0;
    Object.keys(selectedFeatures).forEach(f => {
      if (selectedFeatures[f]) total += FEATURE_PRICES[f];
    });
    if (selectedFeatures.intent && selectedFeatures.security && selectedFeatures.summary) {
      total = Math.floor(total * 0.8);
    }
    return total;
  };

  const handlePayment = async () => {
    const featuresToBuy = Object.keys(selectedFeatures).filter(k => selectedFeatures[k]);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/create-order`, {
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
          const verifyRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, features: featuresToBuy, installationId })
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
        <a href={GITHUB_APP_URL} className="install-btn">Install FeaturePulse on GitHub</a>
      </div>
    );
  }

  return (
    <div className="pricing-container">
      <h2>Configure Plan (ID: {installationId})</h2>
      <div className="features-grid">
        {['intent', 'security', 'summary'].map(f => (
          <div 
            key={f} 
            className={`feature-card ${selectedFeatures[f] ? 'selected' : ''} ${activeSubscription.includes(f) ? 'purchased' : ''}`}
            onClick={() => toggleFeature(f)}
          >
            <h3>{f.toUpperCase()}</h3>
            <span className="price">{activeSubscription.includes(f) ? 'ACTIVE' : `₹${FEATURE_PRICES[f]}`}</span>
          </div>
        ))}
      </div>
      <button className="pay-btn" onClick={handlePayment} disabled={calculateTotal() === 0}>
        Pay ₹{calculateTotal()}
      </button>
    </div>
  );
}