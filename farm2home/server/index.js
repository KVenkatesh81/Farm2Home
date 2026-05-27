require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use(function(req, res, next) {
  const origin = req.headers.origin;
  if (!origin || origin.includes('github.dev') || origin.includes('vercel.app') || origin.includes('localhost')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-admin-secret');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  if (req.method === 'OPTIONS') { res.sendStatus(200); return; }
  next();
});

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/transport', require('./routes/transport'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

mongoose.connect(process.env.MONGO_URI)
  .then(function() { console.log('MongoDB connected'); })
  .catch(function(err) { console.log('MongoDB error:', err); });

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    console.log('Loading embedding model...');
    const { loadModel } = require('./utils/embeddings');
    await loadModel();
    console.log('Embedding model ready!');
  } catch (err) {
    console.log('Embedding preload failed:', err.message);
  }
  app.listen(PORT, function() {
    console.log('Server running on port ' + PORT);
  });
}

start();
