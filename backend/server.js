const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const admin = require('firebase-admin');
require('dotenv').config();

// Firebase Admin Setup
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
if (require('fs').existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin initialized');
} else {
  console.warn('Firebase Admin NOT initialized: serviceAccountKey.json not found');
}

const app = express();
const PORT = process.env.PORT || 3000;
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:5001';

// Supabase Setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for backend operations
);

app.use(cors());
app.use(express.json());

// --- ROUTES ---

// Health Check
app.get('/health', (req, res) => res.json({ status: 'AgroLink AI Backend Operational' }));

// AI Proxy: Price Suggestion
app.post('/api/ai/price-suggest', async (req, res) => {
  try {
    const { product, region } = req.body;
    const response = await axios.post(`${AI_ENGINE_URL}/api/ai/price-suggestion`, { product, region });
    res.json(response.data);
  } catch (error) {
    console.error('AI Engine Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch AI insights' });
  }
});

// AI Proxy: Recommendations
app.get('/api/ai/recommendations', async (req, res) => {
  try {
    const { role } = req.query;
    const response = await axios.get(`${AI_ENGINE_URL}/api/ai/recommendations?role=${role}`);
    res.json(response.data);
  } catch (error) {
    console.error('AI Engine Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch AI recommendations' });
  }
});

// Farmer Verification (Admin/Internal)
app.post('/api/farmers/verify', async (req, res) => {
  const { farmerId, status } = req.body;
  const { data, error } = await supabase
    .from('profiles')
    .update({ verified_status: status })
    .eq('id', farmerId);
  
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: `Farmer ${farmerId} verification set to ${status}`, data });
});

// Order Notification (Simulated)
app.post('/api/orders/notify', async (req, res) => {
    const { orderId, farmerId } = req.body;
    // Here you would integrate with FCM (Firebase Cloud Messaging) or SMS gateway
    console.log(`Notifying farmer ${farmerId} about new order ${orderId}`);
    res.json({ success: true, message: 'Notification sent' });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`AgroLink AI Backend running on http://0.0.0.0:${PORT}`);
});
