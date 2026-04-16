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

  let isSubmitting = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;
    errorDiv.style.display = 'none';

    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    const payload = {
      formType: 'workbook',
      source: window.location.pathname || 'free-download',
      sendWorkbook: true,
      submittedAt: new Date().toISOString(),
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim()
    };

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      form.style.display = 'none';
      successDiv.style.display = 'block';
    } catch (err) {
      errorDiv.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Me the Workbook';
    } finally {
      isSubmitting = false;
    }
  });
});