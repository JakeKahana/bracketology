const getRawBody = (req) => new Promise((resolve, reject) => {
  let data = '';
  req.on('data', chunk => data += chunk);
  req.on('end', () => resolve(data));
  req.on('error', reject);
});

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: { message: 'Method not allowed' } });

  // Parse body — fall back to raw stream if req.body isn't set
  let body = req.body;
  if (!body || typeof body !== 'object') {
    try {
      const raw = await getRawBody(req);
      body = JSON.parse(raw);
    } catch (e) {
      return res.status(400).json({ error: { message: 'Could not parse request body' } });
    }
  }

  const prompt = body?.prompt;
  if (!prompt) {
    return res.status(400).json({ error: { message: 'Missing prompt in request body' } });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: { message: 'ANTHROPIC_API_KEY not set on server' } });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: { message: err.message } });
  }
};
