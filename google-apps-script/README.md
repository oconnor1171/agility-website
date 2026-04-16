# Agility Lead Capture Apps Script

This folder contains the Google Apps Script project for lead capture and workbook delivery.

## Files

- `lead-capture.gs` — main script that logs form leads to Google Sheets and conditionally emails the workbook.
- `appsscript.json` — manifest with required OAuth scopes and runtime settings.

## Deployment

### Option 1: Manual copy/paste
1. Open [Google Apps Script](https://script.google.com/).
2. Create a new project.
3. Replace the default `Code.gs` content with the contents of `lead-capture.gs`.
4. Open the project manifest by selecting `View > Show manifest`.
5. Replace the contents with `appsscript.json`.
6. Save the project.
7. Select `Deploy > New deployment`.
8. Choose `Web app`.
9. Set `Execute as` to `Me` and `Who has access` to `Anyone`.
10. Deploy and copy the Web App URL.

### Option 2: Using clasp
1. Install and authorize `clasp` if needed.
2. Run `clasp create --type webapp --title "Agility Lead Capture"` in the `google-apps-script` folder.
3. Copy the generated `.clasp.json` file into this folder if needed.
4. Run `clasp push`.

## Notes

- The script only sends the workbook attachment when the payload contains `sendWorkbook: true`.
- Contact form submissions are logged but do not trigger the workbook email.
- The sheet row format is:
  - `First Name`, `Last Name`, `Email`, `Website`, `Phone`, `Company`, `Industry`, `Notes`, `formType`, `source`, `submittedAt`
