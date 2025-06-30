const WireGuardManager = require('./wireguard');
const QoSManager = require('./qos');
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// API Endpoints
app.post('/api/client', (req, res) => {
  const config = WireGuardManager.generateClientConfig(req.body.clientName);
  if (config) {
    res.json({ success: true, config });
  } else {
    res.status(500).json({ success: false });
  }
});

app.post('/api/qos/apply', (req, res) => {
  const success = QoSManager.applyRules();
  res.json({ success });
});

// Monitoring endpoint
app.get('/api/status', (req, res) => {
  try {
    const wgStatus = require('child_process').execSync('wg show').toString();
    const latency = require('child_process').execSync('ping -c 4 8.8.8.8 | tail -1 | awk \'{print $4}\'').toString();
    
    res.json({
      wireguard: wgStatus,
      latency: latency.trim(),
      status: 'active'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Game Relay Server running on port ${PORT}`);
  console.log('WireGuard status:', WireGuardManager.start() ? 'Active' : 'Inactive');
  console.log('QoS status:', QoSManager.applyRules() ? 'Active' : 'Inactive');
});
