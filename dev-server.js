const http = require('http');
const fs = require('fs');
const path = require('path');

// Load .env.local
try {
  fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8')
    .split('\n').forEach(line => {
      const [key, ...vals] = line.split('=');
      if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
    });
} catch (e) {}

const generateHandler = require('./api/generate.js');

const server = http.createServer(async (req, res) => {
  // Add Express-style helpers to res
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  if (req.url === '/api/generate' && req.method === 'POST') {
    return await generateHandler(req, res);
  }

  // Serve bracketology.html for everything else
  const html = fs.readFileSync(path.join(__dirname, 'bracketology.html'));
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

server.listen(3000, () => {
  console.log('✅ Dev server running at http://localhost:3000');
});
