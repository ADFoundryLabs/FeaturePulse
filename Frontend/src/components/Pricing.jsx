import { useState, useEffect } from 'react';
import './Pricing.css';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    description: 'Perfect for individuals wanting quick PR insights only.',
    features: ['summary'], // Maps to backend feature
    highlight: false
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 299,
    description: 'Enforce coding standards and automate summaries.',
    features: ['summary', 'intent analysis'],
    highlight: true // Recommended plan
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: 999, // ~20% off 1297 (499+499+299)
    description: 'Full security auditing, intent checks, and summaries with special developer summary.',
    features: ['summary', 'intent analysis', 'security'],
    highlight: false
  }
];

export default function Pricing({ installationId }) {
  const [activeSubscription, setActiveSubscription] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (installationId) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/subscription/${installationId}`)
        .then(res => res.json())
        .then(data => setActiveSubscription(data.features || []))
        .catch(err => console.error("Failed to fetch sub", err));
    }
  }, [installationId]);

  const handlePayment = async (plan) => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: plan.features, installationId })
      });
      const order = await res.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "FeaturePulse",
        description: `${plan.name} Plan`,
        order_id: order.id,
        handler: async function (response) {
          const verifyRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, features: plan.features, installationId })
          });
          const data = await verifyRes.json();
          if (data.status === 'success') {
            alert(`Success! You are now on the ${plan.name} Plan.`);
            window.location.reload();
          }
        }
      };
      new window.Razorpay(options).open();
    } catch (err) {
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if a plan is "Active"
  const isPlanActive = (planFeatures) => {
    if (activeSubscription.length === 0) return false;
    // Checks if the plan's features match the active subscription exactly
    const sortedPlan = [...planFeatures].sort().join(',');
    const sortedActive = [...activeSubscription].sort().join(',');
    return sortedPlan === sortedActive;
  };

  if (!installationId) {
    return (
      <div className="pricing-container">
        <div className="connect-message">
          <h2>🚀 Ready to optimize your workflow?</h2>
          <p>Connect GitHub to view plans and manage your subscription.</p>
          <a href="https://github.com/apps/featurepulse-merge" className="install-btn">Connect GitHub</a>
        </div>
      </div>
    );
  }

  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <h2>Choose Your Plan</h2>
        <p>Select the package that fits your repository needs (ID: {installationId})</p>
      </div>
      
      <div className="plans-grid">
        {PLANS.map((plan) => {
          const active = isPlanActive(plan.features);
          return (
            <div key={plan.id} className={`plan-card ${plan.highlight ? 'highlight' : ''} ${active ? 'active-plan' : ''}`}>
              {plan.highlight && <div className="popular-badge">MOST POPULAR</div>}
              <h3 className="plan-name">{plan.name}</h3>
              <div className="plan-price">
                <span className="currency">₹</span>
                {plan.price}
                <span className="period">/repo</span>
              </div>
              <p className="plan-desc">{plan.description}</p>
              
              <ul className="plan-features">
                {plan.features.map(f => (
                  <li key={f}>✔ {f.charAt(0).toUpperCase() + f.slice(1)} Analysis</li>
                ))}
              </ul>

              <button 
                className={`plan-btn ${active ? 'btn-active' : ''}`} 
                onClick={() => !active && handlePayment(plan)}
                disabled={active || loading}
              >
                {active ? 'Current Plan' : loading ? 'Processing...' : 'Choose Plan'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}