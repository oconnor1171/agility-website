// Agility Lead Capture: Google Apps Script
// Handles: (1) contact and ratio-download forms (Sheet1),
//          (2) website Benchmark tool submissions ("Web Leads" tab) with a follow-up email,
//          (3) a notification to RO for EVERY lead (added 2026-10-07),
//          (4) booking join: every 10 minutes, bookings on RO's appointment schedule are matched to
//              recent leads by email; the lead details are written onto the calendar event and RO is
//              emailed (added 2026-10-07, approval G-18).
//
// ONE-TIME SETUP, signed in as roconnor@agility-accountants.com (owner of the appointment schedule):
//   1. Replace the whole script with this file and Save.
//   2. Choose setupBookingTrigger in the function list, click Run, approve the permissions.
//   3. Deploy > Manage deployments > edit the existing web app > Version: New version > Deploy.
//      The web app URL stays the same, so the website needs no change.
//
// Change log for this file: Growth_Operator\records\Change_Log.md, entry 2026-10-07 (lead script v2).

const SPREADSHEET_ID = '15Ae-TMEls8om6zTW-NuZ4bFTM3s7WBZtU-1oamBF9Pw';
const SHEET_NAME = 'Sheet1';
const WEB_LEADS_SHEET = 'Web Leads';
const DRIVE_FILE_ID = '1NEVMMrH4dMuJCocSrMwJvr-dYZMrAJIx';  // Ratio_Workbook.xlsx
const PRICING_URL = 'https://agility-accountants.com/pages/pricing.html';
const BOOK_ONLINE_URL = 'https://agility-accountants.com/pages/book-online.html';
const SENDER_NAME = 'Agility Accountants & Advisors';
const NOTIFY_TO = 'roconnor@agility-accountants.com';
const CONTACT_EMAIL_SUBJECT = 'Thank you for reaching out: Agility Accountants & Advisors';
const WORKBOOK_EMAIL_SUBJECT = 'Your Free Financial Ratio Workbook: Agility Accountants & Advisors';
const VALUESHEET_EMAIL_SUBJECT = 'Your benchmark snapshot: see what to fix next';

// Sheet1 columns (1-based). Columns 1 to 9 are the existing ones; 10 to 21 are added by this version.
const S1 = { firstName: 1, lastName: 2, email: 3, website: 4, phone: 5, company: 6, industry: 7, notes: 8, submittedAt: 9,
             formType: 10, formPage: 11, landingPage: 12, referrer: 13, utmSource: 14, utmMedium: 15, utmCampaign: 16,
             sizingTag: 17, band: 18, plan: 19, billing: 20, bookedEvent: 21 };
const S1_NEW_HEADERS = ['Form Type', 'Form Page', 'Landing Page', 'Referrer', 'UTM Source', 'UTM Medium', 'UTM Campaign',
                        'Pricing Tag', 'Band', 'Plan', 'Billing', 'Booked Event'];
// Web Leads columns (1-based). Columns 1 to 17 are the existing ones; 18 is added by this version.
const WL = { submittedAt: 1, firstName: 2, lastName: 3, email: 4, company: 5, phone: 6, industry: 7, revenue: 8,
             metricLabel: 13, yourPct: 14, bestPct: 15, opportunity: 16, bookedEvent: 18 };

const MATCH_WINDOW_DAYS = 14;    // a booking matches a lead submitted up to 14 days earlier
const LOOKAHEAD_DAYS = 90;       // bookings searched up to 90 days ahead
const LEAD_MARK = '--- AGILITY LEAD ---';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents || '{}');

    // ---- Route: website Benchmark tool ----
    if ((data.formType || '') === 'benchmark') {
      return handleBenchmark_(data);
    }

    // ---- Contact form and ratio download ----
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
    sheet.appendRow([firstName, lastName, email, website, phone, company, industry, notes, submittedAt,
      data.formType || (sendWorkbook ? 'workbook' : 'contact'), data.formPage || '', data.landingPage || '',
      data.referrer || '', data.utmSource || '', data.utmMedium || '', data.utmCampaign || '',
      data.sizingTag || '', data.band || '', data.plan || '', data.billing || '', '']);

    // RO is told about every lead. A failure here must never stop the visitor's email.
    try { notifyContact_(data); } catch (err) { console.error('notifyContact_ failed: ' + err); }

    if (!sendWorkbook) {
      var contactBody = '<div style="font-family: Arial, sans-serif; max-width: 600px;">'
        + '<h2 style="color: #1a3c5e;">Hi ' + esc_(firstName) + ',</h2>'
        + '<p>Thank you for contacting Agility Accountants &amp; Advisors.</p>'
        + '<p>We have received your request and someone will contact you within 1-2 business days.</p>'
        + '<p>If you need to reach us sooner, call us at <a href="tel:410-456-2433">410-456-2433</a>.</p>'
        + '<p style="margin-top: 24px;">Best regards,<br><strong>Agility Accountants &amp; Advisors</strong></p>'
        + '</div>';
      GmailApp.sendEmail(email, CONTACT_EMAIL_SUBJECT,
        'Hi ' + firstName + ', thank you for contacting Agility Accountants & Advisors. We will be in touch within 1-2 business days.',
        { name: SENDER_NAME, htmlBody: contactBody });
      return jsonOut_({ status: 'success', message: 'Contact confirmation email sent' });
    }

    var file = DriveApp.getFileById(DRIVE_FILE_ID);
    var workbookBody = '<div style="font-family: Arial, sans-serif; max-width: 600px;">'
      + '<h2 style="color: #1a3c5e;">Hi ' + esc_(firstName) + ',</h2>'
      + '<p>Thank you for your interest in Agility Accountants &amp; Advisors!</p>'
      + '<p>Attached is your <strong>Financial Ratio Analysis Workbook</strong>.</p>'
      + '<p>If you have any questions or would like to schedule a consultation, reply to this email or call us at '
      + '<a href="tel:410-456-2433">410-456-2433</a>.</p>'
      + '<p style="margin-top: 24px;">Best regards,<br><strong>Agility Accountants &amp; Advisors</strong></p>'
      + '</div>';
    GmailApp.sendEmail(email, WORKBOOK_EMAIL_SUBJECT,
      'Hi ' + firstName + ', thank you for downloading the Financial Ratio Workbook. Please find it attached.',
      { name: SENDER_NAME, htmlBody: workbookBody, attachments: [file.getAs(MimeType.MICROSOFT_EXCEL)] });
    return jsonOut_({ status: 'success', message: 'Workbook email sent' });

  } catch (error) {
    return jsonOut_({ status: 'error', message: error.toString() });
  }
}

function handleBenchmark_(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(WEB_LEADS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(WEB_LEADS_SHEET);
    sheet.appendRow(['Submitted At','First Name','Last Name','Email','Company','Phone','Industry',
      'Revenue/Sales ($)','Cost 1','Cost 1 ($)','Cost 2','Cost 2 ($)','Key Metric','Your %','Best-in-Class %','Opportunity ($)','Source',
      'Booked Event']);
    sheet.getRange(1,1,1,18).setFontWeight('bold');
  }
  var first = data.firstName || '';
  var email = data.email || '';
  var submittedAt = data.submittedAt || new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
  sheet.appendRow([
    submittedAt, first, data.lastName || '', email, data.company || '', data.phone || '', data.industry || '',
    Number(data.revenue) || '', data.cost1Label || '', Number(data.cost1) || '',
    data.cost2Label || '', Number(data.cost2) || '', data.metricLabel || '', data.metricPct || '',
    data.bestPct || '', Number(data.opportunity) || '', data.source || 'website benchmark tool', ''
  ]);

  // RO is told about every lead. A failure here must never stop the visitor's email.
  try { notifyBenchmark_(data); } catch (err) { console.error('notifyBenchmark_ failed: ' + err); }

  if (email) {
    var oppText = data.opportunity ? ('about <strong>$' + Number(data.opportunity).toLocaleString() + ' a year</strong>') : 'real margin';
    var body = '<div style="font-family: Arial, sans-serif; max-width: 600px;">'
      + '<h2 style="color: #1a3c5e;">Hi ' + esc_(first) + ',</h2>'
      + '<p>Thanks for running your benchmark snapshot. Based on what you entered, there may be ' + oppText
      + ' of margin opportunity in your business.</p>'
      + '<p>The snapshot is directional. Our Advanced bookkeeping plan checks every number against your actual transactions '
      + 'each month, benchmarks each cost line against your industry average and its best-in-class operators, and gives you one priority to fix first:</p>'
      + '<p><a href="' + PRICING_URL + '" style="color:#2E6B3E;font-weight:bold;">See the plans and check your price</a></p>'
      + '<p style="margin:24px 0;"><a href="' + BOOK_ONLINE_URL + '" style="display:inline-block;background:#2E6B3E;color:#ffffff;text-decoration:none;font-weight:bold;padding:13px 24px;border-radius:8px;">Book your complimentary 30-minute call &rarr;</a></p>'
      + '<p>Prefer to talk it through? Reach me directly:</p>'
      + '<p style="line-height:1.7;"><strong>Robert O\'Connor, CPA</strong><br>'
      + 'Agility Accountants &amp; Advisors<br>'
      + 'Phone: <a href="tel:410-456-2433">410-456-2433</a><br>'
      + 'Email: <a href="mailto:roconnor@agility-accountants.com">roconnor@agility-accountants.com</a><br>'
      + 'Book online: <a href="' + BOOK_ONLINE_URL + '">agility-accountants.com/book-online</a><br>'
      + 'Bel Air, Maryland</p>'
      + '<p style="margin-top: 20px;">Best regards,<br><strong>Robert O\'Connor, CPA</strong><br>Agility Accountants &amp; Advisors</p>'
      + '</div>';
    GmailApp.sendEmail(email, VALUESHEET_EMAIL_SUBJECT,
      'Hi ' + first + ', thanks for running your benchmark snapshot. See the plans and check your price: ' + PRICING_URL
        + '  Book a complimentary 30-minute call: ' + BOOK_ONLINE_URL,
      { name: SENDER_NAME, htmlBody: body });
  }
  return jsonOut_({ status: 'success', message: 'Benchmark lead captured' });
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------- notifications to RO
function notifyContact_(data) {
  var name = ((data.firstName || '') + ' ' + (data.lastName || '')).trim() || '(no name)';
  var kind = data.sendWorkbook ? 'Workbook download' : (data.formType === 'pricing' ? 'Pricing lead' : 'Contact form');
  var subject = (data.sizingTag ? data.sizingTag + ' ' : '') + 'New lead: ' + name + (data.company ? ', ' + data.company : '') + ' (' + kind + ')';
  sendNotice_(subject, kind + ': ' + name, [
    ['Name', name], ['Email', data.email], ['Phone', data.phone], ['Company', data.company],
    ['Website', data.website], ['Industry', data.industry],
    ['Form', kind + (data.formPage ? ' on ' + data.formPage : '')],
    ['Came from', [data.landingPage, data.referrer, data.utmSource, data.utmMedium, data.utmCampaign].filter(String).join(' | ')],
    ['Submitted', data.submittedAt]
  ], data.notes || data.message || '', data.email);
}

function notifyBenchmark_(data) {
  var name = ((data.firstName || '') + ' ' + (data.lastName || '')).trim() || '(no name)';
  var subject = '[Benchmark] New lead: ' + name + (data.company ? ', ' + data.company : '')
    + (data.opportunity ? ' (opportunity $' + Number(data.opportunity).toLocaleString() + ')' : '');
  sendNotice_(subject, 'Benchmark snapshot: ' + name, [
    ['Name', name], ['Email', data.email], ['Phone', data.phone], ['Company', data.company], ['Industry', data.industry],
    ['Revenue', data.revenue ? '$' + Number(data.revenue).toLocaleString() : ''],
    [data.cost1Label || 'Cost 1', data.cost1 ? '$' + Number(data.cost1).toLocaleString() : ''],
    [data.cost2Label || 'Cost 2', data.cost2 ? '$' + Number(data.cost2).toLocaleString() : ''],
    [data.metricLabel || 'Key metric', (data.metricPct || '') + (data.bestPct ? ' (best-in-class ' + data.bestPct + ')' : '')],
    ['Opportunity', data.opportunity ? '$' + Number(data.opportunity).toLocaleString() + ' a year' : ''],
    ['Submitted', data.submittedAt]
  ], '', data.email);
}

function sendNotice_(subject, heading, rows, notes, replyTo) {
  if (/^TEST Growth Operator/i.test(String(rows[0][1] || ''))) subject = '[TEST] ' + subject;
  var plain = rows.map(function (r) { return r[0] + ': ' + (r[1] || ''); }).join('\n')
    + (notes ? '\n\nNotes:\n' + notes : '')
    + '\n\nIf they book a call with the same email, these details are added to the calendar event automatically.';
  var html = '<div style="font-family: Arial, sans-serif; max-width: 640px;">'
    + '<h2 style="color:#023a5e;margin:0 0 12px;">' + esc_(heading) + '</h2>'
    + '<table style="border-collapse:collapse;">'
    + rows.map(function (r) { return '<tr><td style="padding:4px 12px 4px 0;color:#475569;vertical-align:top;">' + esc_(r[0]) + '</td><td style="padding:4px 0;">' + esc_(r[1] || '') + '</td></tr>'; }).join('')
    + '</table>'
    + (notes ? '<h3 style="color:#023a5e;margin:18px 0 6px;">Notes</h3><pre style="white-space:pre-wrap;font-family:Consolas,monospace;background:#f4f8fb;padding:12px;border-radius:6px;">' + esc_(notes) + '</pre>' : '')
    + '<p style="color:#475569;font-size:13px;">If they book a call with the same email, these details are added to the calendar event automatically.</p></div>';
  GmailApp.sendEmail(NOTIFY_TO, subject, plain, { name: 'Agility website', htmlBody: html, replyTo: replyTo || NOTIFY_TO });
}

// ---------------------------------------------------------------- booking join
// Run once from the editor. Installs the 10-minute trigger, adds the new column headers, then runs one pass.
function setupBookingTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'attachLeadsToBookings') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('attachLeadsToBookings').timeBased().everyMinutes(10).create();

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var s1 = ss.getSheetByName(SHEET_NAME);
  if (String(s1.getRange(1, S1.formType).getValue()) === '') {
    s1.getRange(1, S1.formType, 1, S1_NEW_HEADERS.length).setValues([S1_NEW_HEADERS]).setFontWeight('bold');
  }
  var wl = ss.getSheetByName(WEB_LEADS_SHEET);
  if (wl && String(wl.getRange(1, WL.bookedEvent).getValue()) === '') {
    wl.getRange(1, WL.bookedEvent).setValue('Booked Event').setFontWeight('bold');
  }
  attachLeadsToBookings();
  return 'Trigger installed for ' + Session.getEffectiveUser().getEmail();
}

function attachLeadsToBookings() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return;
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var cutoff = new Date(Date.now() - MATCH_WINDOW_DAYS * 86400000);
    var leads = {};   // email -> newest unbooked lead within the window
    collectLeads_(ss.getSheetByName(SHEET_NAME), S1, cutoff, leads, function (r) {
      return { tag: String(r[S1.sizingTag - 1] || ''), phone: r[S1.phone - 1], company: r[S1.company - 1],
               industry: r[S1.industry - 1], notes: String(r[S1.notes - 1] || '') };
    });
    collectLeads_(ss.getSheetByName(WEB_LEADS_SHEET), WL, cutoff, leads, function (r) {
      return { tag: '[Benchmark]', phone: r[WL.phone - 1], company: r[WL.company - 1], industry: r[WL.industry - 1],
               notes: 'Benchmark snapshot: revenue ' + r[WL.revenue - 1] + '; ' + r[WL.metricLabel - 1] + ' ' + r[WL.yourPct - 1]
                 + ' vs best-in-class ' + r[WL.bestPct - 1] + '; opportunity ' + r[WL.opportunity - 1] };
    });
    if (!Object.keys(leads).length) return;

    var events = CalendarApp.getDefaultCalendar().getEvents(new Date(Date.now() - 86400000), new Date(Date.now() + LOOKAHEAD_DAYS * 86400000));
    events.forEach(function (ev) {
      var desc = ev.getDescription() || '';
      if (desc.indexOf(LEAD_MARK) >= 0) return;          // already joined
      var hit = null;
      ev.getGuestList(true).forEach(function (g) {
        var ge = String(g.getEmail()).toLowerCase();
        if (!hit && leads[ge]) hit = leads[ge];
      });
      if (!hit) return;
      var block = LEAD_MARK + '\n' + (hit.extra.tag ? hit.extra.tag + '\n' : '') + 'Name: ' + hit.name + '\nEmail: ' + hit.email
        + '\nPhone: ' + (hit.extra.phone || '') + '\nCompany: ' + (hit.extra.company || '') + '\nIndustry: ' + (hit.extra.industry || '')
        + '\nSubmitted: ' + hit.submitted + '\n\n' + hit.extra.notes;
      ev.setDescription(desc ? desc + '\n\n' + block : block);
      hit.sheet.getRange(hit.row, hit.bookedCol).setValue(ev.getStartTime().toISOString() + ' ' + ev.getId());
      var when = Utilities.formatDate(ev.getStartTime(), 'America/New_York', 'EEE MMM d, h:mm a');
      var subject = (/^TEST Growth Operator/i.test(hit.name) ? '[TEST] ' : '') + (hit.extra.tag ? hit.extra.tag + ' ' : '')
        + 'Booked: ' + hit.name + ', ' + when;
      GmailApp.sendEmail(NOTIFY_TO, subject,
        hit.name + ' booked a call for ' + when + ' ET.\nThe lead details below were added to the calendar event.\n\n' + block,
        { name: 'Agility website' });
      delete leads[hit.email.toLowerCase()];
    });
  } finally {
    lock.releaseLock();
  }
}

function collectLeads_(sheet, cols, cutoff, leads, extraFn) {
  if (!sheet) return;
  var last = sheet.getLastRow();
  if (last < 2) return;
  var width = Math.max(sheet.getLastColumn(), cols.bookedEvent);
  var values = sheet.getRange(1, 1, last, width).getValues();
  for (var i = values.length - 1; i >= 1; i--) {     // newest first; row 1 is the header
    var r = values[i];
    var email = String(r[cols.email - 1] || '').trim();
    if (!email || r[cols.bookedEvent - 1]) continue;
    var when = new Date(r[cols.submittedAt - 1]);
    if (isNaN(when) || when < cutoff) continue;
    var key = email.toLowerCase();
    var prior = leads[key];
    if (prior && prior.when >= when) continue;        // keep the newest lead for each email across both tabs
    leads[key] = { sheet: sheet, row: i + 1, bookedCol: cols.bookedEvent, when: when, email: email,
                   name: (String(r[cols.firstName - 1] || '') + ' ' + String(r[cols.lastName - 1] || '')).trim(),
                   submitted: r[cols.submittedAt - 1], extra: extraFn(r) };
  }
}

function esc_(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// One-time utility: add headers to Sheet1 and move spam rows to a "Spam (filtered)" tab.
function cleanupContactSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sh = ss.getSheetByName(SHEET_NAME);
  var headers = ['First Name','Last Name','Email','Website','Phone','Company','Industry','Message / Notes','Submitted At'];
  if (sh.getRange(1,1).getValue() !== 'First Name') {
    sh.insertRowBefore(1);
    sh.getRange(1,1,1,headers.length).setValues([headers]).setFontWeight('bold');
  }
  var spamDomains = ['jmailservice.com','circuitprompt.com','parallelaid.com','cloudarait.com','vas4hire.com'];
  var spamKw = ['keyword phrases','google analytics','virtual assistant','managed it support','appear first','banner appears','traffic is guaranteed','vas 4 hire','flowchat','cybersecurity & backup'];
  var spamSheet = ss.getSheetByName('Spam (filtered)');
  if (!spamSheet) { spamSheet = ss.insertSheet('Spam (filtered)'); spamSheet.appendRow(headers); spamSheet.getRange(1,1,1,headers.length).setFontWeight('bold'); }
  var data = sh.getDataRange().getValues();
  var moved = 0;
  for (var r = data.length - 1; r >= 1; r--) {
    var row = data[r];
    var email = String(row[2]||'').toLowerCase();
    var notes = String(row[7]||'').toLowerCase();
    var isSpam = false;
    spamDomains.forEach(function(d){ if (email.indexOf(d) > -1) isSpam = true; });
    spamKw.forEach(function(k){ if (notes.indexOf(k) > -1) isSpam = true; });
    if (email.split('@')[0].split('.').length > 3) isSpam = true;
    if (isSpam) { spamSheet.appendRow(row); sh.deleteRow(r + 1); moved++; }
  }
  return 'done moved=' + moved;
}
