import { useState, useEffect } from 'react';
import './Pricing.css';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    description: 'Perfect for individuals wanting quick PR insights only.',
    features: ['summary'], // Matches backend KEY
    highlight: false
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 299,
    description: 'Enforce coding standards and automate summaries.',
    features: ['summary', 'intent'], // CHANGED: 'intent analysis' -> 'intent'
    highlight: true 
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: 999, 
    description: 'Full security auditing, intent checks, and summaries.',
    features: ['summary', 'intent', 'security'], // CHANGED: 'intent analysis' -> 'intent'
    highlight: false
  }
];

export default function Pricing({ installationId }) {
  const [activeSubscription, setActiveSubscription] = useState([]);
  const [loading, setLoading] = useState(false);

  // Use the environment variable for consistency
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    if (installationId) {
      fetch(`${API_URL}/api/subscription/${installationId}`)
        .then(res => res.json())
        .then(data => setActiveSubscription(data.features || []))
        .catch(err => console.error("Failed to fetch sub", err));
    }
  }, [installationId, API_URL]);

  const handlePayment = async (plan) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: plan.features, installationId })
      });
      
      if (!res.ok) throw new Error("Order creation failed");
      
      const order = await res.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "FeaturePulse",
        description: `${plan.name} Plan`,
        order_id: order.id,
        handler: async function (response) {
          const verifyRes = await fetch(`${API_URL}/api/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application
