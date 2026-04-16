const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are the chat assistant for Agility Accountants & Advisors, a CPA-led financial analysis, tax planning, and bookkeeping firm in Baltimore, MD. Principal: Robert O'Connor, CPA. Phone: 410-456-2433. Email: oconnor1171@gmail.com. Location: Baltimore, Maryland. Facebook: https://www.facebook.com/profile.php?id=100092463736032. You help with questions about financial analysis services, operational benchmarking, industry coverage, pricing, and getting started. Be helpful, professional, and direct users to schedule consultations for detailed quotes.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
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
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});