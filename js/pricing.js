/* ============================================================
   Agility bookkeeping pricing: plans, price check, contact sizing
   Added 2026-10-06 (branch pricing-tiers, grants G-17 and G-18).
   Source of truth: Master\Firm_IP\Companion_Docs\Bookkeeping_Pricing_Model_v1.md
   EVERY price, band limit and band rule lives in AG_PRICING below.
   The HTML carries Band 1 annual prices only as a no-JavaScript fallback;
   tests/pricing-band.test.js fails if those fallbacks drift from this config.
   ============================================================ */
var AG_PRICING = {
  currency: 'USD',
  bands: {
    1: {
      maxTxn: 150, maxAccounts: 3,
      basic:    { annualMonthly: 325, monthly: 350 },
      advanced: { annualMonthly: 600, monthly: 650 }
    },
    2: {
      maxTxn: 300, maxAccounts: 6,
      basic:    { annualMonthly: 525, monthly: 550 },
      advanced: { annualMonthly: 800, monthly: 850 }
    }
  },
  /* Band rules, model Section 3 */
  rules: {
    txn:      { under150: 1, '150to300': 2, over300: 'custom', notsure: 1 },
    accounts: { '1to3': 1, '4to6': 2, '7plus': 'custom' },
    cashBumpAnswer: 'weekly' /* weekly or more moves the result up one band */
  },
  labels: {
    plan:     { basic: 'Basic', advanced: 'Advanced', notsure: 'Not sure' },
    billing:  { annual: 'Annual', monthly: 'Monthly' },
    txn:      { under150: '150 or fewer', '150to300': '151 to 300', over300: 'More than 300', notsure: 'Not sure' },
    accounts: { '1to3': '1 to 3', '4to6': '4 to 6', '7plus': '7 or more' },
    cash:     { rarely: 'Rarely or never', few: 'A few times a month', weekly: 'Weekly or more' },
    books:    { current: 'Current through last month', behind1to3: '1 to 3 months behind', behind3plus: 'More than 3 months behind, or never kept' }
  },
  contactPath: '/pages/contact.html',
  /* Review call scheduling policy (RO 2026-10-08, approval G-20). Text is built from these values. */
  reviewCalls: { noticeBusinessHours: 48, noticeBusinessDays: 2, replacementFee: 150, replacementMinutes: 30 }
};

(function (root) {
  'use strict';
  var C = AG_PRICING;
  var RANK = { 1: 1, 2: 2, custom: 3 };
  var FROM_RANK = { 1: 1, 2: 2, 3: 'custom' };

  /* ---------- derived figures (never typed by hand) ---------- */
  function price(band, plan, billing) {
    var p = C.bands[band][plan];
    return billing === 'monthly' ? p.monthly : p.annualMonthly;
  }
  function annualTotal(band, plan) { return C.bands[band][plan].annualMonthly * 12; }
  function annualSavings(band, plan) {
    var p = C.bands[band][plan];
    return (p.monthly - p.annualMonthly) * 12;
  }
  function maxSavings() {
    var m = 0;
    Object.keys(C.bands).forEach(function (b) {
      ['basic', 'advanced'].forEach(function (pl) { m = Math.max(m, annualSavings(b, pl)); });
    });
    return m;
  }
  function money(n) { return '$' + Number(n).toLocaleString('en-US'); }
  function reviewPolicy(kind) {
    var r = C.reviewCalls;
    if (kind === 'faq') {
      return 'Review calls hold time on your CPA\u2019s calendar that is set aside for you. To cancel or reschedule, give at least ' +
        r.noticeBusinessHours + ' business hours\u2019 notice (' + r.noticeBusinessDays + ' business days). A call cancelled, rescheduled or missed ' +
        'with less notice is forfeited. If you still want to meet that month, a replacement ' + r.replacementMinutes +
        '-minute call is billed at ' + money(r.replacementFee) + '.';
    }
    return 'Review calls require ' + r.noticeBusinessHours + ' business hours\u2019 notice (' + r.noticeBusinessDays +
      ' business days) to cancel or reschedule; a call changed with less notice, or missed, is forfeited, and a replacement call that month is billed at ' +
      money(r.replacementFee) + ' per ' + r.replacementMinutes + ' minutes.';
  }

  /* ---------- band logic (BAND RULES 1 to 5) ---------- */
  function bandFor(a) {
    a = a || {};
    var t = C.rules.txn[a.txn];
    var c = C.rules.accounts[a.accounts];
    var r = Math.max(RANK[t] || 1, RANK[c] || 1);              /* rules 1 to 3 */
    if (a.cash === C.rules.cashBumpAnswer) r = Math.min(r + 1, 3); /* rule 4 */
    return {
      band: FROM_RANK[r],
      notSure: a.txn === 'notsure',
      cashBumped: a.cash === C.rules.cashBumpAnswer && FROM_RANK[r] !== 'custom',
      catchUp: !!a.books && a.books !== 'current'               /* rule 5: note only, never price */
    };
  }

  var api = { config: C, bandFor: bandFor, price: price, annualTotal: annualTotal,
              annualSavings: annualSavings, maxSavings: maxSavings, money: money, reviewPolicy: reviewPolicy };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  root.agPricing = api;
  if (typeof document === 'undefined') return;

  /* ============================================================
     Browser behaviour
     ============================================================ */
  var doc = document;
  doc.documentElement.classList.add('ag-js');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var state = { billing: 'annual' };

  function contactUrl(params) {
    var q = Object.keys(params).filter(function (k) { return params[k] !== undefined && params[k] !== ''; })
      .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); }).join('&');
    return C.contactPath + (q ? '?' + q : '') + '#sizing';
  }

  function billNote(plan, billing, band) {
    band = band || 1;
    return billing === 'monthly' ? 'Month to month. Cancel anytime.'
      : money(annualTotal(band, plan)) + ' paid annually';
  }

  function volumeNote() {
    var b1 = C.bands[1], b2 = C.bands[2];
    return 'Starting price covers up to ' + b1.maxTxn + ' transactions a month across ' + b1.maxAccounts +
      ' bank or card accounts. Up to ' + b2.maxTxn + ' transactions and ' + b2.maxAccounts + ' accounts from ' +
      money(b2.basic.annualMonthly) + ' (Basic) or ' + money(b2.advanced.annualMonthly) +
      ' (Advanced). Catch-up work quoted separately.';
  }

  function swapText(el, text) {
    if (!el || el.textContent === text) return;
    if (reduceMotion) { el.textContent = text; return; }
    el.classList.add('ag-pricing-out');
    setTimeout(function () {
      el.textContent = text;
      el.classList.remove('ag-pricing-out');
    }, 150);
  }

  /* ---------- fill every config-driven text on the page ---------- */
  function fillStatic() {
    doc.querySelectorAll('[data-ag-text]').forEach(function (el) {
      var k = el.getAttribute('data-ag-text'), v = null, m;
      if (k === 'maxSavings') v = 'Save up to ' + money(maxSavings()) + ' a year';
      else if (k === 'maxSavingsAmt') v = money(maxSavings());
      else if (k === 'reviewFaq') v = reviewPolicy('faq');
      else if (k === 'reviewFine') v = reviewPolicy('fine');
      else if (k === 'volume') v = volumeNote();
      else if ((m = /^cell:(\d):(basic|advanced)$/.exec(k))) {
        v = money(price(m[1], m[2], 'annual')) + '/mo annual (' + money(annualTotal(m[1], m[2])) +
            '/yr) or ' + money(price(m[1], m[2], 'monthly')) + ' month to month';
      } else if ((m = /^limit:(\d)$/.exec(k))) {
        var b = C.bands[m[1]];
        v = (m[1] === '1' ? 'Up to ' : (C.bands[1].maxTxn + 1) + ' to ') + b.maxTxn +
            ' transactions a month, up to ' + b.maxAccounts + ' accounts';
      }
      if (v !== null) el.textContent = v;
    });
  }

  /* ---------- plan tiles follow the billing state ---------- */
  function renderTiles() {
    var b = state.billing;
    doc.querySelectorAll('[data-ag-price]').forEach(function (el) {
      swapText(el, money(price(1, el.getAttribute('data-ag-price'), b)));
    });
    doc.querySelectorAll('[data-ag-billnote]').forEach(function (el) {
      el.textContent = billNote(el.getAttribute('data-ag-billnote'), b);
    });
    doc.querySelectorAll('[data-ag-switch]').forEach(function (el) {
      el.hidden = b !== 'monthly';
      el.textContent = 'Switch to annual and save ' + money(annualSavings(1, el.getAttribute('data-ag-switch'))) + ' a year';
    });
    doc.querySelectorAll('[data-ag-bigsave]').forEach(function (el) { el.hidden = b !== 'annual'; });
    doc.querySelectorAll('[data-ag-plan]').forEach(function (el) {
      el.setAttribute('href', contactUrl({ plan: el.getAttribute('data-ag-plan'), billing: b }));
    });
    doc.querySelectorAll('.ag-pricing-toggle').forEach(function (tg) { syncToggle(tg); });
  }

  function syncToggle(tg) {
    tg.setAttribute('data-billing', state.billing);
    tg.querySelectorAll('[role="radio"]').forEach(function (r) {
      var on = r.getAttribute('data-billing') === state.billing;
      r.setAttribute('aria-checked', on ? 'true' : 'false');
      r.tabIndex = on ? 0 : -1;
    });
  }

  function setBilling(b, focusIn) {
    if (b !== 'annual' && b !== 'monthly') return;
    state.billing = b;
    renderTiles();
    if (dialogState.open && dialogState.step === STEPS.length) renderResult();
    if (focusIn) {
      var r = focusIn.querySelector('[data-billing="' + b + '"]');
      if (r) r.focus();
    }
  }

  function wireToggle(tg) {
    tg.addEventListener('click', function (e) {
      var r = e.target.closest('[role="radio"]');
      if (r) setBilling(r.getAttribute('data-billing'), tg);
    });
    tg.addEventListener('keydown', function (e) {
      var keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
      if (keys.indexOf(e.key) < 0) return;
      e.preventDefault();
      var next = (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'Home') ? 'annual' : 'monthly';
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = state.billing === 'annual' ? 'monthly' : 'annual';
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = state.billing === 'monthly' ? 'annual' : 'monthly';
      setBilling(next, tg);
    });
    syncToggle(tg);
  }

  /* ============================================================
     Check my price: modal dialog
     ============================================================ */
  var STEPS = [
    { key: 'txn', q: 'In a typical month, about how many transactions show up across all your business bank and card statements?',
      help: 'Count the lines on last month\u2019s statements. Deposits, payments, card swipes and transfers all count.',
      opts: ['under150', '150to300', 'over300', 'notsure'] },
    { key: 'accounts', q: 'How many business bank and credit card accounts do you use?',
      opts: ['1to3', '4to6', '7plus'] },
    { key: 'cash', q: 'How often does the business pay or get paid in cash?',
      opts: ['rarely', 'few', 'weekly'] },
    { key: 'books', q: 'Where are your books today?',
      opts: ['current', 'behind1to3', 'behind3plus'] }
  ];
  var dialogState = { open: false, step: 0, answers: {}, trigger: null };
  var dlg = null;

  function el(tag, cls, text) {
    var e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function buildDialog() {
    if (dlg) return dlg;
    dlg = el('dialog', 'ag-pricecheck');
    dlg.setAttribute('aria-labelledby', 'ag-pricecheck-title');
    dlg.innerHTML =
      '<div class="ag-pricecheck-head">' +
        '<p class="ag-pricecheck-eyebrow" id="ag-pricecheck-title">Check my price</p>' +
        '<button type="button" class="ag-pricecheck-close" aria-label="Close">&times;</button>' +
      '</div>' +
      '<ol class="ag-pricecheck-dots" aria-hidden="true"></ol>' +
      '<div class="ag-pricecheck-body" aria-live="polite"></div>' +
      '<div class="ag-pricecheck-foot"><button type="button" class="ag-pricecheck-back">Back</button></div>';
    doc.body.appendChild(dlg);
    dlg.querySelector('.ag-pricecheck-close').addEventListener('click', closeDialog);
    dlg.querySelector('.ag-pricecheck-back').addEventListener('click', function () {
      if (dialogState.step > 0) { dialogState.step--; renderStep(); }
    });
    dlg.addEventListener('close', onClosed);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closeDialog(); }); /* backdrop */
    return dlg;
  }

  function openDialog(trigger) {
    buildDialog();
    dialogState = { open: true, step: 0, answers: {}, trigger: trigger };
    renderStep();
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    doc.documentElement.classList.add('ag-pricecheck-lock');
  }
  function closeDialog() {
    if (!dlg) return;
    if (typeof dlg.close === 'function' && dlg.open) dlg.close(); else { dlg.removeAttribute('open'); onClosed(); }
  }
  function onClosed() {
    dialogState.open = false;
    doc.documentElement.classList.remove('ag-pricecheck-lock');
    if (dialogState.trigger) dialogState.trigger.focus();
  }

  function renderDots() {
    var ol = dlg.querySelector('.ag-pricecheck-dots');
    ol.innerHTML = '';
    for (var i = 0; i <= STEPS.length; i++) {
      var li = el('li', i < dialogState.step ? 'is-done' : (i === dialogState.step ? 'is-current' : ''));
      ol.appendChild(li);
    }
  }

  function renderStep() {
    renderDots();
    var body = dlg.querySelector('.ag-pricecheck-body');
    var back = dlg.querySelector('.ag-pricecheck-back');
    back.hidden = dialogState.step === 0;
    if (dialogState.step >= STEPS.length) { renderResult(); return; }
    var s = STEPS[dialogState.step];
    body.innerHTML = '';
    body.appendChild(el('p', 'ag-pricecheck-count', 'Question ' + (dialogState.step + 1) + ' of ' + STEPS.length));
    var h = el('h2', 'ag-pricecheck-q', s.q); h.id = 'ag-pc-q'; h.tabIndex = -1;
    body.appendChild(h);
    if (s.help) body.appendChild(el('p', 'ag-pricecheck-help', s.help));
    var list = el('div', 'ag-pricecheck-options');
    list.setAttribute('role', 'group'); list.setAttribute('aria-labelledby', 'ag-pc-q');
    s.opts.forEach(function (o) {
      var b = el('button', 'ag-pricecheck-option', C.labels[s.key][o]);
      b.type = 'button';
      if (dialogState.answers[s.key] === o) b.classList.add('is-selected');
      b.setAttribute('aria-pressed', dialogState.answers[s.key] === o ? 'true' : 'false');
      b.addEventListener('click', function () {
        dialogState.answers[s.key] = o;
        b.classList.add('is-selected');
        setTimeout(function () { dialogState.step++; renderStep(); }, reduceMotion ? 0 : 160);
      });
      list.appendChild(b);
    });
    body.appendChild(list);
    h.focus();
  }

  function resultParams(res, plan) {
    var a = dialogState.answers;
    return { plan: plan, billing: state.billing, band: res.band, txn: a.txn, accounts: a.accounts,
             cash: a.cash, books: a.books, notsure: res.notSure ? '1' : '0' };
  }

  function renderResult() {
    renderDots();
    var res = bandFor(dialogState.answers);
    var body = dlg.querySelector('.ag-pricecheck-body');
    body.innerHTML = '';
    var h;
    if (res.band === 'custom') {
      h = el('h2', 'ag-pricecheck-q', 'Your business needs a custom plan.');
      h.tabIndex = -1; body.appendChild(h);
      body.appendChild(el('p', 'ag-pricecheck-help', 'Your volume is above our standard plans. Tell us a little more and we\u2019ll send a price built for your business.'));
      var a = el('a', 'ag-pricing-btn ag-pricing-btn--primary ag-pricecheck-cta', 'Get my custom price');
      a.href = contactUrl(resultParams(res, 'notsure'));
      body.appendChild(a);
    } else {
      h = el('h2', 'ag-pricecheck-q', 'Your price');
      h.tabIndex = -1; body.appendChild(h);
      var tg = el('div', 'ag-pricing-toggle ag-pricing-toggle--mini');
      tg.setAttribute('role', 'radiogroup'); tg.setAttribute('aria-label', 'Billing');
      tg.innerHTML = '<span class="ag-pricing-thumb" aria-hidden="true"></span>' +
        '<button type="button" role="radio" data-billing="annual">Annual</button>' +
        '<button type="button" role="radio" data-billing="monthly">Monthly</button>';
      body.appendChild(tg); wireToggle(tg);
      var grid = el('div', 'ag-pricecheck-plans');
      ['basic', 'advanced'].forEach(function (plan) {
        var card = el('div', 'ag-pricecheck-plan' + (plan === 'advanced' ? ' is-best' : ''));
        if (plan === 'advanced') card.appendChild(el('span', 'ag-pricecheck-best', 'Best value'));
        card.appendChild(el('p', 'ag-pricecheck-planname', C.labels.plan[plan]));
        var amt = el('p', 'ag-pricecheck-amount');
        amt.appendChild(el('span', 'ag-pricecheck-num', money(price(res.band, plan, state.billing))));
        amt.appendChild(el('span', 'ag-pricecheck-per', '/month'));
        card.appendChild(amt);
        card.appendChild(el('p', 'ag-pricecheck-note', billNote(plan, state.billing, res.band)));
        var btn = el('a', 'ag-pricing-btn ' + (plan === 'advanced' ? 'ag-pricing-btn--amber' : 'ag-pricing-btn--primary'),
          'Talk to us about ' + C.labels.plan[plan]);
        btn.href = contactUrl(resultParams(res, plan));
        card.appendChild(btn);
        grid.appendChild(card);
      });
      body.appendChild(grid);
      var notes = el('ul', 'ag-pricecheck-notes');
      if (res.notSure) notes.appendChild(el('li', '', 'Starting price. We confirm it from one month of your statements before you commit.'));
      if (res.cashBumped) notes.appendChild(el('li', '', 'Cash payments each count as a transaction and need a receipt or note, so we\u2019ve priced you one level up.'));
      if (res.catchUp) notes.appendChild(el('li', '', 'Months that are behind are caught up first and quoted separately.'));
      if (notes.children.length) body.appendChild(notes);
    }
    if (!body.contains(doc.activeElement)) h.focus();
  }

  /* ============================================================
     Contact page: sizing fieldset
     ============================================================ */
  var SZ = {
    plan: 'sz_plan', billing: 'sz_billing', txn: 'sz_txn', accounts: 'sz_accounts', cash: 'sz_cash',
    cashShare: 'sz_cash_share', books: 'sz_books', business: 'sz_business', revenue: 'sz_revenue',
    type: 'sz_type', payroll: 'sz_payroll'
  };
  function field(form, name) { return form.querySelector('[name="' + name + '"]'); }
  function val(form, name) { var f = field(form, name); return f ? String(f.value || '').trim() : ''; }
  function optText(form, name) {
    var f = field(form, name);
    if (!f || !f.value) return '';
    if (f.tagName === 'SELECT') return f.options[f.selectedIndex].text;
    return f.value.trim();
  }

  function initSizing() {
    var form = doc.getElementById('contact-form');
    var box = doc.getElementById('sizing');
    if (!form || !box) return;
    var q = new URLSearchParams(window.location.search);
    var map = { plan: SZ.plan, billing: SZ.billing, txn: SZ.txn, accounts: SZ.accounts, cash: SZ.cash, books: SZ.books };
    var any = false;
    Object.keys(map).forEach(function (k) {
      var v = q.get(k), f = field(form, map[k]);
      if (v && f && f.querySelector && f.querySelector('option[value="' + v + '"]')) { f.value = v; any = true; }
      else if (v && f && f.type === 'hidden' && (v === 'annual' || v === 'monthly')) { f.value = v; }
    });
    if (any) box.open = true;
    var cash = field(form, SZ.cash), share = doc.getElementById('sz-cash-share-wrap');
    function syncCash() { if (share) share.hidden = !(cash && cash.value === 'weekly'); }
    if (cash) { cash.addEventListener('change', syncCash); syncCash(); }
  }

  /* Called by main.js on submit. Returns null when no sizing answer was given. */
  function sizingPayload() {
    var form = doc.getElementById('contact-form');
    if (!form || !doc.getElementById('sizing')) return null;
    var a = { txn: val(form, SZ.txn), accounts: val(form, SZ.accounts), cash: val(form, SZ.cash), books: val(form, SZ.books) };
    var plan = val(form, SZ.plan), billing = val(form, SZ.billing) || 'annual';
    var flags = [].slice.call(form.querySelectorAll('input[name="sz_flags"]:checked')).map(function (c) { return c.value; });
    var filled = [a.txn, a.accounts, a.cash, a.books, plan, val(form, SZ.business), val(form, SZ.revenue),
                  val(form, SZ.type), val(form, SZ.payroll)].some(Boolean) || flags.length;
    if (!filled) return null;
    var res = (a.txn || a.accounts) ? bandFor(a) : null;
    var band = res ? res.band : '';
    var planLabel = C.labels.plan[plan] || 'Not given';
    var billLabel = C.labels.billing[billing];
    var quoted = 'Not enough answers to price';
    if (band === 'custom') quoted = 'Custom';
    else if (band) {
      var one = function (pl) {
        return C.labels.plan[pl] + ' ' + money(price(band, pl, billing)) + '/mo' +
          (billing === 'annual' ? ' (' + money(annualTotal(band, pl)) + '/yr)' : ' month to month');
      };
      quoted = (plan === 'basic' || plan === 'advanced') ? one(plan) : one('basic') + '; ' + one('advanced');
    }
    var tag = band === 'custom' ? '[Pricing: Custom]'
      : band ? '[Pricing: Band ' + band + ' | ' + planLabel + ' | ' + billLabel + ']' : '[Pricing: Unsized]';
    var cashTxt = optText(form, SZ.cash) || 'Not given';
    if (a.cash === 'weekly' && val(form, SZ.cashShare)) cashTxt += ' (' + optText(form, SZ.cashShare) + ')';
    var lines = [
      '--- SIZING ---',
      'Band: ' + (band === 'custom' ? 'Custom' : (band || 'Not sized')) + ' | Plan: ' + planLabel + ' | Billing: ' + billLabel + ' | Quoted: ' + quoted,
      'Transactions: ' + (optText(form, SZ.txn) || 'Not given') + ' (not sure: ' + (a.txn === 'notsure' ? 'yes' : 'no') + ') | Accounts: ' +
        (optText(form, SZ.accounts) || 'Not given') + ' | Cash: ' + cashTxt,
      'Books: ' + (optText(form, SZ.books) || 'Not given') + ' | Business: ' + (val(form, SZ.business) || 'Not given') +
        ' | Revenue: ' + (optText(form, SZ.revenue) || 'Not given') + ' | Type: ' + (optText(form, SZ.type) || 'Not given') +
        ' | Payroll: ' + (optText(form, SZ.payroll) || 'Not given'),
      'Flags: ' + (flags.length ? flags.join('; ') : 'None')
    ];
    return { tag: tag, block: lines.join('\n'), band: String(band), plan: plan, billing: billing };
  }
  root.agilitySizing = sizingPayload;

  /* ---------- benchmark bars grow on scroll ---------- */
  function initBars() {
    var vis = doc.querySelectorAll('.ag-pricing-bench');
    if (!vis.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      vis.forEach(function (v) { v.classList.add('is-visible'); }); return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.3 });
    vis.forEach(function (v) { io.observe(v); });
  }

  function init() {
    fillStatic();
    doc.querySelectorAll('.ag-pricing-toggle').forEach(wireToggle);
    renderTiles();
    doc.querySelectorAll('[data-ag-switch]').forEach(function (b) {
      b.addEventListener('click', function () { setBilling('annual'); });
    });
    doc.querySelectorAll('.ag-pricecheck-open').forEach(function (t) {
      t.addEventListener('click', function (e) { e.preventDefault(); openDialog(t); });
    });
    initSizing();
    initBars();
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
