// Agility Lead Capture — Google Apps Script
// Receives form submissions, logs to Google Sheet, emails workbook only for workbook requests

const SPREADSHEET_ID = '15Ae-TMEls8om6zTW-NuZ4bFTM3s7WBZtU-1oamBF9Pw';
const SHEET_NAME = 'Sheet1';
const DRIVE_FILE_ID = '1NEVMMrH4dMuJCocSrMwJvr-dYZMrAJIx';  // Ratio_Workbook.xlsx
const SENDER_NAME = 'Agility Accountants & Advisors';
const EMAIL_SUBJECT = 'Your Free Financial Ratio Workbook — Agility Accountants & Advisors';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents || '{}');
    var firstName = data.firstName || '';
    var lastName = data.lastName || '';
    var email = data.email || '';
    var phone = data.phone || '';
    var website = data.website || '';
    var company = data.company || '';
    var industry = data.industry || '';
    var notes = data.notes || data.message || '';
    var formType = data.formType || '';
    var source = data.source || '';
    var submittedAt = data.submittedAt || new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
    var sendWorkbook = !!data.sendWorkbook;

    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    sheet.appendRow([
      firstName,
      lastName,
      email,
      website,
      phone,
      company,
      industry,
      notes,
      formType,
      source,
      submittedAt
    ]);

    if (!sendWorkbook) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'success', message: 'Lead recorded without workbook' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var file = DriveApp.getFileById(DRIVE_FILE_ID);
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

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Workbook sent' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
