# Claude Code Prompt: Fix Blog Links + Add New Post + Active Blog Architecture

## Objective

Three things:
1. Fix the "Smart Tax Planning Strategies" blog card to link to the correct Medium article.
2. Add the "Aww man, I gotta know what?" article as a new blog card.
3. Build the infrastructure to make this an active, maintainable blog (category filtering, easy post addition pattern, and a blog post JSON data approach).

Push all changes to GitHub when complete.

---

## Repository Details

- **Repo:** `https://github.com/oconnor1171/agility-website.git`
- **Branch:** `main`
- **Primary file:** `pages/blog.html`
- **Stylesheet:** `css/style.css`
- **JS:** `js/main.js`

---

## Part 1: Fix the Tax Strategies Blog Card Link

**File:** `pages/blog.html`

The first blog card ("Smart Tax Planning Strategies for 2024") currently has a dead link (`href="#"`).

**Find (around line 71):**
```html
<a href="#" class="read-more">Read More</a>
```
(the one inside the first `<article class="blog-card">` — the Tax Planning & Strategy card)

**Replace with:**
```html
<a href="https://medium.com/@oconnor1171/unlock-hidden-tax-strategies-a52ae42621ca" class="read-more" target="_blank" rel="noopener noreferrer">Read More</a>
```

Also update the card title to match the actual article. **Find:**
```html
<h3>Smart Tax Planning Strategies for 2024</h3>
```

**Replace with:**
```html
<h3>Unlock Hidden Tax Strategies: How High-Income Earners Can Legally Save</h3>
```

---

## Part 2: Fix the Restaurant Blog Card Link

The second blog card ("Restaurant Success: Managing Cash Flow and Costs") also has a dead link (`href="#"`).

**Find (around line 81):**
```html
<a href="#" class="read-more">Read More</a>
```
(the one inside the second `<article class="blog-card">` — the Restaurant Entrepreneur card)

**Replace with:**
```html
<a href="https://www.agility-accountants.com/post/aww-man-i-gotta-know-what" class="read-more" target="_blank" rel="noopener noreferrer">Read More</a>
```

Also update the card title and description. **Find:**
```html
<h3>Restaurant Success: Managing Cash Flow and Costs</h3>
<p>Expert insights on managing cash flow, controlling food costs, and improving profitability in your restaurant or bar business.</p>
```

**Replace with:**
```html
<h3>Aww Man, I Gotta Know What?</h3>
<p>Real talk about what it takes to run a restaurant — the things nobody tells you until you're already in it.</p>
```

---

## Part 3: Make the Blog Active and Maintainable

The current blog page is static HTML with hardcoded cards and non-functional category filter buttons. To make this a real, active blog, implement the following:

### 3A: Create a blog posts data file

Create a new file `js/blog-posts.js` that holds all blog post data as a JavaScript array. This makes adding new posts trivial — just add an object to the array.

```javascript
/* ============================================================
   Blog Posts Data — Agility Accountants & Advisors
   To add a new post: add an object to the top of the array.
   ============================================================ */
const BLOG_POSTS = [
  {
    title: "Unlock Hidden Tax Strategies: How High-Income Earners Can Legally Save",
    excerpt: "Learn how to maximize deductions, optimize your entity structure, and reduce your tax liability with proven tax planning strategies.",
    category: "Tax Planning & Strategy",
    image: "../images/blog-tax-strategies.jpg",
    imageAlt: "Tax planning article header",
    url: "https://medium.com/@oconnor1171/unlock-hidden-tax-strategies-a52ae42621ca",
    date: "2024-12-15",
    external: true
  },
  {
    title: "Aww Man, I Gotta Know What?",
    excerpt: "Real talk about what it takes to run a restaurant — the things nobody tells you until you're already in it.",
    category: "Restaurant Entrepreneur",
    image: "../images/blog-restaurant-owner.jpg",
    imageAlt: "Restaurant owner success story",
    url: "https://www.agility-accountants.com/post/aww-man-i-gotta-know-what",
    date: "2024-11-20",
    external: true
  }
];
```

### 3B: Create blog rendering and filtering logic

Create a new file `js/blog.js` that renders blog cards from the data and makes category filtering work:

```javascript
/* ============================================================
   Blog Rendering & Category Filtering
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.blog-grid');
  const categoryBtns = document.querySelectorAll('.category-btn');

  if (!grid || typeof BLOG_POSTS === 'undefined') return;

  /* ---------- Render cards ---------- */
  function renderPosts(filter) {
    const posts = filter === 'All Posts'
      ? BLOG_POSTS
      : BLOG_POSTS.filter(p => p.category === filter);

    grid.innerHTML = posts.map(post => `
      <article class="blog-card" data-category="${post.category}">
        <img src="${post.image}" alt="${post.imageAlt}" style="width:100%;height:220px;object-fit:cover;">
        <div class="blog-content" style="padding:20px;">
          <span class="blog-category">${post.category}</span>
          <h3>${post.title}</h3>
          <p>${post.excerpt}</p>
          <a href="${post.url}" class="read-more"${post.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>Read More</a>
        </div>
      </article>
    `).join('');
  }

  /* ---------- Category filter clicks ---------- */
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPosts(btn.textContent.trim());
    });
  });

  /* ---------- Initial render ---------- */
  renderPosts('All Posts');
});
```

### 3C: Update blog.html to use the new JS

In `pages/blog.html`, **remove** the hardcoded blog cards from the HTML. Replace the blog posts section with an empty grid container that JS will populate:

**Find the entire `<!-- Blog Posts -->` section (lines 62-86) and replace with:**

```html
<!-- Blog Posts -->
<section class="blog-posts">
  <div class="container">
    <div class="blog-grid">
      <!-- Posts are rendered dynamically from js/blog-posts.js -->
    </div>
  </div>
</section>
```

**Then, before the closing `</body>` tag, add the two new script files BEFORE `main.js`:**

```html
<script src="../js/blog-posts.js"></script>
<script src="../js/blog.js"></script>
```

### 3D: Add CSS for blog elements not yet styled

The blog page uses classes (`blog-content`, `blog-category`, `read-more`, `category-btn`, `category-filters`) that aren't in `style.css`. Add these to the end of the blog section in `css/style.css` (after line 448):

```css
/* Blog content & category styles */
.blog-content { padding: 20px; }
.blog-content h3 { margin: 8px 0; font-size: 1.15rem; }
.blog-content p { color: var(--text-muted); margin: 0 0 12px; font-size: .92rem; }
.blog-category {
  display: inline-block; background: var(--bg-light); color: var(--secondary);
  font-size: .75rem; font-weight: 600; padding: 4px 10px; border-radius: 999px;
  text-transform: uppercase; letter-spacing: .03em;
}
.read-more {
  display: inline-block; color: var(--secondary); font-weight: 600;
  font-size: .9rem; transition: color var(--transition);
}
.read-more:hover { color: var(--primary); }

.category-filters { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 24px; }
.category-btn {
  background: #fff; border: 1px solid var(--border); border-radius: 999px;
  padding: 8px 20px; font-size: .85rem; font-weight: 500; cursor: pointer;
  transition: background var(--transition), color var(--transition), border-color var(--transition);
}
.category-btn:hover, .category-btn.active {
  background: var(--secondary); color: #fff; border-color: var(--secondary);
}

.blog-categories { padding: 32px 0 0; }
.blog-categories h2 { margin: 0 0 16px; font-size: 1.3rem; }
```

---

## Part 4: Verification

1. Open `pages/blog.html` in a browser.
2. Verify both blog cards render with correct titles, excerpts, and images.
3. Click "Read More" on the tax strategies card → should open the Medium article in a new tab.
4. Click "Read More" on the "Aww man" card → should open the Agility website post in a new tab.
5. Click the "Tax Planning & Strategy" category button → should filter to show only the tax card.
6. Click "Restaurant Entrepreneur" → should show only the restaurant card.
7. Click "All Posts" → should show both.
8. Verify mobile layout works (cards stack to single column).

---

## Part 5: Commit and Push

```bash
git add pages/blog.html js/blog-posts.js js/blog.js css/style.css
git commit -m "Fix blog links, add Aww Man post, implement dynamic blog rendering with category filtering"
git push origin main
```

---

## How to Add Future Blog Posts

After this is implemented, adding a new blog post only requires editing one file — `js/blog-posts.js`. Add a new object to the top of the `BLOG_POSTS` array:

```javascript
{
  title: "Your New Post Title",
  excerpt: "A 1-2 sentence summary.",
  category: "Tax Planning & Strategy",  // must match a category button exactly
  image: "../images/your-image.jpg",
  imageAlt: "Description of image",
  url: "https://medium.com/@oconnor1171/your-post-slug",
  date: "2026-03-30",
  external: true
}
```

To add a new **category**, add a new `<button class="category-btn">` to the `category-filters` div in `blog.html`. The filtering logic picks up new categories automatically.

---

## Important Notes

- Do NOT remove the existing blog images from `/images/` — they're still referenced.
- External links MUST include `target="_blank" rel="noopener noreferrer"`.
- The `blog-posts.js` file must load BEFORE `blog.js` in the HTML since `blog.js` depends on the `BLOG_POSTS` variable.
- Category button text must match `category` values in the data exactly (case-sensitive).
