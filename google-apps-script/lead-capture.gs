// Agility Lead Capture: Google Apps Script
// Receives form submissions and logs them to the Google Sheet.
// Every lead now emails RO (NOTIFY_TO), with the pricing tag in the subject when present.
// Contact submissions send the visitor a simple receipt; workbook downloads send the ratio workbook.
// Booking join (added 2026-10-06, G-18): a time trigger matches new bookings on RO's appointment
// schedule to recent leads by email, writes the lead details onto the calendar event, and emails RO.
//
// ONE-TIME SETUP (RO, signed in as roconnor@agility-accountants.com, the owner of the appointment schedule):
//   1. Paste this file over the existing script, Save.
//   2. Run setupBookingTrigger once from the editor and approve the Gmail, Sheets and Calendar permissions.
//   3. Deploy > Manage deployments > edit the existing web app > Version: New version > Deploy.
//      The web app URL stays the same, so the website needs no change.

const SPREADSHEET_ID = '15Ae-TMEls8om6zTW-NuZ4bFTM3s7WBZtU-1oamBF9Pw';
const SHEET_NAME = 'Sheet1';
const DRIVE_FILE_ID = '1NEVMMrH4dMuJCocSrMwJvr-dYZMrAJIx';  // Ratio_Workbook.xlsx
const SENDER_NAME = 'Agility Accountants & Advisors';
const NOTIFY_TO = 'roconnor@agility-accountants.com';
const CONTACT_EMAIL_SUBJECT = 'Thank you for reaching out: Agility Accountants & Advisors';
const WORKBOOK_EMAIL_SUBJECT = 'Your Free Financial Ratio Workbook: Agility Accountants & Advisors';

// Sheet columns (1-based). Columns 1 to 16 are unchanged from the earlier version.
const COL = { firstName: 1, lastName: 2, email: 3, notes: 8, submittedAt: 9, formType: 10,
              sizingTag: 17, band: 18, plan: 19, billing: 20, bookedEvent: 21 };
const MATCH_WINDOW_DAYS = 14;    // a booking matches a lead submitted up to 14 days earlier
const LOOKAHEAD_DAYS = 90;       // bookings searched up to 90 days ahead
const LEAD_MARK = '--- AGILITY LEAD ---';

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
      submittedAt,
      data.formType || '',
      data.formPage || '',
      data.landingPage || '',
      data.referrer || '',
      data.utmSource || '',
      data.utmMedium || '',
      data.utmCampaign || '',
      data.sizingTag || '',
      data.band || '',
      data.plan || '',
      data.billing || '',
      ''
    ]);

    // RO is told about every lead. A failure here must never stop the visitor's receipt.
    try { notifyRO(data); } catch (notifyErr) { console.error('notifyRO failed: ' + notifyErr); }

    if (!sendWorkbook) {
      var contactBody = '<div style="font-family: Arial, sans-serif; max-width: 600px;">'
        + '<h2 style="color: #1a3c5e;">Hi ' + esc(firstName) + ',</h2>'
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
      + '<h2 style="color: #1a3c5e;">Hi ' + esc(firstName) + ',</h2>'
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

// ---------------------------------------------------------------- notification to RO
function notifyRO(data) {
  var name = ((data.firstName || '') + ' ' + (data.lastName || '')).trim() || '(no name)';
  var kind = data.sendWorkbook ? 'Workbook download' : (data.formType === 'pricing' ? 'Pricing lead' : 'Contact form');
  var subject = (data.sizingTag ? data.sizingTag + ' ' : '') + 'New lead: ' + name + (data.company ? ', ' + data.company : '') + ' (' + kind + ')';
  if (/^TEST Growth Operator/i.test(name)) subject = '[TEST] ' + subject;
  var rows = [
    ['Name', name], ['Email', data.email], ['Phone', data.phone], ['Company', data.company],
    ['Website', data.website], ['Industry', data.industry], ['Form', kind + (data.formPage ? ' on ' + data.formPage : '')],
    ['Came from', [data.landingPage, data.referrer, data.utmSource, data.utmMedium, data.utmCampaign].filter(String).join(' | ')],
    ['Submitted', data.submittedAt]
  ];
  var plain = rows.map(function (r) { return r[0] + ': ' + (r[1] || ''); }).join('\n')
    + '\n\nNotes:\n' + (data.notes || '(none)')
    + '\n\nIf they book a call with the same email, these details are added to the calendar event automatically.';
  var html = '<div style="font-family: Arial, sans-serif; max-width: 640px;">'
    + '<h2 style="color:#023a5e;margin:0 0 12px;">' + esc(kind) + ': ' + esc(name) + '</h2>'
    + '<table style="border-collapse:collapse;">'
    + rows.map(function (r) { return '<tr><td style="padding:4px 12px 4px 0;color:#475569;vertical-align:top;">' + esc(r[0]) + '</td><td style="padding:4px 0;">' + esc(r[1] || '') + '</td></tr>'; }).join('')
    + '</table><h3 style="color:#023a5e;margin:18px 0 6px;">Notes</h3>'
    + '<pre style="white-space:pre-wrap;font-family:Consolas,monospace;background:#f4f8fb;padding:12px;border-radius:6px;">' + esc(data.notes || '(none)') + '</pre>'
    + '<p style="color:#475569;font-size:13px;">If they book a call with the same email, these details are added to the calendar event automatically.</p></div>';
  GmailApp.sendEmail(NOTIFY_TO, subject, plain, { name: 'Agility website', htmlBody: html, replyTo: data.email || NOTIFY_TO });
}

// ---------------------------------------------------------------- booking join
function setupBookingTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'attachLeadsToBookings') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('attachLeadsToBookings').timeBased().everyMinutes(10).create();
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  var head = sheet.getRange(1, COL.sizingTag, 1, 5).getValues()[0];
  if (head.join('') === '') {
    sheet.getRange(1, COL.sizingTag, 1, 5).setValues([['Pricing tag', 'Band', 'Plan', 'Billing', 'Booked event']]);
  }
  attachLeadsToBookings();
  return 'Trigger installed for ' + Session.getEffectiveUser().getEmail();
}

function attachLeadsToBookings() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return;
  try {
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    var last = sheet.getLastRow();
    if (last < 2) return;
    var width = Math.max(sheet.getLastColumn(), COL.bookedEvent);
    var values = sheet.getRange(1, 1, last, width).getValues();
    var cutoff = new Date(Date.now() - MATCH_WINDOW_DAYS * 86400000);
    var leadsByEmail = {};
    for (var i = values.length - 1; i >= 1; i--) {     // newest first; row 1 is the header
      var r = values[i];
      var email = String(r[COL.email - 1] || '').trim().toLowerCase();
      if (!email || r[COL.bookedEvent - 1]) continue;
      var when = new Date(r[COL.submittedAt - 1]);
      if (isNaN(when) || when < cutoff) continue;
      if (!leadsByEmail[email]) leadsByEmail[email] = { row: i + 1, r: r };
    }
    if (!Object.keys(leadsByEmail).length) return;

    var cal = CalendarApp.getDefaultCalendar();
    var events = cal.getEvents(new Date(Date.now() - 86400000), new Date(Date.now() + LOOKAHEAD_DAYS * 86400000));
    events.forEach(function (ev) {
      var desc = ev.getDescription() || '';
      if (desc.indexOf(LEAD_MARK) >= 0) return;          // already joined
      var guests = ev.getGuestList(true).map(function (g) { return String(g.getEmail()).toLowerCase(); });
      var hit = null;
      guests.forEach(function (g) { if (!hit && leadsByEmail[g]) hit = leadsByEmail[g]; });
      if (!hit) return;
      var r = hit.r;
      var name = (String(r[COL.firstName - 1]) + ' ' + String(r[COL.lastName - 1])).trim();
      var tag = String(r[COL.sizingTag - 1] || '');
      var block = LEAD_MARK + '\n' + (tag ? tag + '\n' : '') + 'Name: ' + name + '\nEmail: ' + r[COL.email - 1]
        + '\nPhone: ' + (r[4] || '') + '\nCompany: ' + (r[5] || '') + '\nIndustry: ' + (r[6] || '')
        + '\nSubmitted: ' + r[COL.submittedAt - 1] + '\n\n' + String(r[COL.notes - 1] || '');
      ev.setDescription(desc ? desc + '\n\n' + block : block);
      sheet.getRange(hit.row, COL.bookedEvent).setValue(ev.getStartTime().toISOString() + ' ' + ev.getId());
      var when = Utilities.formatDate(ev.getStartTime(), 'America/New_York', 'EEE MMM d, h:mm a');
      var subject = (/^TEST Growth Operator/i.test(name) ? '[TEST] ' : '') + (tag ? tag + ' ' : '') + 'Booked: ' + name + ', ' + when;
      GmailApp.sendEmail(NOTIFY_TO, subject,
        name + ' booked a call for ' + when + ' ET.\nThe lead details below were added to the calendar event.\n\n' + block,
        { name: 'Agility website' });
      delete leadsByEmail[String(r[COL.email - 1]).trim().toLowerCase()];
    });
  } finally {
    lock.releaseLock();
  }
}

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
