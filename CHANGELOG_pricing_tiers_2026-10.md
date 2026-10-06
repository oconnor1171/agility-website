# Pricing tiers, October 2026 (branch pricing-tiers)

Authority: Approval_Register G-17 (pricing build, terms, one-price policy) and G-18 (copy, Handbook exception,
Diagnostic rename, lead notification and direct scheduling), RO 2026-10-06. Not published until RO approves the preview.

## What changed
- New two-plan bookkeeping pricing: homepage section `#pricing` and new page `pages/pricing.html`, plus a Pricing link in the nav of every served page.
- All prices, band limits, savings and band rules live in ONE object, `AG_PRICING`, at the top of `js/pricing.js`. Nothing else holds a price: the HTML carries Band 1 annual prices only as a no-JavaScript fallback, and `tests/pricing-band.test.js` fails if those drift. The chat assistant (`api/index.js`) reads the same config.
- Check my price: accessible dialog, four questions, results for Band 1, Band 2, cash-bumped, not sure and custom; every result button passes plan, billing, band, txn, accounts, cash, books, notsure to the contact page.
- Contact page: optional "Help us size your engagement" fieldset (open and prefilled when arriving from the price check). On submit the notes field starts with the tag (for example `[Pricing: Band 2 | Advanced | Annual]`) and ends with the `--- SIZING ---` block; the same values go as named fields. After submit the Google appointment schedule opens in place.
- Apps Script (`google-apps-script/lead-capture.gs`, `appsscript.json`): every lead emails roconnor@agility-accountants.com; a 10-minute trigger matches bookings to leads by email, writes the lead details onto the calendar event and emails a "Booked" notice. Needs RO to paste, authorize and redeploy (same URL).

## Published prices (from Bookkeeping_Pricing_Model_v1.md, confirmed by RO 2026-10-06)
| Band | Limits | Basic annual | Basic monthly | Advanced annual | Advanced monthly |
|---|---|---|---|---|---|
| 1 | up to 150 transactions, 3 accounts | $325/mo ($3,900/yr) | $350 | $600/mo ($7,200/yr) | $650 |
| 2 | 151 to 300 transactions, 6 accounts | $525/mo ($6,300/yr) | $550 | $800/mo ($9,600/yr) | $850 |
| Custom | over 300 transactions or 7+ accounts | no price shown | | | |

Band rules: transaction band (Under 150 = 1, 150 to 300 = 2, More than 300 = custom, Not sure = 1 flagged); account band (1 to 3 = 1, 4 to 6 = 2, 7+ = custom); take the higher; weekly cash moves up one band; books status never changes the price.
Terms (RO): monthly cancels anytime; annual is paid upfront and is not refunded on cancellation; prior years are custom work.

## Conflicts removed
- Homepage: "your bookkeeper can't give it to you" removed; "Get your Operational Diagnostic" replaced by "See plans and pricing" and "Free Benchmark Snapshot"; Diagnostic card renamed "Operational Analysis & Benchmarking" (monthly, in the Advanced plan); bookkeeping card points to the plans; FAQ "How is Agility different from a bookkeeper?" rewritten (visible text and JSON-LD).
- financial-analysis.html: company name, three vendor names and insurance renewal dates removed from the sample; IRC 6041 and ASC 360 compliance statements restated without regulatory claims; "How much does it cost?" points to the plans.
- book-online.html, contact.html, services.html, benchmark.html, chat widget, chat assistant, llms.txt: "fee quoted after the call" and "Operational Diagnostic" wording replaced for bookkeeping.
- Kept by RO decision: Restauranteur Handbook $9.99 (the one exception to the one-price policy); "complimentary 30-minute call" language for other services (G-06).

## Structured data
Service `#bookkeeping` with eight Offers (UnitPriceSpecification, billingDuration P1Y for annual totals, P1M for monthly) added to the homepage @graph and to pricing.html. Homepage Service renamed. JSON-LD parses on every changed page. sitemap.xml: pricing.html added; lastmod updated only on pages whose content changed.

## Tests
- `node tests/pricing-band.test.js`: 48 of 48 (36 Q1 x Q2 x Q3 combinations, 3 books cases, 4 price rows, max savings, 4 HTML fallbacks).
- Browser checks (Playwright, local server): 49 of 49, including keyboard toggle, Esc and focus return, every result type, prefill, submit payload, scheduler, no horizontal scroll at 360/768/1024/1440, no-JS fallback, reduced motion, 44px tap targets.
- Contrast: amber #d97706 only for rules, borders and large type; small amber text #fbbf24 on navy (7.1:1) and #b45309 on white (5.0:1); amber buttons use ink text (4.6:1).

## Rollback
`git revert -m 1 <merge commit>` on main and push. Apps Script: redeploy the previous version from Manage deployments.

## Batch 14, 2026-10-06: claims matched to delivery (local commit, NOT published)
RO asked that the site offer nothing the firm cannot deliver. Review log:
`C:\dev\Master_Financial_Project\Website_Claims_Delivery_Change_Log_2026-10-06.md` (control v1.16, ERR-A011).
- financial-analysis.html hero: "I'm a CPA who owns construction companies" replaced, per RO, with
  "I'm a CPA and a business owner. I have built and run companies of my own, and I still do."
- financial-analysis.html FAQ: "coverage isn't limited to a fixed list" replaced; coverage is the listed industry sets.
- index.html and pricing.html: chart's second series relabelled Best-in-class (legend, rows, aria-label).
- Basic: "benchmark of your first month" is now "your last 12 months, built at onboarding" (card, compare table, FAQ).
- Pricing FAQ: credit card 3% surcharge and no ACH fee disclosed.
- Every plan feature now maps to a delivery document: Engagement_Cadence_Spec_v1.1.md Section 6.
Publish only with Batch 13, on RO approval, then purge the Cloudflare cache.
