/* Band logic test: every Q1 x Q2 x Q3 combination (4 x 3 x 3 = 36), asserted against
   BAND RULES written out independently here (not by calling the code under test).
   Also checks the no-JavaScript fallback prices in the HTML still match AG_PRICING.
   Run: node tests/pricing-band.test.js   (exit 1 on any failure) */
var path = require('path'), fs = require('fs');
var P = require(path.join(__dirname, '..', 'js', 'pricing.js'));
var Q1 = ['under150', '150to300', 'over300', 'notsure'];
var Q2 = ['1to3', '4to6', '7plus'];
var Q3 = ['rarely', 'few', 'weekly'];
function expected(t, a, c) {
  var tb = { under150: 1, '150to300': 2, over300: 3, notsure: 1 }[t];
  var ab = { '1to3': 1, '4to6': 2, '7plus': 3 }[a];
  var r = Math.max(tb, ab);
  if (c === 'weekly') r = Math.min(r + 1, 3);
  return r === 3 ? 'custom' : r;
}
var fails = 0, n = 0, rows = [];
Q1.forEach(function (t) { Q2.forEach(function (a) { Q3.forEach(function (c) {
  n++;
  var got = P.bandFor({ txn: t, accounts: a, cash: c, books: 'current' });
  var exp = expected(t, a, c);
  var ok = got.band === exp && got.notSure === (t === 'notsure') &&
           got.cashBumped === (c === 'weekly' && exp !== 'custom') && got.catchUp === false;
  if (!ok) fails++;
  rows.push((ok ? 'PASS' : 'FAIL') + '  ' + [t, a, c].join(' / ').padEnd(30) + ' -> band ' + String(got.band).padEnd(6) +
    (got.notSure ? ' notSure' : '') + (got.cashBumped ? ' cashBumped' : '') + (ok ? '' : '   expected ' + exp));
}); }); });
/* rule 5: books status never changes the price */
['current', 'behind1to3', 'behind3plus'].forEach(function (b) {
  n++;
  var g = P.bandFor({ txn: '150to300', accounts: '1to3', cash: 'rarely', books: b });
  var ok = g.band === 2 && g.catchUp === (b !== 'current');
  if (!ok) fails++;
  rows.push((ok ? 'PASS' : 'FAIL') + '  books ' + b.padEnd(24) + ' -> band ' + g.band + (g.catchUp ? ' catchUp' : ''));
});
/* price arithmetic against the confirmed model */
var model = { '1basic': [325, 350, 3900, 300], '1advanced': [600, 650, 7200, 600],
              '2basic': [525, 550, 6300, 300], '2advanced': [800, 850, 9600, 600] };
Object.keys(model).forEach(function (k) {
  n++;
  var b = k[0], pl = k.slice(1), m = model[k];
  var got = [P.price(b, pl, 'annual'), P.price(b, pl, 'monthly'), P.annualTotal(b, pl), P.annualSavings(b, pl)];
  var ok = got.join() === m.join();
  if (!ok) fails++;
  rows.push((ok ? 'PASS' : 'FAIL') + '  prices band ' + b + ' ' + pl.padEnd(9) + ' ' + got.join(' / '));
});
n++; var ms = P.maxSavings() === 600; if (!ms) fails++;
rows.push((ms ? 'PASS' : 'FAIL') + '  max annual savings $' + P.maxSavings());
/* no-JS fallbacks in HTML must equal config Band 1 annual */
['index.html', 'pages/pricing.html'].forEach(function (f) {
  var file = path.join(__dirname, '..', f);
  if (!fs.existsSync(file)) return;
  var html = fs.readFileSync(file, 'utf8'), re = /data-ag-price="(basic|advanced)"[^>]*>\$([\d,]+)</g, m2;
  while ((m2 = re.exec(html))) {
    n++;
    var ok2 = Number(m2[2].replace(/,/g, '')) === P.price(1, m2[1], 'annual');
    if (!ok2) fails++;
    rows.push((ok2 ? 'PASS' : 'FAIL') + '  fallback ' + f + ' ' + m2[1] + ' $' + m2[2]);
  }
});
/* review-call policy fallbacks in HTML must equal the text built from config.reviewCalls */
['index.html', 'pages/pricing.html'].forEach(function (f) {
  var file = path.join(__dirname, '..', f);
  if (!fs.existsSync(file)) return;
  var html = fs.readFileSync(file, 'utf8');
  [['reviewFaq', 'faq'], ['reviewFine', 'fine']].forEach(function (k) {
    n++;
    var m3 = new RegExp('data-ag-text="' + k[0] + '">([^<]*)<').exec(html);
    var ok3 = !!m3 && m3[1] === P.reviewPolicy(k[1]);
    if (!ok3) fails++;
    rows.push((ok3 ? 'PASS' : 'FAIL') + '  review policy ' + k[0] + ' in ' + f);
  });
});
var rc = P.config.reviewCalls;
n++; var okrc = rc.noticeBusinessHours === 48 && rc.replacementFee === 150 && rc.replacementMinutes === 30;
if (!okrc) fails++;
rows.push((okrc ? 'PASS' : 'FAIL') + '  review policy values 48 business hours, $150 per 30 minutes');
console.log(rows.join('\n'));
console.log('\n' + (n - fails) + ' of ' + n + ' checks passed' + (fails ? ', ' + fails + ' FAILED' : ''));
process.exit(fails ? 1 : 0);
