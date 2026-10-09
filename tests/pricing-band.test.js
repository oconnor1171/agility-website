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
/* ---------- Batch 17: Insight (RO 2026-10-08 21:38, G-22) ---------- */
function chk(ok, label) { n++; if (!ok) fails++; rows.push((ok ? 'PASS' : 'FAIL') + '  ' + label); }
var ROOT = path.join(__dirname, '..');
function read(f) { var p2 = path.join(ROOT, f); return fs.existsSync(p2) ? fs.readFileSync(p2, 'utf8') : ''; }
var IN = P.config.insight;
chk(IN && IN.monthly === 495 && IN.quarterly === 1250, 'insight config values $495 a month, $1,250 a quarter');
function num(s) { return Number(String(s).replace(/[$,]/g, '')); }
/* every no-JavaScript fallback for an Insight price equals AG_PRICING.insight */
var ph = read('pages/pricing.html'), ih = read('index.html'), fh = read('pages/financial-analysis.html');
var mNum = /data-ag-insight-num>([^<]*)</.exec(ph);
chk(!!mNum && num(mNum[1]) === IN.monthly, 'insight fallback price in pricing.html equals config monthly');
[['insightAlt', 'alt', ph, 'pricing.html'], ['insightPointer', 'pointer', ih, 'index.html'], ['insightCost', 'cost', fh, 'financial-analysis.html']].forEach(function (k) {
  var m4 = new RegExp('data-ag-text="' + k[0] + '">([^<]*)<').exec(k[2]);
  chk(!!m4 && m4[1] === P.insightText(k[1]), 'insight fallback ' + k[0] + ' in ' + k[3] + ' equals config text');
});
/* JSON-LD Insight offers equal config and parse */
var ld = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(ph), offers = [];
try { JSON.parse(ld[1])['@graph'].forEach(function (g) { if (/#insight$/.test(g['@id'] || '')) offers = g.offers; }); } catch (e) { offers = null; }
chk(!!offers && offers.length === 2 &&
    offers.some(function (o) { return o.price === IN.monthly && o.priceSpecification.price === IN.monthly && o.priceSpecification.billingDuration === 'P1M'; }) &&
    offers.some(function (o) { return o.price === IN.quarterly && o.priceSpecification.price === IN.quarterly && o.priceSpecification.billingDuration === 'P3M'; }),
    'pricing.html JSON-LD parses; Insight offers 495 P1M and 1250 P3M');
/* hard-coded Insight figures anywhere else must match config */
var cw = read('js/chat-widget.js'), lt = read('llms.txt');
var cwFall = /: '(If you or your bookkeeper keep the books, Insight[^']*)'/.exec(cw);
chk(!!cwFall && cwFall[1] === P.insightText('chat'), 'chat widget Insight fallback equals config text');
chk(lt.indexOf(P.money(IN.monthly) + ' a month or ' + P.money(IN.quarterly) + ' a quarter') >= 0, 'llms.txt Insight prices equal config');
/* banned on any served page or script: unpublished platforms and the export add-on */
function walk(d, out) {
  fs.readdirSync(path.join(ROOT, d)).forEach(function (f) {
    var rel = d ? d + '/' + f : f, st = fs.statSync(path.join(ROOT, rel));
    if (st.isDirectory()) walk(rel, out); else if (/\.(html|js|css|txt|xml)$/.test(f)) out.push(rel);
  });
  return out;
}
var served = ['index.html', 'robots.txt', 'sitemap.xml', 'llms.txt', '404.html', 'api/index.js'];
['pages', 'js', 'css'].forEach(function (d) { walk(d, served); });
var BANNED = [/\bWave\b/, /\bZoho\b/, /\bSage\b/, /QuickBooks Desktop/, /\$75\b/, /\$150 a quarter/];
var hits = [];
served.forEach(function (f) { var t = read(f); BANNED.forEach(function (re) { if (re.test(t)) hits.push(f + ' ' + re); }); });
chk(hits.length === 0, 'no Wave, Zoho, Sage, QuickBooks Desktop, $75 or "$150 a quarter" in ' + served.length + ' served files' + (hits.length ? ': ' + hits.join(', ') : ''));
/* offer tags for the contact page */
var ot = P.config.offerTags;
chk(ot['insight-monthly'] === '[Offer: Insight Monthly]' && ot['insight-quarterly'] === '[Offer: Insight Quarterly]' &&
    ot['insight-other'] === '[Offer: Insight, other software]', 'contact offer tags for insight-monthly, insight-quarterly, insight-other');

/* ---------- Batch 18: Profit Leak Assessment and Advisory Partner (RO 2026-10-07) ---------- */
var OF = P.config.offers;
chk(OF && OF.assessment.price === 999 && OF.assessment.turnaroundDays === 10 && OF.assessment.maxMonths === 12 && OF.advisoryPartner.startingMonthly === 2500,
    'offers config: assessment 999 / 10 days / 12 months; Advisory Partner from 2500');
[['index.html', ih], ['pages/pricing.html', ph]].forEach(function (pg) {
  ['assessPrice', 'apPrice', 'assessTurn', 'assessVol', 'apTerm'].forEach(function (k) {
    var m5 = new RegExp('data-ag-text="' + k + '">([^<]*)<').exec(pg[1]);
    chk(!!m5 && m5[1] === P.offerText(k), 'offer fallback ' + k + ' in ' + pg[0] + ' equals config');
  });
  var ld2 = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(pg[1]), a2 = null, ap2 = null;
  try { JSON.parse(ld2[1])['@graph'].forEach(function (g) { if (/#assessment$/.test(g['@id'] || '')) a2 = g.offers[0]; if (/#advisory-partner$/.test(g['@id'] || '')) ap2 = g.offers[0]; }); } catch (e) { a2 = ap2 = null; }
  chk(!!a2 && a2.price === OF.assessment.price && a2.priceCurrency === 'USD', 'JSON-LD assessment offer ' + OF.assessment.price + ' USD in ' + pg[0]);
  chk(!!ap2 && !('price' in ap2) && ap2.priceSpecification.minPrice === OF.advisoryPartner.startingMonthly && !('maxPrice' in ap2.priceSpecification) &&
      ap2.priceSpecification.billingDuration === 'P1M', 'JSON-LD Advisory Partner minPrice only, P1M, in ' + pg[0]);
});
var apLine = /data-ag-text="apLine">([^<]*)</.exec(ih);
chk(!!apLine && apLine[1] === P.offerText('apLine'), 'homepage Fractional CFO price line equals config');
var faC = /data-ag-text="faCost">([^<]*)</.exec(fh);
chk(!!faC && faC[1] === P.offerText('faCost'), 'financial-analysis cost answer equals config');
var cwOff = /: '(The Profit Leak Assessment is[^']*)'/.exec(cw);
chk(!!cwOff && cwOff[1] === P.offerText('chat'), 'chat widget offer fallback equals config text');
var sv = read('pages/services.html');
chk(sv.indexOf('Advisory Partner, starting at ' + P.money(OF.advisoryPartner.startingMonthly) + ' a month') >= 0, 'services.html Advisory Partner line equals config');
chk(lt.indexOf(P.money(OF.assessment.price) + ' one time') >= 0 && lt.indexOf('starting at ' + P.money(OF.advisoryPartner.startingMonthly) + ' a month') >= 0, 'llms.txt offer prices equal config');
/* retired value-sheet tiers and prices, and no Advisory Partner range or hourly language */
var RETIRED = [/\bFoundation\b/, /\$1,500\b/, /\$1,800\b/, /\$3,000\b/, /\$4,000\b/, /Operational Diagnostic/];
var hits2 = [];
served.forEach(function (f) { var t = read(f); RETIRED.forEach(function (re) { if (re.test(t)) hits2.push(f + ' ' + re); }); });
chk(hits2.length === 0, 'no Foundation tier, $1,500, $1,800, $3,000, $4,000 or Operational Diagnostic in served files' + (hits2.length ? ': ' + hits2.join(', ') : ''));
var apRange = [];
served.forEach(function (f) { var t = read(f); if (/\$2,500\s*(to|-|and)\s*\$/.test(t) || /Advisory Partner[^.<]{0,80}per hour/i.test(t)) apRange.push(f); });
chk(apRange.length === 0, 'Advisory Partner never shown as a range or per hour' + (apRange.length ? ': ' + apRange.join(', ') : ''));
chk(served.every(function (f) { return !/credit(ed)? toward/i.test(read(f)); }), 'no credit of the assessment toward a plan published');
chk(OF.advisoryPartner.minTermMonths === 12, 'Advisory Partner minimum term 12 months (RO 2026-10-08 22:34)');
chk(lt.indexOf('12-month minimum term') >= 0, 'llms.txt states the Advisory Partner minimum term');
chk(served.every(function (f) { return read(f).indexOf('Many owners start with the assessment') < 0; }), 'FAQ line "Many owners start" replaced (RO 2026-10-08 22:34)');
chk(ot.assessment === '[Offer: Profit Leak Assessment]' && ot.advisory === '[Offer: Advisory Partner]', 'contact offer tags for assessment and advisory');

console.log(rows.join('\n'));
console.log('\n' + (n - fails) + ' of ' + n + ' checks passed' + (fails ? ', ' + fails + ' FAILED' : ''));
process.exit(fails ? 1 : 0);
