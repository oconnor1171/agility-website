# Execution Guide: Lead Capture System Setup

This is the step-by-step order of operations. There are two phases: things YOU do in Google, then things Claude Code does on the website.

---

## PHASE 1: Google Setup (You Do This First — ~15 minutes)

### 1.1 — Upload the Workbook to Google Drive ✅ DONE

The file is already uploaded. The file ID is: **`1NEVMMrH4dMuJCocSrMwJvr-dYZMrAJIx`**
This is already hardcoded into the Apps Script code — no action needed for this step.

### 1.2 — Create the Lead Capture Google Sheet ✅ DONE

The sheet is already created. The spreadsheet ID is: **`15Ae-TMEls8om6zTW-NuZ4bFTM3s7WBZtU-1oamBF9Pw`**
This is already hardcoded into the Apps Script code — no action needed for this step.
- **Confirm** row 1 has headers: `First Name` | `Last Name` | `Email` | `Phone` | `Submitted`

### 1.3 — Create the Google Apps Script

1. Go to [https://script.google.com](https://script.google.com)
2. Click **New project**
3. Name it: **Agility Lead Capture**
4. Delete the default code
5. Paste the Apps Script code from the Claude Code prompt file (Part: "Step 3: Create the Google Apps Script Web App")
6. Both IDs are already filled in — verify the spreadsheet ID and file ID look correct
7. (No manual replacement needed — skip to step 8)
8. Press **Ctrl+S** to save

### 1.4 — Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon (⚙) next to "Select type" → choose **Web app**
3. Set:
   - Description: `Agility Lead Capture v1`
   - Execute as: `Me (your email)`
   - Who has access: `Anyone`
4. Click **Deploy**
5. Click **Authorize access** → select your Google account
6. If you see "Google hasn't verified this app": click **Advanced** → **Go to Agility Lead Capture (unsafe)** → **Allow**
7. Copy the **Web App URL** it gives you
8. Write down this URL — you need it for the final step

### 1.5 — Test It

Run this in a terminal (replace the URL and email):

```bash
curl -L -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: text/plain" \
  -d '{"firstName":"Test","lastName":"User","email":"YOUR_PERSONAL_EMAIL","phone":"555-0000"}'
```

Check:
- Did a new row appear in the Google Sheet? ✓
- Did you receive an email with the workbook attached? ✓

If yes, Phase 1 is done.

---

## PHASE 2: Run the Claude Code Prompt (~2 minutes)

### 2.1 — Execute the Prompt

Open a terminal in your website repo directory and run:

```bash
cd /path/to/agility-website
cat CLAUDE_CODE_PROMPT_lead_capture_system.md | claude
```

Or open Claude Code and paste the contents of `CLAUDE_CODE_PROMPT_lead_capture_system.md`.

Claude Code will:
- Redesign `free-download.html` into a lead capture page
- Create `js/lead-capture.js` with the form submission logic
- Add CSS for the new layout
- Update the nav dropdown in all 17 HTML files (merge two items → "Free Resource")
- Add a resource card on the Client Resources page
- Commit and push to GitHub

### 2.2 — Paste Your Web App URL

After Claude Code finishes, do this one manual edit:

1. Open `js/lead-capture.js`
2. Find: `const SCRIPT_URL = 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';`
3. Replace with your actual Web App URL from Phase 1, step 1.4
4. Save, commit, push:

```bash
git add js/lead-capture.js
git commit -m "Add Google Apps Script endpoint URL"
git push origin main
```

---

## PHASE 3: Verify Live Site (~5 minutes)

1. Visit your live site's Free Resource page
2. Fill out the form with a real email
3. Confirm:
   - Success message appears on the page
   - Row shows up in the Google Sheet
   - Email arrives with the workbook attached
4. Check nav dropdown — "Free Resource" should be a single item (no more separate "Ratio Spreadsheet Download")

---

## Troubleshooting

**Form submits but no email arrives:**
- Check the Google Sheet — if the row IS there, the issue is email delivery. Check spam folder.
- Open the Apps Script project → **Executions** tab (left sidebar) → check for errors.

**Form shows error message:**
- Verify the Web App URL in `js/lead-capture.js` is correct and complete.
- Verify the Apps Script deployment access is set to "Anyone".

**Need to update the Apps Script code:**
- Edit the code in script.google.com → **Deploy** → **Manage deployments** → click the pencil icon → set version to "New version" → **Deploy**. The URL stays the same.

**Email quota exceeded (100/day on free Gmail):**
- Consider upgrading to Google Workspace ($6/mo) which gives 1,500 emails/day.

---

## What You'll Have When Done

1. **Website**: Clean lead capture page with form → "Check your email!" flow
2. **Google Sheet**: Growing marketing list with name, email, phone, timestamp
3. **Auto-email**: Every lead gets the workbook delivered to their inbox
4. **Nav**: Streamlined Client Resources dropdown with "Free Resource" as single item
