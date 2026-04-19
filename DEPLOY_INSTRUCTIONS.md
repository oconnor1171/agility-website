# Agility Website — Deployment & DNS Setup Guide

## What Was Fixed (April 2026)

| # | Problem | Fix Applied |
|---|---------|-------------|
| 1 | `render.yaml` had two services (static + API); frontend `/api/chat` calls hit the wrong service | Consolidated to a single Node web service that serves both static files and the API |
| 2 | Express routes were `/chat` and `/health` — front-end calls `/api/chat` | Routes renamed to `/api/chat` and `/api/health` |
| 3 | Mobile nav had no hamburger button; JS targeted classes that don't exist in the HTML | `main.js` now injects the hamburger dynamically; toggle uses correct `.nav-menu.active` class |
| 4 | Mobile dropdowns used `:hover` (doesn't fire on touch screens) | CSS updated to `.dropdown.open` toggled by JS click handler |
| 5 | `chat-widget.js` had a duplicate `reset()` — second one overwrote the first and lost `mode` state | Removed duplicate; kept the complete version |

---

## Step 1 — Set the ANTHROPIC_API_KEY in Render

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Open your **agility-website** service → **Environment** tab
3. Add a new environment variable:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** your actual Anthropic API key (get it from [console.anthropic.com](https://console.anthropic.com))
4. Click **Save Changes** — Render will auto-redeploy

---

## Step 2 — Commit & Push the Code Changes to GitHub

The Render service deploys from your GitHub repo. Push these file changes:

```bash
cd "D:\Users\oconn\OneDrive\Documents\Agility\website"
git add render.yaml api/index.js js/main.js js/chat-widget.js css/style.css
git commit -m "Fix Render config, mobile nav, chat widget, and API routing"
git push origin main
```

Render will detect the push and redeploy automatically. Watch the deploy logs in the Render dashboard to confirm it succeeds.

---

## Step 3 — Move DNS from Wix to Cloudflare

You already have a Cloudflare account. Follow these steps exactly.

### 3A — Add the site to Cloudflare

1. Log into [cloudflare.com](https://cloudflare.com)
2. Click **Add a Site** → enter `agility-accountants.com` → click **Continue**
3. Choose the **Free** plan
4. Cloudflare will scan and import your existing DNS records. Review them, but do NOT save yet.

### 3B — Set the correct DNS records in Cloudflare

Delete any existing `A` or `CNAME` records for `@` (root) and `www`.
Then add these exact records:

| Type | Name | Value | Proxy Status |
|------|------|-------|--------------|
| `A` | `@` (root) | `216.24.57.1` | **Proxied** (orange cloud) |
| `CNAME` | `www` | `agility-website.onrender.com` | **Proxied** (orange cloud) |

> **Important:** Replace `agility-website.onrender.com` with your actual Render service domain.
> Find it in Render dashboard → your service → **Settings** → **Custom Domains** section — it shows the `.onrender.com` URL.

Click **Save** after adding records.

### 3C — Get Cloudflare's nameservers

After adding the site, Cloudflare will show you **two nameserver addresses**, something like:
- `aria.ns.cloudflare.com`
- `bob.ns.cloudflare.com`

Write these down — you need them in the next step.

### 3D — Update nameservers in Wix

1. Log into [wix.com](https://wix.com) → **Domains** → click `agility-accountants.com`
2. Go to **Advanced** → **Nameservers**
3. Replace the existing Wix nameservers with the two Cloudflare nameservers from Step 3C
4. Save

> Wix will show a warning that your domain is "pointing away from Wix." That is correct — ignore it and do NOT click "Try Again."

### 3E — Wait for propagation

DNS propagation takes 15 minutes to 4 hours. You can check progress at [dnschecker.org](https://dnschecker.org) — search for `agility-accountants.com` and look for the `A` record to show `216.24.57.1` worldwide.

---

## Step 4 — Verify Render Custom Domains

Once DNS propagates, verify both domains in Render:

1. Render dashboard → **agility-website** service → **Settings** → **Custom Domains**
2. Both `agility-accountants.com` and `www.agility-accountants.com` should show **Verified** with a green checkmark
3. If either shows pending, click **Verify** to trigger a re-check

Render auto-provisions SSL certificates via Let's Encrypt. Both domains will be HTTPS automatically.

---

## Step 5 — Test Everything

Once live, test these on a **mobile device**:

- [ ] `https://agility-accountants.com` loads the home page
- [ ] `https://www.agility-accountants.com` redirects to the root domain
- [ ] Hamburger menu (☰) appears and toggles open/closed on mobile
- [ ] Services dropdown expands when tapped on mobile
- [ ] Chat bubble (💬) opens the booking/Q&A widget
- [ ] Typing a question in the chat widget gets an AI response (tests the API key)

---

## Architecture (After Fix)

```
Browser
  │
  ▼
Cloudflare (DNS + SSL proxy)
  │
  ▼
Render — agility-website (single Node.js web service)
  │
  ├── GET /              → serves index.html
  ├── GET /pages/*.html  → serves page files
  ├── GET /css/*.css     → serves stylesheets
  ├── GET /js/*.js       → serves scripts
  ├── GET /images/*      → serves images
  └── POST /api/chat     → Express handler → Anthropic API → response
```

Everything is one service. No cross-origin calls. No CORS issues.

---

## If the Deploy Fails

Check the Render deploy logs. Common issues:

- **`Cannot find module '@anthropic-ai/sdk'`** — the `cd api && npm install` build command didn't run. Make sure the Render service root directory is set to `.` (the repo root), not `api/`.
- **`ANTHROPIC_API_KEY is not set`** — you skipped Step 1. Add the env var in Render.
- **Port binding error** — Render auto-sets `PORT` to `10000`. The server uses `process.env.PORT || 3000` so this is handled automatically.
