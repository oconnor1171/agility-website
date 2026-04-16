/* ============================================================
   Lead Capture Form — Agility Accountants & Advisors
   Submits to Google Apps Script, which logs to Sheets + sends email
   
   Financial Analysis page: sends simple "we'll contact you" email (NO workbook)
   Ratio Download page: sends Ratio Workbook attachment
   All other pages: sends simple contact email (NO workbook)
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('lead-capture-form');
  const submitBtn = document.getElementById('submit-btn');
  const successDiv = document.getElementById('form-success');
  const errorDiv = document.getElementById('form-error');

  if (!form) return;

  // ============================================================
  // Google Apps Script Web App URL
  // ============================================================
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwKtwnBjH6N71jFsFRMbTrRzHC8LW6waau2Fam77l9Ne_F_fd1_qXECsZIqQgZsicJU6Q/exec';

  let isSubmitting = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;
    errorDiv.style.display = 'none';

    // Disable button and show loading state
    submitBtn.disabled = true;
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';

    // Only send workbook from the ratio-download page
    const sendWorkbook = window.location.pathname.includes('ratio-download');

    // Read ALL form fields — use optional chaining in case a field
    // doesn't exist on every page (e.g., no industry dropdown on contact page)
    const getValue = (name) => {
      const el = form.elements[name] || form.querySelector('[name="' + name + '"]');
      return el ? el.value.trim() : '';
    };

    const payload = {
      firstName: getValue('firstName'),
      lastName: getValue('lastName'),
      email: getValue('email'),
      phone: getValue('phone'),
      website: getValue('website'),
      company: getValue('company'),
      industry: getValue('industry'),
      notes: getValue('notes') || getValue('message'),
      submittedAt: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
      sendWorkbook: sendWorkbook
    };

    // Validate required fields
    if (!payload.firstName || !payload.email) {
      errorDiv.style.display = 'block';
      errorDiv.textContent = 'Please enter your name and email address.';
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
      isSubmitting = false;
      return;
    }

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload)
      });

      form.style.display = 'none';
      successDiv.style.display = 'block';
    } catch (err) {
      errorDiv.style.display = 'block';
      errorDiv.textContent = 'Something went wrong. Please call us at 410-456-2433.';
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    } finally {
      isSubmitting = false;
    }
  });
});