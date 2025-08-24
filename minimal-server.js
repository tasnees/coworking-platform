const express = require('express');
const app = express();
const PORT = 5001;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Minimal server is running' });
});

app.listen(PORT, () => {
  console.log(`✅ Minimal server running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}/api/health`);
});
