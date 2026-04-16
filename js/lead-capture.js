/* ============================================================
   Lead Capture Form — Agility Accountants & Advisors
   
   FORM SELECTOR: .fa-contact-form (class, not ID)
   FIELD NAMES:   firstName, lastName, email, company, website,
                  phone, industry, message
   BUTTON:        .fa-submit-btn
   
   Financial Analysis page → simple "we'll contact you" email
   Ratio Download page    → sends Ratio Workbook attachment
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.fa-contact-form');
  if (!form) return;

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwKtwnBjH6N71jFsFRMbTrRzHC8LW6waau2Fam77l9Ne_F_fd1_qXECsZIqQgZsicJU6Q/exec';

  let isSubmitting = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    const btn = form.querySelector('.fa-submit-btn');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending...';

    const sendWorkbook = window.location.pathname.includes('ratio-download');

    const payload = {
      firstName:    form.querySelector('[name="firstName"]').value.trim(),
      lastName:     form.querySelector('[name="lastName"]').value.trim(),
      email:        form.querySelector('[name="email"]').value.trim(),
      company:      (form.querySelector('[name="company"]') || {}).value || '',
      website:      (form.querySelector('[name="website"]') || {}).value || '',
      phone:        (form.querySelector('[name="phone"]') || {}).value || '',
      industry:     (form.querySelector('[name="industry"]') || {}).value || '',
      notes:        (form.querySelector('[name="message"]') || {}).value || '',
      sendWorkbook: sendWorkbook,
      submittedAt:  new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
    };

    if (!payload.firstName || !payload.email) {
      btn.disabled = false;
      btn.textContent = originalText;
      isSubmitting = false;
      alert('Please enter your name and email address.');
      return;
    }

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload)
      });

      form.innerHTML = '<div style="text-align:center;padding:40px 20px;">'
        + '<div style="font-size:48px;margin-bottom:16px;color:#2E6B3E;">✓</div>'
        + '<h3 style="color:#1F2D3B;font-size:20px;font-weight:700;margin:0 0 10px;">Thank you, ' + payload.firstName + '!</h3>'
        + '<p style="color:#5A6B78;font-size:15px;line-height:1.6;">'
        + 'Someone from our office will contact you within 1–2 business days.<br>'
        + 'Need to reach us sooner? Call <a href="tel:410-456-2433" style="color:#2E6B3E;font-weight:700;">410-456-2433</a>'
        + '</p></div>';

    } catch (err) {
      btn.disabled = false;
      btn.textContent = originalText;
      alert('Something went wrong. Please call us at 410-456-2433.');
    } finally {
      isSubmitting = false;
    }
  });
});