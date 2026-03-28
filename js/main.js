/* ============================================================
   Agility Accounting & Advisors — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Mobile Nav Toggle ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const nav    = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
    });
    // Close nav on link click (mobile)
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => nav.classList.remove('open'));
    });
  }

  /* ---------- Mobile dropdown toggles ---------- */
  document.querySelectorAll('.has-dropdown > a').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        trigger.parentElement.classList.toggle('open');
      }
    });
  });

  /* ---------- Active nav link ---------- */
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.main-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      const linkPath = new URL(href, window.location.origin).pathname.replace(/\/$/, '') || '/';
      if (linkPath === currentPath) link.classList.add('active');
    }
  });

  /* ---------- Chat Widget ---------- */
  const chatBtn   = document.querySelector('.chat-widget-btn');
  const chatPanel = document.querySelector('.chat-panel');
  const chatClose = document.querySelector('.chat-close');

  if (chatBtn && chatPanel) {
    chatBtn.addEventListener('click', () => {
      chatPanel.classList.toggle('open');
      chatBtn.innerHTML = chatPanel.classList.contains('open') ? '&times;' : '&#128172;';
    });
  }
  if (chatClose && chatPanel) {
    chatClose.addEventListener('click', () => {
      chatPanel.classList.remove('open');
      if (chatBtn) chatBtn.innerHTML = '&#128172;';
    });
  }

  /* ---------- Contact Form Submission ---------- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());
      // Show success message
      const msg = document.createElement('div');
      msg.style.cssText = 'padding:16px;background:#d4edda;color:#155724;border-radius:8px;margin-top:16px;font-weight:600;';
      msg.textContent = 'Thanks for reaching out! We\'ll get back to you soon.';
      contactForm.parentNode.insertBefore(msg, contactForm.nextSibling);
      contactForm.reset();
      setTimeout(() => msg.remove(), 5000);
    });
  }

  /* ---------- Smooth scroll for anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
