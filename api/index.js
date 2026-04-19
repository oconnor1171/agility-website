const express = require('express');
const cors = require('cors');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const port = process.env.PORT || 3000;

// Root of the website (one level above this api/ directory)
const SITE_ROOT = path.join(__dirname, '..');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// ── API routes (must come BEFORE static so /api/* doesn't match files) ────────

// Chat endpoint — called as /api/chat by the front-end JS
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are the chat assistant for Agility Accountants & Advisors, a CPA-led financial analysis, tax planning, and bookkeeping firm in Baltimore, MD. Principal: Robert O'Connor, CPA. Phone: 410-456-2433. Email: oconnor1171@gmail.com. Location: Baltimore, Maryland. Facebook: https://www.facebook.com/profile.php?id=100092463736032. You help with questions about financial analysis services, operational benchmarking, industry coverage, pricing, and getting started. Be helpful, professional, and direct users to schedule consultations for detailed quotes.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }]
    });

    const reply = response.content[0].text;
    res.json({ reply });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'Sorry, I\'m having trouble connecting right now. Please call us at 410-456-2433 or email oconnor1171@gmail.com to schedule your free consultation.'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ── Static site (serves index.html, pages/*, css/*, js/*, images/*) ───────────
app.use(express.static(SITE_ROOT));

// Catch-all: return index.html for any unmatched path so direct-URL navigation works
app.get('*', (req, res) => {
  res.sendFile(path.join(SITE_ROOT, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port} — serving site from ${SITE_ROOT}`);
});