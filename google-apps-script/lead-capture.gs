// Agility Lead Capture — Google Apps Script
// Receives form submissions, logs to Google Sheet.
// Contact submissions send a simple receipt email without the workbook attachment.
// Workbook downloads send the ratio workbook email only when requested.

const SPREADSHEET_ID = '15Ae-TMEls8om6zTW-NuZ4bFTM3s7WBZtU-1oamBF9Pw';
const SHEET_NAME = 'Sheet1';
const DRIVE_FILE_ID = '1NEVMMrH4dMuJCocSrMwJvr-dYZMrAJIx';  // Ratio_Workbook.xlsx
const SENDER_NAME = 'Agility Accountants & Advisors';
const CONTACT_EMAIL_SUBJECT = 'Thank you for reaching out — Agility Accountants & Advisors';
const WORKBOOK_EMAIL_SUBJECT = 'Your Free Financial Ratio Workbook — Agility Accountants & Advisors';

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
      submittedAt
    ]);

    if (!sendWorkbook) {
      var contactBody = '<div style="font-family: Arial, sans-serif; max-width: 600px;">'
        + '<h2 style="color: #1a3c5e;">Hi ' + firstName + ',</h2>'
        + '<p>Thank you for contacting Agility Accountants & Advisors.</p>'
        + '<p>We have received your request and someone will contact you within 1-2 business days.</p>'
        + '<p>If you need to reach us sooner, call us at <a href="tel:410-456-2433">410-456-2433</a>.</p>'
        + '<p style="margin-top: 24px;">Best regards,<br><strong>Agility Accountants & Advisors</strong></p>'
        + '</div>';

      GmailApp.sendEmail(email, CONTACT_EMAIL_SUBJECT,
        'Hi ' + firstName + ', thank you for contacting Agility Accountants & Advisors. We will be in touch within 1-2 business days.',
        {
          name: SENDER_NAME,
          htmlBody: contactBody
        }
      );

      return ContentService
        .createTextOutput(JSON.stringify({ status: 'success', message: 'Contact confirmation email sent' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var file = DriveApp.getFileById(DRIVE_FILE_ID);
    var workbookBody = '<div style="font-family: Arial, sans-serif; max-width: 600px;">'
      + '<h2 style="color: #1a3c5e;">Hi ' + firstName + ',</h2>'
      + '<p>Thank you for your interest in Agility Accountants & Advisors!</p>'
      + '<p>Attached is your <strong>Financial Ratio Analysis Workbook</strong>.</p>'
      + '<p>If you have any questions or would like to schedule a consultation, '
      + 'feel free to reply to this email or call us at '
      + '<a href="tel:410-456-2433">410-456-2433</a>.</p>'
      + '<p style="margin-top: 24px;">Best regards,<br>'
      + '<strong>Agility Accountants & Advisors</strong></p>'
      + '</div>';

    GmailApp.sendEmail(email, WORKBOOK_EMAIL_SUBJECT,
      'Hi ' + firstName + ', thank you for downloading the Financial Ratio Workbook from Agility Accountants & Advisors. Please find it attached.',
      {
        name: SENDER_NAME,
        htmlBody: workbookBody,
        attachments: [file.getAs(MimeType.MICROSOFT_EXCEL)]
      }
    );

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Workbook email sent' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
