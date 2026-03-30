/* ============================================================
   Blog Rendering & Category Filtering
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.blog-grid');
  const categoryBtns = document.querySelectorAll('.category-btn');

  if (!grid || typeof BLOG_POSTS === 'undefined') return;

  function renderPosts(filter) {
    const posts = filter === 'All Posts'
      ? BLOG_POSTS
      : BLOG_POSTS.filter(p => p.category === filter);

    if (posts.length === 0) {
      grid.innerHTML = '<p style="padding: 1rem;">No posts match this category yet.</p>';
      return;
    }

    grid.innerHTML = posts.map(post => `
      <article class="blog-card" data-category="${post.category}">
        <img src="${post.image}" alt="${post.imageAlt}" style="width:100%;height:220px;object-fit:cover;border-radius:8px 8px 0 0;">
        <div class="blog-content">
          <span class="blog-category">${post.category}</span>
          <h3>${post.title}</h3>
          <p>${post.excerpt}</p>
          <a href="${post.url}" class="read-more"${post.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>Read More</a>
        </div>
      </article>
    `).join('');
  }

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPosts(btn.textContent.trim());
    });
  });

  renderPosts('All Posts');
});