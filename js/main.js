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

  /* ---------- Contact Form Submission to Google Apps Script ---------- */
  const contactForm = document.getElementById('contact-form');
  function normalizeWebsite(url) {
    if (!url) return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    return 'https://' + trimmed;
  }

  if (contactForm) {
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwKtwnBjH6N71jFsFRMbTrRzHC8LW6waau2Fam77l9Ne_F_fd1_qXECsZIqQgZsicJU6Q/exec';
    let isSubmitting = false;
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitBtn ? submitBtn.textContent : 'Send';

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSubmitting) return;
      isSubmitting = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      const firstName = contactForm.querySelector('input[name="firstName"]').value.trim();
      const lastName = contactForm.querySelector('input[name="lastName"]').value.trim();
      const email = contactForm.querySelector('input[name="email"]').value.trim();
      const company = contactForm.querySelector('input[name="company"]').value.trim();
      const website = normalizeWebsite(contactForm.querySelector('input[name="website"]').value);
      const phone = contactForm.querySelector('input[name="phone"]').value.trim();
      const industry = contactForm.querySelector('select[name="industry"]').value.trim();
      const notes = contactForm.querySelector('textarea[name="notes"]')?.value.trim() || contactForm.querySelector('textarea[name="message"]')?.value.trim() || '';

      if (!firstName || !lastName || !email) {
        alert('Please fill in all required fields (First Name, Last Name, Email).');
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalButtonText;
        }
        return;
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        alert('Please enter a valid email address.');
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalButtonText;
        }
        return;
      }

      const payload = {
        firstName,
        lastName,
        email,
        website,
        phone,
        company,
        industry,
        notes,
        submittedAt: new Date().toISOString(),
        sendWorkbook: false
      };

      try {
        await fetch(SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify(payload)
        });

        const msg = document.createElement('div');
        msg.style.cssText = 'padding:16px;background:#d4edda;color:#155724;border-radius:8px;margin-top:16px;font-weight:600;';
        msg.textContent = 'Thanks for reaching out! Someone from our office will contact you within 1-2 business days.';
        contactForm.parentNode.insertBefore(msg, contactForm.nextSibling);
        contactForm.reset();
      } catch (err) {
        const msg = document.createElement('div');
        msg.style.cssText = 'padding:16px;background:#f8d7da;color:#721c24;border-radius:8px;margin-top:16px;font-weight:600;';
        msg.textContent = 'There was an error. Please try again or email us at oconnor1171@gmail.com';
        contactForm.parentNode.insertBefore(msg, contactForm.nextSibling);
      } finally {
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalButtonText;
        }
      }
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
