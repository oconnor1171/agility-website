# Claude Code Prompt: Add Navigation Header to Business Funding Page

## Problem

`pages/business-funding.html` is a standalone page with its own inline styles and **no site navigation header**. When users land on this page, they have no way to navigate back to the rest of the site. Every other page on the site includes the shared nav bar — this one is missing it entirely.

## Repository Details

- **Repo:** `https://github.com/oconnor1171/agility-website.git`
- **Branch:** `main`
- **File to modify:** `pages/business-funding.html`

## Root Cause

This page was built as a self-contained landing page. It:
- Does NOT link to `../css/style.css` (uses only inline `<style>` in `<head>`)
- Does NOT link to `../js/main.js`
- Has NO `<nav>` or `.navbar` element
- Uses `<header class="hero">` for its hero banner (not for navigation)
- Has its own CSS variable namespace (`--navy`, `--gold`, etc.) that partially overlaps with the site's variables (`--primary`, `--accent`, etc.)

## What to Do

### Step 1: Add the site stylesheet link

In `<head>`, BEFORE the existing `<style>` tag, add:

```html
<link rel="stylesheet" href="../css/style.css">
```

This must come BEFORE the inline `<style>` block so the page's own styles override any conflicts from the global stylesheet.

### Step 2: Add the site JS

Just before `</body>`, add:

```html
<script src="../js/main.js"></script>
```

This enables the mobile hamburger menu and dropdown toggles.

### Step 3: Insert the navigation header

Immediately after `<body>`, BEFORE the existing `<header class="hero">` element, insert the standard site navigation block. Use the same nav HTML that appears in all other `/pages/*.html` files:

```html
<!-- Header Navigation -->
<header class="header">
  <nav class="navbar">
    <div class="container">
      <div class="logo">
        <a href="../index.html">Agility Accountants & Advisors</a>
      </div>
      <ul class="nav-menu">
        <li><a href="../index.html">Home</a></li>
        <li class="dropdown">
          <a href="services.html">Services</a>
          <ul class="dropdown-menu">
            <li><a href="plan.html">Tax Planning</a></li>
          </ul>
        </li>
        <li><a href="resource.html">Client Resources</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="contact.html">Contact</a></li>
        <li><a href="groups.html">Groups</a></li>
        <li><a href="business-funding.html">Business Funding</a></li>
        <li><a href="blog.html">Blog</a></li>
        <li class="dropdown">
          <a href="restaurant-bar.html">Restaurant & Bar</a>
          <ul class="dropdown-menu">
            <li><a href="guide.html">Restauranteur Handbook</a></li>
            <li><a href="struggle-is-real.html">Struggling?</a></li>
          </ul>
        </li>
        <li><a href="real-estate.html">Real Estate</a></li>
        <li><a href="book-online.html">Book Online</a></li>
        <li><a href="free-download.html">Free Download</a></li>
        <li><a href="ratio-download.html">Ratio Spreadsheet Download</a></li>
        <li><a href="shop.html">Shop</a></li>
      </ul>
    </div>
  </nav>
</header>
```

**NOTE:** If you have already executed the nav reorganization prompt (CLAUDE_CODE_PROMPT_nav_reorganization.md), use the reorganized nav structure instead — with Services and Client Resources dropdowns.

### Step 4: Change the hero element from `<header>` to `<section>`

The hero banner currently uses `<header class="hero">`. Since we now have a real `<header>` for navigation, rename the hero element to avoid two `<header>` tags:

**Change:**
```html
<header class="hero" role="banner" aria-label="Business funding hero">
```
**To:**
```html
<section class="hero" role="banner" aria-label="Business funding hero">
```

**And the closing tag — change:**
```html
</header>
```
**(the one right after the hero's closing `</div>`, around line 182)**

**To:**
```html
</section>
```

### Step 5: Fix potential CSS conflicts

The page's inline `<style>` redefines `.container` with `width: min(1150px, 100% - 2rem)`. The site's `style.css` also defines `.container`. Since the inline styles come AFTER the linked stylesheet, the page's `.container` definition will win — which is correct.

However, check that the page's inline `a` styles don't break the nav links. The page has:
```css
a { color: var(--navy); text-decoration: none; }
```

This should be scoped so it doesn't override nav link colors. Add this to the inline `<style>` block to ensure the nav renders correctly:

```css
/* Ensure site nav uses its own styling */
.header a, .navbar a, .nav-menu a { color: inherit; }
```

### Step 6: Verify

1. Open `pages/business-funding.html` in a browser.
2. Confirm the nav bar appears at the top with all menu items.
3. Confirm hover dropdowns work on Services and Restaurant & Bar (or the reorganized dropdowns if that prompt was already run).
4. Confirm the hero section still renders correctly below the nav.
5. Confirm scrolling works and the nav stays sticky at the top.
6. Confirm the rest of the page content (cards, accordion, CTA) is unaffected.

### Step 7: Check for root-level duplicate

There is also a `business-funding.html` at the repository root (not inside `/pages/`). Check if it has the same issue. If it does, apply the same fix but adjust paths accordingly (use `css/style.css` instead of `../css/style.css`, and `pages/services.html` instead of `services.html` for nav links — matching the `index.html` path pattern).

### Step 8: Commit and push

```bash
git add pages/business-funding.html
# Also add root business-funding.html if it was modified
git commit -m "Add site navigation header to business-funding page"
git push origin main
```

## Important Notes

- Do NOT delete or replace the page's inline `<style>` block — it contains all the custom styling for this page's unique layout (cards, accordion, hero, etc.)
- Do NOT rewrite the page from scratch — only add the nav, stylesheet link, JS link, and the minor fixes described above
- The page's own styles MUST remain after `style.css` in the cascade so they take precedence
