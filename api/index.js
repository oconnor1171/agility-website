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

    const systemPrompt = `You are the chat assistant for Agility Accountants & Advisors, a CPA-led financial analysis, tax planning, and bookkeeping firm in Bel Air, MD, serving Maryland, Virginia, Washington, DC and Pennsylvania. Principal: Robert O'Connor, Maryland CPA. Phone: 410-456-2433. Email: roconnor@agility-accountants.com. Location: Bel Air, Maryland. The first call is a complimentary 30-minute consultation; fees are quoted in writing after it. Never quote prices or promise tax savings. Facebook: https://www.facebook.com/profile.php?id=100092463736032. You help with questions about financial analysis services, operational benchmarking, industry coverage, pricing, and getting started. Be helpful, professional, and direct users to schedule consultations for detailed quotes.`;

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
      error: 'Sorry, I\'m having trouble connecting right now. Please call us at 410-456-2433 or email roconnor@agility-accountants.com to schedule your free consultation.'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ── Short vanity redirect: /benchmark → the benchmark tool page ───────────────
app.get(['/benchmark', '/Benchmark'], (req, res) => {
  res.redirect(301, '/pages/benchmark.html');
});

// ── Static site: public paths only ────────────────────────────────────────────
// Changed 2026-09-25 (growth batch 02). Previously express.static(SITE_ROOT) served the
// whole repository (build notes, prompts, scripts) and a catch-all returned the homepage
// with status 200 for every unknown URL (soft 404). See Growth_Operator Change_Log.
const PUBLIC_DIRS = ['pages', 'css', 'js', 'images'];
const PUBLIC_ROOT_FILES = ['robots.txt', 'sitemap.xml', 'llms.txt', 'googlea59ef34888fbcc3d.html'];
const IMAGE_EXT = /\.(jpe?g|png|svg|gif|webp|ico)$/i;

// Legacy paths from the previous Wix site and bare paths, 301 to the real page
const LEGACY = {
  '/contact': '/pages/contact.html', '/contact-me': '/pages/contact.html',
  '/business-funding': '/pages/business-funding.html', '/about': '/pages/about.html',
  '/services': '/pages/services.html', '/book-online': '/pages/book-online.html',
  '/blog': '/pages/blog.html', '/shop': '/pages/shop.html', '/resources': '/pages/resource.html',
  '/tax-planning': '/pages/plan.html', '/plan': '/pages/plan.html',
  '/restaurant-bar': '/pages/restaurant-bar.html', '/real-estate': '/pages/real-estate.html',
  '/financial-analysis': '/pages/financial-analysis.html',
  '/services-1': '/pages/services.html', '/free-download': '/pages/free-download.html',
  '/guide': '/pages/guide.html', '/category/all-products': '/pages/shop.html',
  '/ratio-download': '/pages/ratio-download.html', '/groups': '/pages/groups.html',
  '/resource': '/pages/resource.html',
};
app.get(Object.keys(LEGACY), (req, res) => res.redirect(301, LEGACY[req.path.toLowerCase()] || '/'));
app.get('/post/*', (req, res) => res.redirect(301, '/pages/blog.html'));

app.get(['/', '/index.html'], (req, res) => res.sendFile(path.join(SITE_ROOT, 'index.html')));
PUBLIC_ROOT_FILES.forEach((f) => app.get('/' + f, (req, res) => res.sendFile(path.join(SITE_ROOT, f))));
app.use('/images', (req, res, next) => (IMAGE_EXT.test(req.path) ? next() : res.status(404).sendFile(path.join(SITE_ROOT, '404.html'))));
PUBLIC_DIRS.forEach((d) => app.use('/' + d, express.static(path.join(SITE_ROOT, d), { dotfiles: 'deny', index: false })));

// Everything else is a real 404, never a copy of the homepage
app.use((req, res) => {
  res.status(404).sendFile(path.join(SITE_ROOT, '404.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port} — serving site from ${SITE_ROOT}`);
});