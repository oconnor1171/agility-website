# Claude Code Prompt: Lead Capture System — Free Resource Download with Email Delivery

## Objective

Consolidate the "Free Download" and "Ratio Spreadsheet Download" into a single lead capture page. When visitors submit their name, phone, and email, the Ratio Workbook is emailed to them automatically, and their contact info is logged to a Google Sheet for marketing. Update the Client Resources nav dropdown and resource page accordingly.

Push all website changes to GitHub when complete.

---

## Repository Details

- **Repo:** `https://github.com/oconnor1171/agility-website.git`
- **Branch:** `main`
- **Google Drive Agility folder:** `https://drive.google.com/drive/folders/1j1HW2g0r7HxOPUiXnCWrgwNqzHijs25g`

---

## Architecture Overview

```
[Visitor fills form on website]
        |
        v
[Form submits via fetch() to Google Apps Script Web App URL]
        |
        v
[Google Apps Script doPost() runs:]
  1. Appends row to "Leads" Google Sheet (name, phone, email, timestamp)
  2. Gets Ratio_Workbook.xlsx from Google Drive by file ID
  3. Sends email to visitor with workbook attached
  4. Returns JSON success response
        |
        v
[Website shows success message: "Check your email!"]
```

This is entirely free — no third-party services, no backend server. Google Apps Script handles everything.

---

## PREREQUISITE STEPS — Owner Must Do Manually Before Claude Code Runs

These steps happen in Google Drive/Apps Script and cannot be automated by Claude Code.

### Step 1: Upload Ratio_Workbook.xlsx to Google Drive — ✅ DONE

File is uploaded to the Agility Google Drive folder.
- **File ID:** `1NEVMMrH4dMuJCocSrMwJvr-dYZMrAJIx`
- **URL:** `https://docs.google.com/spreadsheets/d/1NEVMMrH4dMuJCocSrMwJvr-dYZMrAJIx/edit`
- This ID is already hardcoded in the Apps Script code below — no action needed for this step.

### Step 2: Create the Google Sheet for Leads — ✅ DONE

Sheet is created in Google Drive.
- **Spreadsheet ID:** `15Ae-TMEls8om6zTW-NuZ4bFTM3s7WBZtU-1oamBF9Pw`
- **URL:** `https://docs.google.com/spreadsheets/d/15Ae-TMEls8om6zTW-NuZ4bFTM3s7WBZtU-1oamBF9Pw/edit`
- This ID is already hardcoded in the Apps Script code below — no action needed for this step.
- **Ensure row 1 has these headers:** A1: `First Name` | B1: `Last Name` | C1: `Email` | D1: `Phone` | E1: `Submitted`

### Step 3: Create the Google Apps Script Web App

1. Go to: [https://script.google.com](https://script.google.com)
2. Click **New project**
3. Name the project: **"Agility Lead Capture"**
4. Delete the default `myFunction()` code and paste the following:

```javascript
// ============================================================
// Agility Lead Capture — Google Apps Script
// Receives form submissions, logs to Google Sheet, emails workbook
// ============================================================

// CONFIGURATION — Replace SPREADSHEET_ID with your actual Google Sheet ID (see Step 2)
const SPREADSHEET_ID = '15Ae-TMEls8om6zTW-NuZ4bFTM3s7WBZtU-1oamBF9Pw';  // Agility - Lead Capture sheet
const SHEET_NAME = 'Sheet1';
const DRIVE_FILE_ID = '1NEVMMrH4dMuJCocSrMwJvr-dYZMrAJIx';  // Ratio_Workbook.xlsx in Agility Google Drive folder
const SENDER_NAME = 'Agility Accountants & Advisors';
const EMAIL_SUBJECT = 'Your Free Financial Ratio Workbook — Agility Accountants & Advisors';

function doPost(e) {
  try {
    // Parse the incoming form data
    var data = JSON.parse(e.postData.contents);
    var firstName = data.firstName || '';
    var lastName = data.lastName || '';
    var email = data.email || '';
    var phone = data.phone || '';
    var timestamp = new Date().toLocaleString('en-US', {timeZone: 'America/New_York'});

    // 1. Append row to Google Sheet with full contact details
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    sheet.appendRow([
      firstName,
      lastName,
      email,
      data.website || '',
      phone,
      data.company || '',
      data.industry || '',
      data.notes || '',
      data.formType || '',
      data.source || '',
      data.submittedAt || timestamp
    ]);

    // 2. If this is NOT a workbook request, do not send the workbook email.
    if (!data.sendWorkbook) {
      return ContentService
        .createTextOutput(JSON.stringify({status: 'success', message: 'Lead recorded'}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Get the workbook file from Drive
    var file = DriveApp.getFileById(DRIVE_FILE_ID);

    // 4. Send email with attachment
    var htmlBody = '<div style="font-family: Arial, sans-serif; max-width: 600px;">'
      + '<h2 style="color: #1a3c5e;">Hi ' + firstName + ',</h2>'
      + '<p>Thank you for your interest in Agility Accountants & Advisors!</p>'
      + '<p>Attached is your <strong>Financial Ratio Analysis Workbook</strong>. '
      + 'This spreadsheet includes pre-built formulas for key financial ratios, '
      + 'industry benchmarks, and trend analysis tools to help you understand '
      + 'your business performance at a glance.</p>'
      + '<p>If you have any questions or would like to schedule a consultation, '
      + 'feel free to reply to this email or call us at '
      + '<a href="tel:410-456-2433">410-456-2433</a>.</p>'
      + '<p style="margin-top: 24px;">Best regards,<br>'
      + '<strong>Robert O\'Connor</strong><br>'
      + 'Agility Accountants & Advisors<br>'
      + '<a href="https://agility-website.onrender.com">agility-website.onrender.com</a></p>'
      + '</div>';

    GmailApp.sendEmail(email, EMAIL_SUBJECT,
      'Hi ' + firstName + ', thank you for downloading the Financial Ratio Workbook from Agility Accountants & Advisors. Please find it attached.',
      {
        name: SENDER_NAME,
        htmlBody: htmlBody,
        attachments: [file.getAs(MimeType.MICROSOFT_EXCEL)]
      }
    );

    // 4. Return success
    return ContentService
      .createTextOutput(JSON.stringify({status: 'success', message: 'Email sent'}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Required for CORS — handles preflight
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({status: 'ok', message: 'Agility Lead Capture is running'}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

5. **Replace the two placeholder IDs** at the top with your actual values from Steps 1-2
6. Click **Save** (Ctrl+S)
7. Click **Deploy** → **New deployment**
8. Click the gear icon → select **Web app**
9. Configure:
   - **Description:** "Agility Lead Capture v1"
   - **Execute as:** "Me" (your Google account)
   - **Who has access:** "Anyone"
10. Click **Deploy**
11. **Authorize** when prompted — click through the "Google hasn't verified this app" warning (Advanced → Go to Agility Lead Capture → Allow)
12. **Copy the Web App URL** — it will look like: `https://script.google.com/macros/s/ZZZZZZZZZZZ/exec`
13. **Save this URL** — this is what goes into the website form

### Step 4: Test the Apps Script

Before updating the website, test the script:
1. Open a terminal or use a tool like Postman
2. Send a test POST:
```bash
curl -L -X POST "https://script.google.com/macros/s/ZZZZZZZZZZZ/exec" \
  -H "Content-Type: text/plain" \
  -d '{"firstName":"Test","lastName":"User","email":"YOUR_EMAIL@gmail.com","phone":"555-0000"}'
```
3. Verify: a row appeared in the Google Sheet AND you received the email with the workbook attached.

---

## Part 1: Redesign free-download.html as Lead Capture Page

Replace the entire `<main>` section of `pages/free-download.html` with the following. This becomes the single lead capture / free resource page.

### New `<main>` content for `pages/free-download.html`:

```html
<main>
  <!-- Hero Section -->
  <section class="hero">
    <div class="container">
      <h1>Free Financial Ratio Workbook</h1>
      <p class="hero-subtitle">Enter your info below and we'll send it straight to your inbox</p>
    </div>
  </section>

  <!-- Lead Capture Section -->
  <section class="download-section">
    <div class="container">
      <div class="lead-capture-layout">

        <!-- Left: Value Proposition -->
        <div class="lead-capture-info">
          <h2>What You'll Get</h2>
          <p>Our comprehensive Financial Ratio Analysis Workbook helps you understand your business performance at a glance.</p>
          <ul class="feature-list">
            <li>Pre-built formulas for key financial ratios</li>
            <li>Industry benchmarking comparisons</li>
            <li>Trend analysis over multiple periods</li>
            <li>Automated calculations and charts</li>
            <li>Professional formatting ready to print</li>
          </ul>
          <p class="lead-capture-note"><strong>Free</strong> — no credit card required. We'll email the Excel workbook directly to you.</p>
        </div>

        <!-- Right: Form -->
        <div class="lead-capture-form-wrapper">
          <h3>Get Your Free Workbook</h3>
          <form id="lead-capture-form" class="lead-capture-form">
            <div class="form-group">
              <label for="first-name">First Name *</label>
              <input type="text" id="first-name" name="firstName" required placeholder="First name">
            </div>
            <div class="form-group">
              <label for="last-name">Last Name *</label>
              <input type="text" id="last-name" name="lastName" required placeholder="Last name">
            </div>
            <div class="form-group">
              <label for="email">Email *</label>
              <input type="email" id="email" name="email" required placeholder="you@example.com">
            </div>
            <div class="form-group">
              <label for="phone">Phone</label>
              <input type="tel" id="phone" name="phone" placeholder="(555) 555-5555">
            </div>
            <button type="submit" class="cta-button" id="submit-btn">Send Me the Workbook</button>
            <p class="form-disclaimer">We respect your privacy. No spam — just helpful resources.</p>
          </form>

          <!-- Success Message (hidden by default) -->
          <div id="form-success" class="form-success" style="display:none;">
            <div class="success-icon">&#9989;</div>
            <h3>Check Your Email!</h3>
            <p>We've sent the Financial Ratio Workbook to your inbox. If you don't see it within a few minutes, check your spam folder.</p>
            <p style="margin-top: 16px;"><a href="book-online.html" class="cta-button">Book a Free Consultation</a></p>
          </div>

          <!-- Error Message (hidden by default) -->
          <div id="form-error" class="form-error" style="display:none;">
            <p>Something went wrong. Please try again or email us at <a href="mailto:oconnor1171@gmail.com">oconnor1171@gmail.com</a>.</p>
          </div>
        </div>

      </div>
    </div>
  </section>
</main>
```

Also update the `<title>` tag:
```html
<title>Free Financial Ratio Workbook - Agility Accountants & Advisors</title>
```

---

## Part 2: Create the Form Submission JavaScript

Create a new file `js/lead-capture.js`:

```javascript
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
  // IMPORTANT: Replace this URL with your Google Apps Script Web App URL
  // from the deployment step. It should look like:
  // https://script.google.com/macros/s/ZZZZZZZZZZZ/exec
  // ============================================================
  const SCRIPT_URL = 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';

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
```

---

## Part 3: Add the Script to free-download.html

Before the closing `</body>` tag in `pages/free-download.html`, add:

```html
<script src="../js/lead-capture.js"></script>
```

---

## Part 4: Add CSS for Lead Capture Layout

Add the following to the end of `css/style.css`:

```css
/* Lead capture page */
.lead-capture-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: start;
  padding: 48px 0;
}
.lead-capture-info h2 { margin: 0 0 12px; color: var(--primary); }
.lead-capture-info p { color: var(--text-muted); margin: 0 0 16px; }
.feature-list {
  list-style: none; padding: 0; margin: 0 0 20px;
}
.feature-list li {
  padding: 8px 0 8px 28px; position: relative;
  color: var(--text-dark); font-size: .95rem;
}
.feature-list li::before {
  content: '\2713'; position: absolute; left: 0; color: var(--secondary); font-weight: 700;
}
.lead-capture-note { font-size: .9rem; }

.lead-capture-form-wrapper {
  background: #fff; border: 1px solid var(--border); border-radius: var(--radius);
  padding: 32px; box-shadow: var(--shadow);
}
.lead-capture-form-wrapper h3 { margin: 0 0 20px; color: var(--primary); }
.lead-capture-form .form-group { margin-bottom: 16px; }
.lead-capture-form label {
  display: block; margin-bottom: 4px; font-size: .85rem;
  font-weight: 600; color: var(--text-dark);
}
.lead-capture-form input {
  width: 100%; padding: 10px 14px; border: 1px solid var(--border);
  border-radius: 8px; font-size: .95rem; transition: border-color var(--transition);
}
.lead-capture-form input:focus {
  outline: none; border-color: var(--secondary); box-shadow: 0 0 0 3px rgba(46,134,193,.12);
}
.lead-capture-form .cta-button {
  width: 100%; margin-top: 8px; text-align: center;
}
.lead-capture-form .cta-button:disabled {
  opacity: .6; cursor: not-allowed;
}
.form-disclaimer {
  text-align: center; font-size: .8rem; color: var(--text-muted); margin: 12px 0 0;
}

.form-success {
  text-align: center; padding: 32px 16px;
}
.success-icon { font-size: 3rem; margin-bottom: 12px; }
.form-success h3 { color: var(--primary); margin: 0 0 8px; }
.form-success p { color: var(--text-muted); }

.form-error {
  background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px;
  padding: 12px 16px; margin-top: 12px; color: #991b1b; font-size: .9rem;
}

@media (max-width: 768px) {
  .lead-capture-layout {
    grid-template-columns: 1fr; gap: 24px;
  }
}
```

---

## Part 5: Update Client Resources Nav Dropdown (All 17 HTML Files)

Replace the two separate nav items ("Free Download" and "Ratio Spreadsheet Download") with a single "Free Resource" item in the Client Resources dropdown.

### For files in `/pages/` — find the Client Resources dropdown and replace:

**Find:**
```html
<li><a href="free-download.html">Free Download</a></li>
<li><a href="ratio-download.html">Ratio Spreadsheet Download</a></li>
```

**Replace with:**
```html
<li><a href="free-download.html">Free Resource</a></li>
```

### For `index.html` (root) — find and replace:

**Find:**
```html
<li><a href="pages/free-download.html">Free Download</a></li>
<li><a href="pages/ratio-download.html">Ratio Spreadsheet Download</a></li>
```

**Replace with:**
```html
<li><a href="pages/free-download.html">Free Resource</a></li>
```

**Do this in ALL 17 HTML files** that contain the nav (index.html + all files in pages/).

---

## Part 6: Update Client Resources Page (resource.html)

Add a third resource card for the free workbook to `pages/resource.html`. In the `.resources-grid` div (after the Tax Calendar card), add:

```html
<article class="resource-card">
  <img src="../images/resource-calculator.jpg" alt="Financial ratio workbook" style="width:100%;height:auto;border-radius:8px;">
  <h3>Free Ratio Workbook</h3>
  <p>Download our Financial Ratio Analysis Workbook — pre-built formulas, industry benchmarks, and trend analysis for your business.</p>
  <a href="free-download.html" class="resource-button">Get It Free</a>
</article>
```

---

## Part 7: Verification

1. Open `pages/free-download.html` — verify the two-column layout with feature list on left, form on right.
2. Hover over "Client Resources" in nav — should show: Free Resource, Shop, Financial Calculators, Tax Calendar (IRS Pub 509). No more "Ratio Spreadsheet Download" as a separate item.
3. Open `pages/resource.html` — verify the third resource card appears.
4. Fill out the form with test data and submit — verify the success message appears (the actual email won't send until the owner completes the Google Apps Script setup and pastes the Web App URL into `js/lead-capture.js`).
5. Verify mobile responsiveness — form stacks below the feature list on narrow screens.

---

## Part 8: Commit and Push

```bash
git add pages/free-download.html pages/resource.html js/lead-capture.js css/style.css index.html pages/*.html
git commit -m "Add lead capture system: consolidated free resource page with form, Google Apps Script email delivery, and marketing list"
git push origin main
```

---

## AFTER Claude Code Runs — Owner's Final Step

Once the website changes are pushed, the owner must paste the Google Apps Script Web App URL into the JavaScript file:

1. Open `js/lead-capture.js`
2. Find the line: `const SCRIPT_URL = 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';`
3. Replace with the actual URL from the Apps Script deployment (Step 3, item 12 above)
4. Commit and push:
```bash
git add js/lead-capture.js
git commit -m "Add Google Apps Script endpoint URL for lead capture"
git push origin main
```

---

## Important Notes

- The `mode: 'no-cors'` in the fetch call is intentional — Google Apps Script doesn't handle CORS preflight requests. The trade-off is we can't read the response body, but the request still goes through and the script executes server-side.
- The email will be sent FROM `oconnor1171@gmail.com` (the Google account that owns the Apps Script) — this is automatic.
- Google Apps Script has a daily email quota: 100 emails/day for free Gmail accounts, 1,500/day for Google Workspace. If you expect high volume, consider Workspace.
- The `ratio-download.html` page still exists in the repo but is no longer linked from navigation. You can delete it later or redirect it.
- Do NOT delete the Ratio_Workbook.xlsx from Google Drive — the Apps Script references it by file ID.
- To view your marketing leads, open the "Agility - Lead Capture" Google Sheet at any time. You can filter, sort, or export as needed.
