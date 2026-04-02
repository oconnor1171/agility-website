/* ============================================================
   Lead Capture Form — Agility Accountants & Advisors
   Submits to Google Apps Script, which logs to Sheets + emails workbook
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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.style.display = 'none';

    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    const payload = {
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim()
    };

    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      // With no-cors mode, we can't read the response body,
      // but if fetch didn't throw, the request was sent successfully.
      // Google Apps Script will process it server-side.
      form.style.display = 'none';
      successDiv.style.display = 'block';

    } catch (err) {
      errorDiv.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Me the Workbook';
    }
  });
});