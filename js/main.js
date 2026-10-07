/* ============================================================
   Agility Accounting & Advisors: Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Mobile Nav Toggle ----------
   * The HTML uses .navbar > .container > .nav-menu.
   * CSS already has .hamburger (display:none on desktop, block on mobile)
   * and .nav-menu.active (display:flex).  We inject the button here so
   * every page gets it without touching individual HTML files.
   * ------------------------------------------------------------------ */
  const navContainer = document.querySelector('.navbar .container');
  const navMenu      = document.querySelector('.nav-menu');

  if (navContainer && navMenu) {
    // Inject hamburger button
    const hamburger = document.createElement('button');
    hamburger.className   = 'hamburger';
    hamburger.setAttribute('aria-label', 'Toggle navigation');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.innerHTML   = '&#9776;'; // ☰
    navContainer.appendChild(hamburger);

    hamburger.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isOpen);
      hamburger.innerHTML = isOpen ? '&times;' : '&#9776;';
    });

    // Close nav when a link is tapped on mobile
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.innerHTML = '&#9776;';
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Mobile dropdown toggles ----------
   * On touch devices :hover doesn't fire, so we toggle .open via JS.
   * CSS (updated) uses .dropdown.open .dropdown-menu to show the list.
   * ------------------------------------------------------------------ */
  document.querySelectorAll('.nav-menu .dropdown > a').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        const li = trigger.parentElement;
        const wasOpen = li.classList.contains('open');
        // Close all other open dropdowns first
        document.querySelectorAll('.nav-menu .dropdown.open').forEach(el => el.classList.remove('open'));
        if (!wasOpen) li.classList.add('open');
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
    /* Same appointment schedule as pages/book-online.html (owner roconnor@agility-accountants.com) */
    const BOOKING_URL = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ199PbjLzlfJ-QzRtvf_zLr9v8ZagghbwxnMrVagxuNvNIWUeaIQvioCBUE93f4pJNsdMJqzg0P?gv=true';
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

      /* Sizing block from the pricing flow (js/pricing.js). Added to the notes so it reaches RO
         even if the script ignores named fields; also sent as named fields. */
      const sizing = window.agilitySizing ? window.agilitySizing() : null;
      const notesOut = sizing ? sizing.tag + '\n' + (notes ? notes + '\n\n' : '') + sizing.block : notes;

      const payload = {
        firstName,
        lastName,
        email,
        website,
        phone,
        company,
        industry,
        notes: notesOut,
        sizingTag: sizing ? sizing.tag : '',
        band: sizing ? sizing.band : '',
        plan: sizing ? sizing.plan : '',
        billing: sizing ? sizing.billing : '',
        formType: sizing ? 'pricing' : 'contact',
        submittedAt: new Date().toISOString(),
        sendWorkbook: false
      };

      try {
        await fetch(SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify(Object.assign(payload, window.agilityAttribution ? window.agilityAttribution() : {}))
        });

        const msg = document.createElement('div');
        msg.style.cssText = 'padding:16px;background:#d4edda;color:#155724;border-radius:8px;margin-top:16px;font-weight:600;';
        msg.setAttribute('role', 'status');
        msg.textContent = 'Thanks, we have your details. Pick a time below for your complimentary 30-minute call.';
        contactForm.parentNode.insertBefore(msg, contactForm.nextSibling);
        /* Direct scheduling (G-18): RO's Google appointment schedule opens in place. The Apps Script
           matches the booking to this lead by email and writes the sizing details onto the event. */
        const sched = document.createElement('div');
        sched.className = 'ag-schedule';
        sched.id = 'schedule';
        sched.innerHTML = '<div class="ag-schedule-head"><h3>Pick a time for your call</h3><p>Please book with the same email you entered above (' + email.replace(/[<>&"]/g, '') + ') so your details come with you.</p></div>'
          + '<iframe title="Book a call with Agility Accountants &amp; Advisors" src="' + BOOKING_URL + '" loading="lazy"></iframe>';
        msg.parentNode.insertBefore(sched, msg.nextSibling);
        contactForm.hidden = true;
        sched.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (err) {
        const msg = document.createElement('div');
        msg.style.cssText = 'padding:16px;background:#f8d7da;color:#721c24;border-radius:8px;margin-top:16px;font-weight:600;';
        msg.textContent = 'There was an error. Please try again or email us at roconnor@agility-accountants.com';
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
