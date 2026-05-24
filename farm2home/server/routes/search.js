const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const router = express.Router();

router.get('/', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  try {
    const scriptPath = path.join(__dirname, '../utils/search.js');
    const env = { ...process.env };

    const child = spawn('node', ['-e', `
require('dotenv').config({ path: require('path').resolve(__dirname, '${path.join(__dirname, '../.env')}') });
${require('fs').readFileSync(scriptPath, 'utf8')}
    `], { env });

    let output = '';
    let error = '';

    child.stdout.on('data', d => output += d.toString());
    child.stderr.on('data', d => error += d.toString());

    child.on('close', (code) => {
      if (code !== 0) {
        console.error('Search process error:', error);
        return res.json([]);
      }
      try {
        const results = JSON.parse(output);
        res.json(results);
      } catch (e) {
        console.error('Parse error:', e.message);
        res.json([]);
      }
    });

    setTimeout(() => {
      child.kill();
      if (!res.headersSent) res.json([]);
    }, 25000);

  } catch (err) {
    console.error('Search error:', err.message);
    res.json([]);
  }
});

module.exports = router;
