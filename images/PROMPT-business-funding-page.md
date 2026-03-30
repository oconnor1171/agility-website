# Claude Code Prompt — Revise Agility Business Funding Page

Copy everything below the line and paste it into Claude Code as your prompt.

---

## Task

Build a complete, production-ready HTML page to replace my current Business Funding page on my Agility Accountants & Advisors website (https://www.agility-accountants.com/business-funding). The current page is on Wix and is barebones — just a hero banner, two logos, and two "Apply Now" buttons. I need a professional, modern page that I can either embed via Wix's custom HTML embed feature or host separately.

## Brand & Style Requirements

- Company: **Agility Accountants & Advisors**
- Match the existing site's clean, professional look — white/light backgrounds, navy accents
- Typography: use a clean sans-serif font (Inter or similar from Google Fonts)
- The page must be fully responsive (mobile-first)
- Output a single self-contained HTML file (inline CSS and JS — no external files except Google Fonts and the images)

## Image Assets Available

All images are in my local folder. Reference them with relative paths from the HTML file location:

| File | Description |
|------|-------------|
| `national-business-capital-logo.png` | NBC color logo (navy text, red/blue star) — use on white backgrounds |
| `national-business-capital-logo.svg` | NBC color logo SVG (scalable) |
| `national-business-capital-logo-white.png` | NBC white logo — use on dark backgrounds |
| `national-business-capital-logo-white.svg` | NBC white logo SVG |
| `smartbiz-logo.png` | SmartBiz Bank current logo (dark text, gray swoosh) |
| `smartbiz-logo.svg` | SmartBiz Bank logo SVG |
| `hero-business-funding.jpg` | Hero background image for the page |

Use the PNG versions as `src` with SVG as optional enhancement. Size logos to approximately 280px wide max.

## Affiliate Links (CRITICAL — must be exact)

| Partner | Affiliate URL |
|---------|---------------|
| National Business Capital | `https://www.nationalbusinesscapital.com/partner/?ref=10006500` |
| SmartBiz Bank | `https://app.smartbizbank.com/apply?referrer=robert&partner_id=agilityaccountantsadvisors` |

All affiliate links must open in a new tab (`target="_blank"` and `rel="noopener noreferrer"`).

## Page Structure — Build These Sections

### 1. Hero Section
- Background: use `hero-business-funding.jpg` with a dark overlay
- Headline: "Business Funding Solutions"
- Subheadline: "Fast & Flexible Financing — Tailored for Small Businesses"
- Brief paragraph: Agility Accountants partners with trusted lending institutions to help you access the capital you need to grow, manage cash flow, or seize new opportunities. Our partners offer SBA loans, term loans, lines of credit, and more.
- CTA button: "Explore Your Options" that smooth-scrolls to the partner cards section

### 2. Why Work With a Funding Partner Section
- Short intro explaining the value: As your accountants and advisors, we've vetted these funding partners so you don't have to. Each offers competitive rates, fast approvals, and a streamlined application process.
- 3 or 4 icon-style feature boxes (use simple CSS icons or Unicode symbols, no external icon libraries required):
  - "Fast Approval" — Get funding decisions in as little as 24 hours
  - "Competitive Rates" — SBA loans, term loans, and lines of credit at market-leading rates
  - "Expert Guidance" — We help you choose the right financing for your situation
  - "No Cost to You" — Our referral service is completely free for clients

### 3. Partner Cards Section (THE MAIN SECTION)
Create a visually balanced two-column card layout (stacks to single column on mobile):

**Card 1 — National Business Capital:**
- Logo: `national-business-capital-logo.png` (use `.svg` if you prefer)
- Brief description: "National Business Capital connects small businesses with over 75 lenders. From SBA loans to equipment financing, revenue-based financing to lines of credit — get matched with the best funding option for your business in minutes."
- Bullet highlights: 75+ lender marketplace, $2B+ funded, Dedicated Business Finance Advisor, Approvals in as fast as 24 hours
- CTA button: "Apply Now →" linking to the NBC affiliate URL
- Make the entire card clickable OR just the button — your choice, but the affiliate link must work

**Card 2 — SmartBiz Bank:**
- Logo: `smartbiz-logo.png` (use `.svg` if you prefer)
- Brief description: "SmartBiz Bank is your SBA lending partner, offering financial services designed specifically for small businesses. Access low-interest SBA 7(a) loans with long repayment terms to fund growth, refinance debt, or increase working capital."
- Bullet highlights: SBA 7(a) loan specialist, Low interest rates with long terms, Pre-qualify in 5 minutes — no credit impact, $230M+ delivered to small businesses
- CTA button: "Apply Now →" linking to the SmartBiz affiliate URL

Style the CTA buttons:
- NBC button: gold/dark-gold background (#C8A951 or similar) with white text (matches current site)
- SmartBiz button: navy/dark blue background (#1B2A4A) with white text
- Hover states with slight darkening

### 4. How It Works Section
Simple 3-step process:
1. Choose a Partner — Review our trusted lending partners above
2. Apply Online — Complete a quick application directly with the lender
3. Get Funded — Receive your funding and grow your business

### 5. FAQ Section (collapsible accordion)
- "How much funding can I qualify for?" — Funding amounts vary by lender and your business profile. National Business Capital works with 75+ lenders offering $10K to $10M+. SmartBiz specializes in SBA loans up to $5M.
- "Will applying affect my credit score?" — SmartBiz offers a soft credit pull for pre-qualification that won't impact your score. National Business Capital's initial review is also designed to be minimally invasive.
- "How fast can I get funded?" — National Business Capital can provide approvals in as fast as 24 hours. SmartBiz SBA loans typically take 30-60 days due to the SBA process, but the lower rates are worth it.
- "Is there a cost to use Agility's referral?" — No. Our funding referral service is completely free. We partner with these lenders because we trust them to serve our clients well.

### 6. Footer CTA
- "Ready to Grow Your Business?"
- "Talk to our team about which funding option is right for you."
- Button: "Contact Agility" linking to `https://www.agility-accountants.com/contact`
- Small disclaimer text: "Agility Accountants & Advisors is not a lender. We refer clients to trusted lending partners. All loan decisions are made by the respective lending institutions. Agility may receive compensation for referrals."

## Technical Requirements

- Single HTML file, fully self-contained (inline `<style>` and `<script>`)
- Google Fonts loaded via `<link>` in `<head>`
- Images referenced as relative paths (same folder as the HTML file)
- Smooth scroll behavior for anchor links
- Accordion FAQ uses vanilla JS (no jQuery or frameworks)
- All affiliate links: `target="_blank" rel="noopener noreferrer"`
- Add proper `<meta>` tags for SEO:
  - Title: "Business Funding Solutions | Agility Accountants & Advisors"
  - Description: "Access fast, flexible business funding through Agility's trusted lending partners. SBA loans, term loans, lines of credit and more. Apply today."
- Proper semantic HTML (`<header>`, `<main>`, `<section>`, `<footer>`)
- Accessible: proper alt text, ARIA labels, keyboard-navigable accordion

## Output

Save the completed HTML file as: `business-funding.html` in the same folder as the images (`C:\Users\oconn\Documents\Agility\website\images\business-funding.html`).
