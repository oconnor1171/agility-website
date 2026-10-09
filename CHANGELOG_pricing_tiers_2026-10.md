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
- Review round: Band 1 labelled "150 or fewer" in the price checker and contact form; surcharge line replaced by ACH-only payment; Basic benchmark FAQ limited to cost lines.

## Batch 17, 2026-10-08: Insight, and a note for businesses that already use accounting software
Approval: RO 2026-10-08 21:38 ("go ahead and lock this all in I approve"), Approval Register grant G-22. Published on passing checks (pre-approved).
Sources: Bookkeeping_Pricing_Model_v1.md v1.7 Section 9; Insight_Delivery_Standard_v1.md v1.1; Insight_Platform_Access_Guide_v1.md (Tiers 1 and 2 named only); Engagement_Cadence_Spec_v1.1.md (content v1.4) Section 6 rows marked "Batch 17"; Insight_Services_Addendum v1.0 Sections 2 and 7.
Files changed:
- js/pricing.js: AG_PRICING.insight { monthly 495, quarterly 1250 } (only copies), insightPlatforms, offerTags; insightText() builder; Monthly/Quarterly switch for the Insight card (kept separate from the plan billing toggle); contact page ?offer= handling (insight-monthly, insight-quarterly, insight-other; insight-other sets the notes placeholder "Which accounting software do you use?").
- js/main.js: offer tag added to the notes and sent as sizingTag (email subject and Sheet column), formType pricing.
- css/pricing.css: software-user callout (light panel, navy text, amber left rule), Insight section, homepage pointer; 44px targets.
- pages/pricing.html: callout under p.ag-pricing-sub (links #insight); Insight section id="insight" after Compare plans, before the FAQ; FAQ: QuickBooks answer appended, two new questions; JSON-LD Service #insight with Offers 495 P1M and 1250 P3M.
- index.html: callout (links /pages/pricing.html#insight); one-line pointer under the tiles; same FAQ changes.
- pages/financial-analysis.html: "How much does it cost?" adds the Insight sentence from config (pricing.js now loaded on that page).
- api/index.js: chat assistant states Insight prices and platforms from config, "ask us" for others, never quotes an add-on; also corrects the stale Basic description ("benchmark of the first month" is now the last 12 months at onboarding, per Pricing Model v1.1).
- js/chat-widget.js: Insight answer for software and bookkeeper questions and in the price answer, from config with a tested fallback.
- llms.txt: one Insight line. sitemap.xml: lastmod 2026-10-08 on /, pricing.html, financial-analysis.html only.
- tests/pricing-band.test.js: Insight fallbacks, JSON-LD offers, chat fallback, llms.txt, offer tags, and a ban on Wave, Zoho, Sage, QuickBooks Desktop, $75 and "$150 a quarter" across served files (63 of 63).
Not published (by RO decision): the $75 a month / $150 a quarter export add-on and the Tier 3 platform names.
Rollback: git revert -m 1 <merge commit> on main and push.

## Batch 18, 2026-10-08: Profit Leak Assessment and Advisory Partner (local commit, NOT published)
Source: MFP prompt Website_Batch15_Assessment_and_Advisory_Partner_2026-10-07.md (renumbered Batch 18; site batches 15 and 16 were the review call policy). RO instruction 2026-10-07; RO 2026-10-08 21:46: "review batch 15 to see if this has been addressed, if not address as well". Built on main 8da02a6 (the prompt's base branch pricing-tiers was merged 2026-10-07). Publishing waits on RO's preview approval and a new grant.
Sources: Bookkeeping_Pricing_Model_v1.md v1.7 Sections 8.1 and 8.2; Engagement_Cadence_Spec_v1.1.md (content v1.4) Section 6 rows for the assessment and Advisory Partner (the Advisory Partner row carries a GAP: no standing delivery document for cash-flow planning and growth modeling).
Files changed:
- js/pricing.js: AG_PRICING.offers { assessment: { price 999, turnaroundDays 10, maxMonths 12 }, advisoryPartner: { startingMonthly 2500 } } (only copies); offerTags assessment and advisory; offerText() builder.
- css/pricing.css: two secondary cards (light panel, ghost buttons) so they do not compete with the plan tiles.
- pages/pricing.html and index.html: cards #assessment and #advisory-partner after Check my price; FAQ "What's the difference between the assessment and a plan?"; "Need more than Advanced?" now links to Advisory Partner; JSON-LD Services with Offer 999 USD and UnitPriceSpecification minPrice 2500 P1M (no price, no maxPrice).
- index.html Fractional CFO card and pages/services.html#fractional-cfo: price line "Advisory Partner, starting at $2,500 a month" linking to the card; descriptions kept.
- pages/benchmark.html: result text now points to the Profit Leak Assessment (the Operational Diagnostic wording was already gone).
- pages/financial-analysis.html: "How much does it cost?" states both plan starting prices, the $999 assessment and Advisory Partner from $2,500, from config.
- api/index.js and js/chat-widget.js: both offers from config; starting price only; no credit toward a plan.
- llms.txt: one line each. sitemap.xml: lastmod on the five changed pages (set to the publish date at merge).
- tests/pricing-band.test.js: offer fallbacks, JSON-LD, chat fallback, services and llms lines; retired tiers and prices banned in served files; no Advisory Partner range, per-hour or credit language (85 of 85).
Not published: any credit of the $999 toward a plan (undecided).
Revision 2026-10-08 22:39 (RO 22:34): FAQ line now "You can start with the assessment to see the size of the opportunity."; Advisory Partner card and chat state the 12-month minimum term (AG_PRICING.offers.advisoryPartner.minTermMonths); llms.txt likewise; the claim map row (Cadence Spec content v1.5) carries the term and the GAP is closed by Advisory_Partner_Delivery_Standard_v1.md; name "Profit Leak Assessment" confirmed; the $1,800 ban stays as is. Tests 90 of 90.
