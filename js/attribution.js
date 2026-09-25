/* Lead-source attribution, added 2026-09-25 (growth batch 05). No cookies, no third parties.
   Stores the first page of the visit, the referrer and any UTM tags in sessionStorage so lead forms
   can say where an inquiry came from. Cleared when the browser tab closes. */
(function () {
  var KEY = 'agility_attr';
  try {
    if (!sessionStorage.getItem(KEY)) {
      var q = new URLSearchParams(window.location.search);
      sessionStorage.setItem(KEY, JSON.stringify({
        landingPage: window.location.pathname,
        referrer: document.referrer || '(direct)',
        utmSource: q.get('utm_source') || '',
        utmMedium: q.get('utm_medium') || '',
        utmCampaign: q.get('utm_campaign') || ''
      }));
    }
  } catch (e) { /* storage blocked: forms still submit without attribution */ }
  window.agilityAttribution = function () {
    var a = {};
    try { a = JSON.parse(sessionStorage.getItem(KEY) || '{}'); } catch (e) { a = {}; }
    a.formPage = window.location.pathname;
    return a;
  };
})();
