# Claude Code Prompt: Add Financial Calculator & Tax Calendar Links

## Objective

Two changes:
1. Fix the dead links (`href="#"`) on the Client Resources page so the Financial Calculator and Tax Calendar cards link to external resources.
2. Add "Financial Calculators" and "Tax Calendar" as new sub-items under the **Client Resources** dropdown in the site-wide navigation across all 17 HTML files. Push changes to GitHub when complete.

---

## Repository Details

- **Repo:** `https://github.com/oconnor1171/agility-website.git`
- **Branch:** `main`

---

## Part 1: Fix Dead Links on Client Resources Page

**File:** `pages/resource.html`

### Change 1 — Financial Calculator link (line 64)

**Find:**
```html
<a href="#" class="resource-button">Access</a>
```
(the one inside the Financial Calculator `<article>`)

**Replace with:**
```html
<a href="https://www.calculator.net/financial-calculator.html" class="resource-button" target="_blank" rel="noopener noreferrer">Access</a>
```

### Change 2 — Tax Calendar link (line 71)

**Find:**
```html
<a href="#" class="resource-button">Review</a>
```
(the one inside the Tax Calendar `<article>`)

**Replace with:**
```html
<a href="https://www.irs.gov/publications/p509" class="resource-button" target="_blank" rel="noopener noreferrer">Review</a>
```

---

## Part 2: Add Items to Client Resources Navigation Dropdown

Add two new `<li>` entries to the Client Resources `.dropdown-menu` in **all 17 HTML files**. Both are external links and should open in a new tab.

### Updated Client Resources dropdown for files in `/pages/` (relative paths):

```html
<li class="dropdown">
  <a href="resource.html">Client Resources</a>
  <ul class="dropdown-menu">
    <li><a href="free-download.html">Free Download</a></li>
    <li><a href="ratio-download.html">Ratio Spreadsheet Download</a></li>
    <li><a href="shop.html">Shop</a></li>
    <li><a href="https://www.calculator.net/financial-calculator.html" target="_blank" rel="noopener noreferrer">Financial Calculators</a></li>
    <li><a href="https://www.irs.gov/publications/p509" target="_blank" rel="noopener noreferrer">Tax Calendar (IRS Pub 509)</a></li>
  </ul>
</li>
```

### Updated Client Resources dropdown for `index.html` (root — uses `pages/` prefix for internal links):

```html
<li class="dropdown">
  <a href="pages/resource.html">Client Resources</a>
  <ul class="dropdown-menu">
    <li><a href="pages/free-download.html">Free Download</a></li>
    <li><a href="pages/ratio-download.html">Ratio Spreadsheet Download</a></li>
    <li><a href="pages/shop.html">Shop</a></li>
    <li><a href="https://www.calculator.net/financial-calculator.html" target="_blank" rel="noopener noreferrer">Financial Calculators</a></li>
    <li><a href="https://www.irs.gov/publications/p509" target="_blank" rel="noopener noreferrer">Tax Calendar (IRS Pub 509)</a></li>
  </ul>
</li>
```

**Note:** The external links (calculator.net and irs.gov) are identical in both variants since they are absolute URLs.

---

## Files to Update

### Navigation dropdown (all 17 files):

**Root:**
- `index.html`

**Pages directory:**
- `pages/about.html`
- `pages/blog.html`
- `pages/book-online.html`
- `pages/business-funding.html`
- `pages/contact.html`
- `pages/free-download.html`
- `pages/groups.html`
- `pages/guide.html`
- `pages/plan.html`
- `pages/ratio-download.html`
- `pages/real-estate.html`
- `pages/resource.html`
- `pages/restaurant-bar.html`
- `pages/services.html`
- `pages/shop.html`
- `pages/struggle-is-real.html`

### Dead link fixes (1 file):
- `pages/resource.html` (lines 64 and 71)

---

## Verification

1. Open `pages/resource.html` — click "Access" on Financial Calculator card → should open calculator.net in a new tab.
2. Click "Review" on Tax Calendar card → should open IRS Pub 509 in a new tab.
3. Hover over "Client Resources" in the nav → dropdown should now show 5 items: Free Download, Ratio Spreadsheet Download, Shop, Financial Calculators, Tax Calendar (IRS Pub 509).
4. Verify the same dropdown appears correctly on `index.html` and at least 2 other pages.
5. Confirm external links open in new tabs (not navigate away from the site).

---

## Commit and Push

```bash
git add index.html pages/*.html
git commit -m "Add Financial Calculators and Tax Calendar links to Client Resources nav and fix dead links on resource page"
git push origin main
```

---

## Important Notes

- Do NOT modify `css/style.css` or `js/main.js` — no styling or JS changes needed.
- External links MUST include `target="_blank" rel="noopener noreferrer"` so they open in a new tab without security risks.
- Do NOT remove or reorder the existing 3 dropdown items (Free Download, Ratio Spreadsheet Download, Shop) — only append the 2 new items after them.
- `pages/business-funding.html` may or may not already have the nav (depends on whether the prior nav fix prompt was executed). If it has no nav, skip it for now — the business-funding nav prompt handles that separately.
