# Claude Code Prompt: Navigation Reorganization — Agility Accountants & Advisors

## Objective

Reorganize the main navigation bar across the entire static HTML website so that related pages are grouped under hover-activated dropdown submenus instead of cluttering the top-level nav. Push the final changes to GitHub when complete.

---

## Repository Details

- **Repo:** `https://github.com/oconnor1171/agility-website.git`
- **Branch:** `main`
- **Framework:** Static HTML — no CMS, no build step, no templating engine
- **CSS:** `css/style.css` (single stylesheet, dropdown styles already exist at lines ~297-305)
- **JS:** `js/main.js` (mobile dropdown toggle logic already exists at lines ~20-28)

---

## Current Navigation Structure (17 files)

The `<ul class="nav-menu">` block is **hardcoded identically** in every HTML file. There are two path variants:

- **`index.html`** (root): links use `pages/filename.html` paths
- **All 16 files in `/pages/`**: links use `filename.html` (relative, same directory)

### Current top-level items:
```
Home | Services ▾ | Client Resources | About | Contact | Groups | Business Funding | Blog | Restaurant & Bar ▾ | Real Estate | Book Online | Free Download | Ratio Spreadsheet Download | Shop
```

Services currently has one sub-item: Tax Planning.
Restaurant & Bar currently has two sub-items: Restauranteur Handbook, Struggling?.

---

## Target Navigation Structure

```
Home | Services ▾ | Client Resources ▾ | About | Contact | Groups | Business Funding | Blog | Book Online
```

### Services dropdown (on hover):
1. Tax Planning → `plan.html`
2. Real Estate → `real-estate.html`
3. Restaurant & Bar → `restaurant-bar.html`

### Client Resources dropdown (on hover):
1. Free Download → `free-download.html`
2. Ratio Spreadsheet Download → `ratio-download.html`
3. Shop → `shop.html`

### Items REMOVED from top-level nav:
- Real Estate (moved under Services)
- Restaurant & Bar (demoted from top-level dropdown to a sub-item under Services; its own sub-items — Restauranteur Handbook and Struggling? — are no longer in the main nav but remain accessible from the Restaurant & Bar page itself)
- Free Download (moved under Client Resources)
- Ratio Spreadsheet Download (moved under Client Resources)
- Shop (moved under Client Resources)

---

## Files That Must Be Updated (all 17)

### Root file:
- `index.html` — uses `pages/` prefix in hrefs

### Pages directory (use relative paths, no prefix):
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

---

## Exact HTML to Produce

### For `index.html` (root — note `pages/` prefix):

```html
<ul class="nav-menu">
  <li><a href="/">Home</a></li>
  <li class="dropdown">
    <a href="pages/services.html">Services</a>
    <ul class="dropdown-menu">
      <li><a href="pages/plan.html">Tax Planning</a></li>
      <li><a href="pages/real-estate.html">Real Estate</a></li>
      <li><a href="pages/restaurant-bar.html">Restaurant &amp; Bar</a></li>
    </ul>
  </li>
  <li class="dropdown">
    <a href="pages/resource.html">Client Resources</a>
    <ul class="dropdown-menu">
      <li><a href="pages/free-download.html">Free Download</a></li>
      <li><a href="pages/ratio-download.html">Ratio Spreadsheet Download</a></li>
      <li><a href="pages/shop.html">Shop</a></li>
    </ul>
  </li>
  <li><a href="pages/about.html">About</a></li>
  <li><a href="pages/contact.html">Contact</a></li>
  <li><a href="pages/groups.html">Groups</a></li>
  <li><a href="pages/business-funding.html">Business Funding</a></li>
  <li><a href="pages/blog.html">Blog</a></li>
  <li><a href="pages/book-online.html">Book Online</a></li>
</ul>
```

### For all files in `/pages/` (relative paths):

```html
<ul class="nav-menu">
  <li><a href="../index.html">Home</a></li>
  <li class="dropdown">
    <a href="services.html">Services</a>
    <ul class="dropdown-menu">
      <li><a href="plan.html">Tax Planning</a></li>
      <li><a href="real-estate.html">Real Estate</a></li>
      <li><a href="restaurant-bar.html">Restaurant &amp; Bar</a></li>
    </ul>
  </li>
  <li class="dropdown">
    <a href="resource.html">Client Resources</a>
    <ul class="dropdown-menu">
      <li><a href="free-download.html">Free Download</a></li>
      <li><a href="ratio-download.html">Ratio Spreadsheet Download</a></li>
      <li><a href="shop.html">Shop</a></li>
    </ul>
  </li>
  <li><a href="about.html">About</a></li>
  <li><a href="contact.html">Contact</a></li>
  <li><a href="groups.html">Groups</a></li>
  <li><a href="business-funding.html">Business Funding</a></li>
  <li><a href="blog.html">Blog</a></li>
  <li><a href="book-online.html">Book Online</a></li>
</ul>
```

---

## CSS — No Changes Required

The existing dropdown styles in `css/style.css` already handle hover behavior:

```css
.dropdown:hover .dropdown-menu { display: block; }
```

The `.dropdown` class and `.dropdown-menu` class are already styled. Since we are reusing these exact classes, no CSS modifications are needed.

---

## JavaScript — No Changes Required

`js/main.js` already handles mobile dropdown toggles generically for any `.has-dropdown > a` or `.dropdown` element. No JS changes needed.

---

## Execution Steps

1. **Replace the `<ul class="nav-menu">...</ul>` block** in `index.html` with the root version above.
2. **Replace the `<ul class="nav-menu">...</ul>` block** in each of the 16 files inside `pages/` with the pages version above.
3. **Verify** all 17 files have been updated by grepping for any leftover `Ratio Spreadsheet Download` as a top-level `<li>` (it should only appear inside a `dropdown-menu` now).
4. **Verify** no file still contains a top-level `<li class="dropdown">` for "Restaurant & Bar" (it should only appear as a sub-item under Services now).
5. **Test locally** — open `index.html` in a browser, hover over Services (should show Tax Planning, Real Estate, Restaurant & Bar), hover over Client Resources (should show Free Download, Ratio Spreadsheet Download, Shop).
6. **Commit and push:**
   ```bash
   git add -A
   git commit -m "Reorganize nav: nest Real Estate and Restaurant & Bar under Services; nest Free Download, Ratio Spreadsheet, and Shop under Client Resources"
   git push origin main
   ```

---

## Important Notes

- Do NOT delete any HTML page files. All pages still exist — they're just accessed through dropdowns now.
- Do NOT modify the page content or footer — only the `<ul class="nav-menu">` block in each file.
- Do NOT modify `css/style.css` or `js/main.js` — the existing dropdown infrastructure handles the new structure.
- The `Restaurant & Bar` text in nav links should use `&amp;` in the HTML source (standard HTML entity encoding for ampersands).
