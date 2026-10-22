/* French Atelier — self-service checkout engine + enrollment modal.
 *
 * Port of the proven Longevity / Julie masterclass checkout:
 *   step 1  Your details (name, email, phone E.164 for every country, US state)
 *   step 2  Your plan (offer review, exact amounts, consent)
 *   step 3  checkout.html — eTeacher order -> Airwallex Drop-In (card) or PayPal — no Apple Pay / Google Pay -> SetECommercePayment -> confirmation.
 *
 * HARD RULES
 *  - Never touches #lg-form / .advisor-form / .contact-form or js/eteacher-leads.js.
 *  - Never sends raw card data anywhere (Airwallex / PayPal handle PCI).
 *  - Never mounts a payment form unless the CRM amount equals the displayed offer.
 *  - Production without a CRM course id for the chosen product -> "reserve" mode:
 *    the enrollment is captured as a ProductID 25 lead via the proven leads relay
 *    (window.eTeacherLeads.submit) and nothing is charged.
 */
(function () {
  'use strict';
  if (window.FA_CHECKOUT) return;
  var CFG = window.FA_ECOMM_CONFIG;
  /* staging design mockups: ?ckt=paper|ivory|split (default = Neon dark). Carried across pages via sessionStorage. */
  var CKT = (function () {
    try {
      /* Presentation builds: the "-light" staging host defaults to the Paper & Gold theme; the main staging host stays Neon dark. ?ckt= still overrides on either. */
      var HOST_DEFAULT = (/^fa-staging-light/.test(location.hostname) || /capsules/i.test(location.pathname) || /[?&]product=capsule/.test(location.search)) ? 'paper' : 'midnight';
      var q = new URLSearchParams(location.search).get('ckt');
      if (q === 'neon' || q === 'dark') { sessionStorage.setItem('fa_ckt', 'neon'); }
      else if (/^(paper|ivory|split|midnight)$/.test(q || '')) sessionStorage.setItem('fa_ckt', q);
      var t = sessionStorage.getItem('fa_ckt') || HOST_DEFAULT; if (t === 'neon') t = '';
      if (t) {
        document.body.classList.add('fa-ckt-' + t);
        var base = /\/courses\//.test(location.pathname) ? '../' : '';
        var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = base + 'css/fa-checkout-light.css?v=20261008y'; var pop = document.querySelector('link[href*="fa-pop.css"]'); if (pop) pop.parentNode.insertBefore(l, pop); else document.head.appendChild(l);
        if (t === 'midnight') { var m = document.createElement('link'); m.rel = 'stylesheet'; m.href = base + 'css/fa-midnight.css?v=20261008y'; var ty = document.querySelector('link[href*="fa-type.css"]'); if (ty) ty.parentNode.insertBefore(m, ty); else document.head.appendChild(m); }
      }
      return t;
    } catch (e) { return ''; }
  })();
  window.FA_CKT = CKT;
  var GEO = window.FA_GEO;
  if (!CFG || !GEO) { console.warn('[fa-checkout] config or geo missing'); return; }

  var STORE_LEAD = 'fa_ck_lead_v1', STORE_IDS = 'fa_ck_ids_v1', STORE_EVT = 'fa_ck_evt_v1';
  var fmt = function (n) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\.00$/, ''); };
  var fmt2 = function (n) { n = Number(n); var whole = Math.abs(n - Math.round(n)) < 0.005; return '$' + n.toLocaleString('en-US', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }); };

  /* ---------- tracking: dataLayer always, fbq only with an FA pixel ---------- */
  function eventId(name) {
    try {
      var m = JSON.parse(sessionStorage.getItem(STORE_EVT) || '{}');
      if (!m[name]) { m[name] = 'fa_' + name.toLowerCase() + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); sessionStorage.setItem(STORE_EVT, JSON.stringify(m)); }
      return m[name];
    } catch (e) { return 'fa_' + name.toLowerCase() + '_' + Date.now().toString(36); }
  }
  /* Golden tracking (1:1 Julie format, FA naming): FA_META (js/fa-meta-tracking.js) owns
     AddToCart / InitiateCheckout / Purchase with ONE event_id shared by Pixel + CAPI
     (fa_atc_<orderid>, fa_ic_<orderid>, Purchase = CRM order id). Lead stays pixel-only (reserve path). */
  var lastProduct = '';
  window.FA_PLAN = { get: function () { var pl = window.FA_META && window.FA_META.plans; return pl && pl[lastProduct] ? pl[lastProduct] : { id: lastProduct }; } };
  window.FA_ECOMM = { getCheckoutIds: function () {
    try { var staged = loadLead();
      if (!staged || !staged.sel || (lastProduct && staged.sel.product !== lastProduct)) return null;
      var o = loadIds(staged.sel, staged.lead);
      if (!o) return null;
      return { stid: String(o.stid), orderid: String(o.orderid) }; } catch (e) { return null; } } };
  function track(name, params, opts) {
    params = params || {};
    if (params.content_ids && params.content_ids[0]) lastProduct = String(params.content_ids[0]);
    var id = (opts && opts.eventId) || eventId(name + (opts && opts.suffix ? '_' + opts.suffix : ''));
    try { window.dataLayer = window.dataLayer || []; window.dataLayer.push(Object.assign({ event: 'fa_' + name.toLowerCase(), event_id: id, env: CFG.env }, params)); } catch (e) {}
    var L = storedLead() || {};
    if (window.FA_META && (name === 'AddToCart' || name === 'InitiateCheckout' || name === 'Purchase')) {
      /* Invoke synchronously: Purchase must capture its identity before clearIds(). */
      try {
        var plan = window.FA_PLAN.get();
        var delivery = window.FA_META.track(name, { value: params.value, currency: params.currency || 'USD', content_name: plan.content_name || params.content_name, order_id: params.order_id }, L.email || '');
        if (delivery && typeof window.FA_META.waitFor === 'function') delivery = window.FA_META.waitFor(name, delivery, 1500);
        return Promise.resolve(delivery).catch(function () { return null; });
      } catch (e) { return Promise.resolve(null); }
    }
    try { if (window.FA_META && window.FA_META.mode() === 'live' && window.fbq) window.fbq('track', name, params, { eventID: id }); } catch (e) {}
    return id;
  }
  function storedLead() { var o = loadLead(); return o && o.lead ? o.lead : null; }
  /* Tracking must not strand checkout when a relay rejects or never answers. */
  function deliveryBeforePayment(delivery) {
    return new Promise(function (resolve) {
      var timer = setTimeout(function () { resolve(null); }, 1500);
      Promise.resolve(delivery).then(done, done);
      function done(result) { clearTimeout(timer); resolve(result); }
    });
  }

  /* FA_AC — 1:1 port of the Julie LLA_AC client (same payload fields, FA stage names):
     {email, fullName, phone, sessionDate, stage, env, productEvent, orderId, studentId, page, ts}
     Stages: FA_Abandoned_Cart_Name_Details (screen 1) -> FA_Abandoned_Cart_Course_Details (screen 2)
     -> FA_Abandoned_Cart_No_Payment (payment screen, with CRM order/student ids).
     Payment success writes NOTHING (CRM -> AC sync handles purchase exclusion), as in Julie. */
  window.FA_AC = (function () {
    var K = 'fa_ac_contact';
    function saveContact(f) {
      try { sessionStorage.setItem(K, JSON.stringify({ email: f.email || '', fullName: f.fullName || '', phone: f.phone || '', startDate: f.startDate || '' })); } catch (e) {}
    }
    function contact() { try { return JSON.parse(sessionStorage.getItem(K) || 'null'); } catch (e) { return null; } }
    var lastStage = '', delivery = Promise.resolve(), lastDelivery = null;
    function send(stage) {
      if (CFG.env !== 'production' || !CFG.acEventEndpoint) return;   /* staging/QA never writes production AC */
      var c = contact();
      if (!c || !c.email) return;
      var ids = stage === 'FA_Abandoned_Cart_No_Payment' ? (window.FA_ECOMM.getCheckoutIds() || {}) : {};
      var productEvent = lastProduct === 'fa-course-full' ? 'VIP' : lastProduct === 'fa-course' ? 'Regular' : /^capsule-/.test(lastProduct) ? 'Capsules' : '';
      if (!productEvent) return;
      var stageKey = [c.email, stage, productEvent, ids.orderid || '', c.startDate || ''].join('|');
      if (stageKey === lastStage) return;
      lastStage = stageKey;
      var payload = JSON.stringify({ email: c.email, fullName: c.fullName, phone: c.phone, sessionDate: c.startDate, stage: stage, env: CFG.env,
        productEvent: productEvent, orderId: ids.orderid || '', studentId: ids.stid || '', page: location.pathname, ts: new Date().toISOString() });
      delivery = delivery.then(function () {
        return fetch(CFG.acEventEndpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: payload, keepalive: true })
          .then(function (r) { return r.json().then(function (b) {
            lastDelivery = { stage: stage, productEvent: productEvent, accepted: r.ok && b.queued === true };
            if (!lastDelivery.accepted && lastStage === stageKey) lastStage = '';
            return lastDelivery; }); })
          .catch(function () { lastDelivery = { stage: stage, productEvent: productEvent, accepted: false }; if (lastStage === stageKey) lastStage = ''; return lastDelivery; });
      });
      return delivery;
    }
    return { saveContact: saveContact, send: send, settled: function () { return delivery; }, status: function () { return lastDelivery; } };
  })();
  function acStage(stage, lead) {
    try {
      lead = lead || storedLead(); if (!lead || !lead.email) return;
      window.FA_AC.saveContact({ email: lead.email, fullName: ((lead.firstName || '') + ' ' + (lead.lastName || '')).trim(), phone: lead.e164 || '', startDate: lead.startDate || '' });
      return window.FA_AC.send(stage);
    } catch (e) {}
  }
  /* Meta Pixel base code — gated exactly like Julie: browser pixel only in FA_META live mode. */
  if (CFG.metaPixelId && !window.fbq && (window.FA_META ? window.FA_META.mode() === 'live' : false)) {
    (function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', CFG.metaPixelId);
    window.fbq('track', 'PageView', {}, { eventID: window.FA_META.pageViewId() });
  }
  if (window.FA_META) window.FA_META.pageEvents();

  /* ---------- attribution (same storage as the lead forms, read-only) ---------- */
  var ATTR_KEYS = ['gclid', 'fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'cid', 'adGroupID'];
  function attribution() {
    var out = {};
    try { var o = JSON.parse(localStorage.getItem('fa_attribution_v1') || 'null'); if (o && o.ts && Date.now() - o.ts < 30 * 864e5) ATTR_KEYS.forEach(function (k) { if (o[k]) out[k] = o[k]; }); } catch (e) {}
    try { var p = new URLSearchParams(location.search); ATTR_KEYS.forEach(function (k) { if (p.get(k)) out[k] = p.get(k); }); } catch (e) {}
    return out;
  }
  var ipCountryPromise = null;
  function ipCountry() {
    if (ipCountryPromise) return ipCountryPromise;
    ipCountryPromise = fetch('https://ipapi.co/country/', { cache: 'force-cache' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (t) { t = (t || '').trim().toUpperCase(); return /^[A-Z]{2}$/.test(t) ? t : ''; }).catch(function () { return ''; });
    return ipCountryPromise;
  }

  /* ---------- relay transport (3 attempts, backoff on 5xx/network) ---------- */
  function post(url, body, attempt) {
    attempt = attempt || 1;
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timeout = controller ? setTimeout(function(){ controller.abort(); }, 20000) : null;
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(body), signal: controller ? controller.signal : undefined })
      .finally(function(){ if (timeout) clearTimeout(timeout); })
      .then(function (r) { return r.text().then(function (t) { var j = null; try { j = JSON.parse(t); } catch (e) {} return { ok: r.ok, status: r.status, body: j, raw: t }; }); })
      .then(function (res) {
        if (res.status >= 500 && res.status !== 503 && attempt < 3) return new Promise(function (ok) { setTimeout(function () { ok(post(url, body, attempt + 1)); }, 600 * Math.pow(2, attempt - 1)); });
        return res;
      })
      .catch(function (err) {
        if (err && err.name === 'AbortError') throw new Error('REQUEST_TIMEOUT: result unknown; do not submit a second payment.');
        if (attempt < 3) return new Promise(function (ok) { setTimeout(function () { ok(post(url, body, attempt + 1)); }, 600 * Math.pow(2, attempt - 1)); });
        return { ok: false, status: 0, body: null, error: String(err && err.message || err) };
      });
  }
  function relay(path) { return CFG.relayBase.replace(/\/$/, '') + (CFG.env === 'staging' ? '/staging' : '') + path; }

  /* ---------- product helpers ---------- */
  /* ---------- promo codes (top strip / step 2 field). Stored for 7 days from first use. ---------- */
  var STORE_PROMO = 'fa_promo_manual_v2';
  // Discard legacy auto-applied coupons. Only an explicit checkout Apply action
  // may activate a code; the current tab retains it through payment navigation.
  try { localStorage.removeItem('fa_promo_v1'); } catch (e) {}
  function promoLive(def) { return !!def && (def.until === undefined || (def.until > 0 && Date.now() < def.until)); }
  function promoGet() { try { var o = JSON.parse(sessionStorage.getItem(STORE_PROMO) || 'null'); if (!o || o.source !== 'manual' || !CFG.promos || !CFG.promos[o.code]) return null; if (!promoLive(CFG.promos[o.code])) { sessionStorage.removeItem(STORE_PROMO); return null; } if (o.exp && Date.now() > o.exp) { sessionStorage.removeItem(STORE_PROMO); return null; } return { code: o.code, exp: o.exp, def: CFG.promos[o.code] }; } catch (e) { return null; } }
  function promoApply(code, source) { if (source !== 'manual') return null; code = String(code || '').trim().toUpperCase().replace(/\s+/g, ''); var def = CFG.promos && CFG.promos[code]; if (!def || !promoLive(def)) return null; var cur = promoGet(); var exp = cur && cur.code === code ? cur.exp : Date.now() + (def.days || 7) * 864e5; try { sessionStorage.setItem(STORE_PROMO, JSON.stringify({ code: code, exp: exp, source: 'manual' })); } catch (e) {} return { code: code, exp: exp, def: def }; }
  function promoClear() { try { sessionStorage.removeItem(STORE_PROMO); } catch (e) {} window.dispatchEvent(new Event('fa:quotechange')); }
  function promoFor(id) { var pr = promoGet(); return pr && pr.def.applies.indexOf(id) > -1 ? pr : null; }
  function product(id) {
    var base = CFG.products[id] || null; if (!base) return null;
    var pr = promoFor(id); if (!pr) return base;
    // User-approved whole-dollar charges, not display-only rounding.
    var k = 1 - pr.def.pct / 100, m = Math.round(base.monthly * k), f = Math.round(base.firstPayment * k);
    var p = {}; for (var key in base) p[key] = base[key];
    p.monthly = m; p.firstPayment = f; p.total = Math.round((f + m * (base.numberOfPayments - 1)) * 100) / 100;
    p.baseMonthly = base.monthly; p.baseTotal = base.total; p.promo = { code: pr.code, pct: pr.def.pct, label: pr.def.label, exp: pr.exp };
    return p;
  }
  function productTitle(sel) {
    var p = product(sel.product); if (!p) return '';
    if (p.kind === 'course') { var lv = CFG.levels[sel.level]; return lv ? lv.name + ' · ' + lv.cefr + ' · 20 live lessons' : p.title; }
    if (p.kind === 'capsules') { var names = (sel.capsules || []).map(function (c) { return (CFG.capsules[c] || {}).name || c; }); return p.title + (names.length ? ' · ' + names.join(' + ') : ''); }
    if (p.kind === 'membership') { var lv2 = CFG.levels[sel.level]; return p.title + (lv2 ? ' · ' + lv2.name : ''); }
    return p.title;
  }
  function crmCourseFor(id, sel) {
    var p = product(id); if (!p) return null;
    if (p.kind === 'capsules') {
      /* One CRM order per checkout, on the first chosen capsule's course; the other capsules travel in DynamicParameters. */
      var first = sel && sel.capsules && sel.capsules[0], cc = first && CFG.capsules[first] && CFG.capsules[first].crm;
      if (!first && p.packs === 3) cc = CFG.capsules['fashion-art'].crm;
      /* 2026-10-20: the CRM prices the order from FirstPayment / NumberOfPayments / LeftToPay once the relay stops
         sending ProductID (staging proof: $99x3, $178x3, $189x3 all honoured on a single capsule course, orders 8054307-8054309).
         So every package binds to the first chosen capsule's course; the other capsules travel in DynamicParameters (facapsules=). */
      if (cc && cc.mainAbroadCourseId && cc.abroadCourseId) return cc;
      return null;
    }
    if (p.kind === 'course' && sel && sel.level && CFG.levels[sel.level] && CFG.levels[sel.level].crm) {
      var lc = CFG.levels[sel.level].crm;
      if (lc.mainAbroadCourseId && lc.abroadCourseId) return lc;
    }
    if (p.crmCourse && p.crmCourse.mainAbroadCourseId) return p.crmCourse;
    if (CFG.env === 'staging') return CFG.stagingPipePlaceholder;
    return null; /* production without an eTeacher course id -> reserve mode */
  }

  /* ---------- payload (eTeacher ecommerce DTO, as verified on the Longevity checkout) ---------- */
  function words(arr) { return arr.map(function (w) { return String(w).replace(/[^A-Za-z0-9_\-]/g, ''); }).filter(Boolean).join('%20'); }
  function buildEcommPayload(lead, sel, ipIso) {
    var p = product(sel.product), crs = crmCourseFor(sel.product, sel);
    var attr = attribution(), dyn = [];
    Object.keys(attr).forEach(function (k) { if (k !== 'cid' && k !== 'adGroupID') dyn.push(k + '=' + encodeURIComponent(attr[k])); });
    var qs = (location.search || '').replace(/^\?/, '');
    if (attr.cid && !/(^|&)cid=/.test(qs)) qs = (qs ? qs + '&' : '') + 'cid=' + attr.cid;
    var noteWords = ['SELF', 'SERVICE', 'ECOMM', 'CHECKOUT', 'French', 'Atelier', 'Product', sel.product, 'Buyer', 'country', lead.countryIso];
    if (lead.stateCode) noteWords = noteWords.concat(['US', 'State', lead.stateCode]);
    if (sel.level) noteWords = noteWords.concat(['Level', sel.level]);
    if (sel.capsules && sel.capsules.length) noteWords = noteWords.concat(['Capsules'].concat(sel.capsules));
    noteWords = noteWords.concat(['First', 'payment', String(p.firstPayment).replace('.', '_'), 'x', String(p.numberOfPayments), 'Total', String(p.total).replace('.', '_')]);
    if (lead.stateCode) dyn.push('stateisocodebyip=' + lead.stateCode);
    dyn.push('message=' + words(noteWords));
    dyn.push('faproduct=' + sel.product, 'faplan=' + p.numberOfPayments + 'pay', 'fafirstpayment=' + p.firstPayment, 'fatotal=' + p.total);
    if (sel.level) dyn.push('falevel=' + sel.level);
    if (sel.capsules && sel.capsules.length) dyn.push('facapsules=' + sel.capsules.join('_'));
    if (sel.classTime) dyn.push('faclasstime=' + encodeURIComponent(sel.classTime));

    var payload = {
      FirstName: lead.firstName, LastName: lead.lastName, Email: lead.email, MobilePhone: lead.e164,
      /* Verified on the Longevity checkout: the CRM prices the order from CountryIsoCode. The real buyer
         country travels in DynamicParameters (message=Buyer country XX) and in stateisocodebyip for US. */
      CountryIsoCode: 'US', CountryIsoCodeByIp: 'US',
      LandingPage: location.href, UserAgent: navigator.userAgent, ReferringSite: document.referrer || location.hostname,
      QueryString: qs.slice(0, 2000), ProductID: CFG.productId,
      MainAbroadCourseId: crs.mainAbroadCourseId, LanguageId: crs.languageId != null ? crs.languageId : 101, IsTrial: crs.isTrial != null ? crs.isTrial : 0,
      FirstPayment: p.firstPayment, NumberOfPayments: Math.max(0, p.numberOfPayments - 1) /* CRM: payments after the first */, LeftToPay: Math.round((p.total - p.firstPayment) * 100) / 100,
      DynamicParameters: dyn.join('&').slice(0, 4000)
    };
    if (crs.abroadCourseId) payload.AbroadCourseId = crs.abroadCourseId;
    if (crs.preferredCourseId) payload.PreferredCourseId = crs.preferredCourseId;
    if (crs.campusId) { payload.CampusId = crs.campusId; payload.CampusID = crs.campusId; }
    if (crs.semesterId) { payload.SemesterID = crs.semesterId; payload.ActivitySessionLevel1ID = crs.semesterId; }
    return payload;
  }

  /* ---------- class state ---------- */
  function saveLead(lead, sel) { try { sessionStorage.setItem(STORE_LEAD, JSON.stringify({ lead: lead, sel: sel, ts: Date.now(), env: CFG.env })); } catch (e) {} }
  function freshRecord(o) { var age = o && Date.now() - o.ts; return !!o && typeof o.ts === 'number' && age >= 0 && age < 2 * 36e5; }
  function loadLead() { try { var o = JSON.parse(sessionStorage.getItem(STORE_LEAD) || 'null'); return o && o.env === CFG.env && freshRecord(o) ? o : null; } catch (e) { return null; } }
  function saveIds(ids) { try { sessionStorage.setItem(STORE_IDS, JSON.stringify(Object.assign({ ts: Date.now(), env: CFG.env }, ids))); } catch (e) {} }
  function buyerIdentity(lead) {
    if (!lead) return null;
    function text(v) { return String(v || '').trim().toLowerCase().replace(/\s+/g, ' '); }
    var email = text(lead.email), phone = String(lead.e164 || '').replace(/\D/g, '');
    if (!email || !phone) return null; /* Legacy/unbound entries are never reused. */
    return [email, phone, text(lead.firstName), text(lead.lastName), text(lead.countryIso), text(lead.stateCode)];
  }
  function orderSignature(sel, lead) { var p = product(sel.product), buyer = buyerIdentity(lead); return buyer ? JSON.stringify([sel.product,sel.level||'',sel.capsules||[],p.firstPayment,p.total,p.numberOfPayments,buyer]) : null; }
  function loadIds(sel, lead) { try { var o = JSON.parse(sessionStorage.getItem(STORE_IDS) || 'null'), signature = orderSignature(sel, lead); return o && signature && o.stid && o.orderid && o.product === sel.product && o.env === CFG.env && o.signature === signature && freshRecord(o) ? o : null; } catch (e) { return null; } }
  function clearIds() { try { sessionStorage.removeItem(STORE_IDS); } catch (e) {} }

  var orderInFlight = null;
  function createOrder(staged) {
    /* Snapshot the submitted buyer: editing details cannot retarget an in-flight request. */
    staged = { lead: Object.assign({}, staged.lead), sel: Object.assign({}, staged.sel, { capsules: (staged.sel.capsules || []).slice() }) };
    var signature = orderSignature(staged.sel, staged.lead);
    if (!signature) return Promise.reject(new Error('BUYER_IDENTITY_REQUIRED'));
    var existing = loadIds(staged.sel, staged.lead);
    if (existing) return Promise.resolve(existing);
    if (orderInFlight && orderInFlight.signature === signature) return orderInFlight.promise;
    var request = { signature: signature, promise: null };
    orderInFlight = request;
    request.promise = ipCountry().then(function (ip) {
      var payload = buildEcommPayload(staged.lead, staged.sel, ip);
      return post(relay('/api/lead/ecomm'), payload);
    }).then(function (r) {
      if (r.status === 503 && r.body && r.body.error === 'ENV_NOT_CONFIGURED') throw new Error('ENV_NOT_CONFIGURED');
      var b = r.body || {};
      var stid = b.StudentId || b.StudentID || b.studentId, oid = b.OrderId || b.OrderID || b.orderId;
      if (!r.ok || !stid || !oid) throw new Error('LEAD_CREATE_FAILED');
      var ids = { stid: String(stid), orderid: String(oid), product: staged.sel.product, signature: signature };
      if (orderInFlight === request) { saveIds(ids); orderInFlight = null; }
      return ids;
    }).catch(function (e) { if (orderInFlight === request) orderInFlight = null; throw e; });
    return request.promise;
  }
  function fetchDetails(ids) {
    return post(relay('/api/checkout/details'), { StudentId: String(ids.stid), OrderId: String(ids.orderid) }).then(function (r) { return r.ok && r.body && typeof r.body === 'object' ? r.body : null; });
  }
  /* The CRM decides the charge. Accept it only if it equals the displayed offer. */
  function validatePaymentAmounts(d, p) {
    var a = (d && d.Airwallex) || {};
    if (!d || d.PaymentID == null || String(d.PaymentID).trim() === '') return { ok:false, reason:'PAYMENT_DETAILS_INCOMPLETE' };
    var amount = Number(d.AmountToCharge != null ? d.AmountToCharge : a.amount), n = Number(d.NumOfPayments);
    if (String(d.CurrencyCode || a.currency || '').toUpperCase() !== 'USD') return { ok: false, reason: 'CURRENCY_NOT_USD', amount: amount, n: n };
    var total = Number(d.OrderCoursePrice), perMonth = Number(d.PaymentPerMonth), rest = Math.max(0, p.numberOfPayments - 1);
    if (![amount,n,total,perMonth].every(Number.isFinite) || amount <= 0 || total <= 0 || n < 0 || (rest > 0 && perMonth <= 0)) return { ok:false, reason:'PAYMENT_DETAILS_INCOMPLETE' };
    /* CRM semantics (verified 2026-10-20): AmountToCharge = today's payment, NumOfPayments = payments AFTER it, PaymentPerMonth each, OrderCoursePrice = full plan. */
    if (Math.abs(amount - p.firstPayment) > 0.005 || n !== rest || Math.abs(total - p.total) > 0.011 || (rest > 0 && Math.abs(perMonth - p.monthly) > 0.011)) return { ok: false, reason: 'PAYMENT_PLAN_MISMATCH', amount: amount, n: n, perMonth: d.PaymentPerMonth, total: d.OrderCoursePrice, paymentId: d.PaymentID, intentId: a.paymentIntentId, clientSecret: a.clientSecret };
    return { ok:true, amount:amount, currency:'USD', paymentId:d.PaymentID };
  }
  function validateDetails(d, p) {
    var plan = validatePaymentAmounts(d,p);
    if (!plan.ok) return plan;
    var a=d.Airwallex||{};
    if (d.AirwallexEnabled === false) return {ok:false,reason:'CARD_PROVIDER_UNAVAILABLE'};
    if (!a.paymentIntentId || !a.clientSecret || !Number.isFinite(Number(a.amount))) return {ok:false,reason:'PAYMENT_DETAILS_INCOMPLETE'};
    if (String(a.currency||'').toUpperCase()!=='USD') return {ok:false,reason:'CURRENCY_NOT_USD'};
    if (Math.abs(Number(a.amount)-plan.amount)>0.005) return {ok:false,reason:'PAYMENT_PLAN_MISMATCH'};
    return {ok:true,amount:plan.amount,currency:'USD',paymentId:plan.paymentId,intentId:a.paymentIntentId,clientSecret:a.clientSecret};
  }
  function reportPayment(report) {
    for (var k in report) if (/^(card_?number|pan|cvc|cvv|expiry)$/i.test(k)) delete report[k];
    return post(relay('/api/checkout/payments/crm'), report);
  }

  /* ---------- bundle: every capsule assigned to the SAME student (2026-10-23) ----------
     The paid order carries the whole package price on the first capsule's course (unchanged).
     After the payment succeeds, each other capsule in the package is added to the same student
     (StudentId) as its own course order at DiscountPercent 100, so nothing more is billed.
     Staging proof 2026-10-23: student 11674899, paid order 8054357 stays AmountToCharge 189 / 567;
     attached order 8054358 (course 270) returns no amount and PaymentID -1 (nothing to charge).
     Runs once per paid order (sessionStorage guard); never before payment. */
  function bundleExtras(sel) {
    var p = product(sel.product); if (!p || p.kind !== 'capsules' || !(p.packs > 1)) return [];
    var keys = p.packs === 3 ? Object.keys(CFG.capsules) : (sel.capsules || []).slice();
    var first = (sel.capsules && sel.capsules[0]) || (p.packs === 3 ? 'fashion-art' : null);
    return keys.filter(function (k) { return k !== first && CFG.capsules[k] && CFG.capsules[k].crm; });
  }
  function attachBundleCourses(ids, sel, lead) {
    var extras = bundleExtras(sel || {});
    if (!ids || !ids.stid || !ids.orderid || !lead || !extras.length) return Promise.resolve({ ok: true, attached: [] });
    var guardKey = 'fa_bundle_attached_' + CFG.env + '_' + ids.orderid, done = {};
    try { done = JSON.parse(sessionStorage.getItem(guardKey) || '{}') || {}; } catch (e) {}
    function save() { try { sessionStorage.setItem(guardKey, JSON.stringify(done)); } catch (e) {} }
    return ipCountry().then(function (ip) {
      return extras.reduce(function (chain, key) {
        return chain.then(function () {
          if (done[key]) return;
          var one = Object.assign({}, sel, { capsules: [key].concat((sel.capsules || []).filter(function (c) { return c !== key; })) });
          var payload = buildEcommPayload(lead, one, ip);
          payload.StudentId = Number(ids.stid);
          payload.FirstPayment = 0; payload.NumberOfPayments = 0; payload.LeftToPay = 0;
          payload.DiscountPercent = 100;
          payload.DiscountReason = 'Culture Capsules bundle, paid on order ' + ids.orderid;
          payload.DynamicParameters = ('fabundleprimaryorder=' + ids.orderid + '&fabundlecapsule=' + key + '&' + payload.DynamicParameters).slice(0, 4000);
          function attempt(n) {
            return post(relay('/api/lead/ecomm'), payload).then(function (r) {
              var b = r.body || {}, sid = String(b.StudentId || b.StudentID || ''), oid = b.OrderId || b.OrderID;
              if (r.ok && oid && sid === String(ids.stid)) { done[key] = String(oid); save(); return; }
              if (r.ok && oid) { done['err_' + key] = 'student_mismatch_' + sid; save(); return; } /* never retry onto another student */
              if (n < 3) return new Promise(function (ok) { setTimeout(ok, 2000 * n); }).then(function () { return attempt(n + 1); });
              done['err_' + key] = r.status || 'network';
            }, function (e) {
              /* The CRM can be slow; retry. A rare duplicate is a second $0 course order on the same student. */
              if (n < 3) return new Promise(function (ok) { setTimeout(ok, 2000 * n); }).then(function () { return attempt(n + 1); });
              done['err_' + key] = String(e && e.message || e);
            });
          }
          return attempt(1);
        });
      }, Promise.resolve());
    }).then(function () {
      var attached = extras.filter(function (k) { return done[k]; });
      return { ok: attached.length === extras.length, attached: attached.map(function (k) { return { capsule: k, orderid: done[k] }; }), expected: extras };
    }).catch(function (e) { return { ok: false, error: String(e && e.message || e), expected: extras }; });
  }

  /* Reserve mode: proven lead path, nothing charged. */
  function reserveViaLeads(staged, reason) {
    var lead = staged.lead, sel = staged.sel, p = product(sel.product);
    if (!window.eTeacherLeads || typeof window.eTeacherLeads.submit !== 'function') return Promise.resolve({ ok: false, error: 'leads_unavailable' });
    if (CFG.env === 'staging') { try { console.info('[FA checkout] staging: reserve lead NOT sent to production CRM', { product: sel.product, reason: reason }); } catch (e) {} return Promise.resolve({ ok: true, simulated: true }); }
    var notes = 'SELF-SERVICE CHECKOUT (reserve, not charged: ' + reason + ') | Product: ' + productTitle(sel) + ' | Plan: ' + p.numberOfPayments + ' payments of ' + fmt2(p.monthly) + (p.firstPayment !== p.monthly ? ' (first ' + fmt2(p.firstPayment) + ')' : '') + ' | Total: ' + fmt2(p.total) + ' | Buyer country: ' + lead.countryIso + (lead.stateCode ? ' ' + lead.stateCode : '');
    return window.eTeacherLeads.submit({ firstName: lead.firstName, lastName: lead.lastName, email: lead.email, phone: lead.e164, countryIso: lead.countryIso, level: sel.level ? (CFG.levels[sel.level] || {}).name : undefined, adminNotes: notes });
  }

  /* ======================================================================
     ENROLLMENT MODAL (steps 1–2). Separate DOM (#fa-ck) from the lead popup.
     ====================================================================== */
  var modal = null, state = { sel: null, step: 1, asideOpen: false };
  function h(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function countryOptions(selected) {
    return GEO.LIST.map(function (c) { return '<option value="' + c.iso + '"' + (c.iso === selected ? ' selected' : '') + '>' + h(c.name) + ' (+' + c.dial + ')</option>'; }).join('');
  }
  function stateOptions() { return '<option value="">Select your state</option>' + Object.keys(GEO.US_STATES).map(function (k) { return '<option value="' + k + '">' + h(GEO.US_STATES[k]) + '</option>'; }).join(''); }
  function levelOptions(sel) { return Object.keys(CFG.levels).map(function (k) { return '<option value="' + k + '"' + (k === sel ? ' selected' : '') + '>' + h(CFG.levels[k].name) + ' · ' + h(CFG.levels[k].cefr) + '</option>'; }).join(''); }

  /* ---------- modal shell: neon glass dialog, focus trap, ESC, backdrop ---------- */
  var lastFocus = null;
  var ICON = {
    close: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    chev: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>'
  };
  var STEPS = ['Register', 'Your course', 'Secure payment'];
  function progressHtml(n) {
    return '<ol class="fa-ck-progress" aria-label="Checkout steps">' + STEPS.map(function (s, i) {
      var k = i + 1;
      return '<li class="fa-ck-step' + (k === n ? ' is-on' : '') + (k < n ? ' is-done' : '') + '"' + (k === n ? ' aria-current="step"' : '') + '><i>' + (k < n ? ICON.check : k) + '</i><span>' + s + '</span></li>';
    }).join('') + '</ol>';
  }
  function ensureModal() {
    if (modal) return modal;
    var wrap = document.createElement('div');
    wrap.className = 'fa-ck-overlay'; wrap.id = 'fa-ck'; wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = '<div class="fa-ck-modal" role="dialog" aria-modal="true" aria-labelledby="fa-ck-title">' +
      '<button type="button" class="fa-ck-close" aria-label="Close checkout">' + ICON.close + '</button>' +
      '<aside class="fa-ck-aside" aria-label="Your enrollment"></aside>' +
      '<div class="fa-ck-main">' + progressHtml(1) + '<div class="fa-ck-body"></div></div></div>';
    document.body.appendChild(wrap);
    wrap.addEventListener('click', function (e) { if (e.target === wrap || e.target.closest('.fa-ck-close')) close(); });
    document.addEventListener('keydown', function (e) {
      if (!wrap.classList.contains('is-open')) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Tab') {
        var f = Array.prototype.filter.call(wrap.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled])'), function (el) { return el.offsetParent !== null; });
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    modal = wrap; return wrap;
  }
  function setStep(n) {
    state.step = n;
    var old = modal.querySelector('.fa-ck-progress'); if (old) old.outerHTML = progressHtml(n);
    modal.querySelector('.fa-ck-main').scrollTop = 0; modal.querySelector('.fa-ck-modal').scrollTop = 0;
  }
  function isDesktop() { return window.matchMedia('(min-width: 901px)').matches; }
  function open(productId, opts) {
    if (window.FA_PAYMENT_LOCKED) { window.alert('Payment is processing. Wait for confirmation before editing.'); return; }
    opts = opts || {};
    var p = product(productId); if (!p) return;
    ensureModal(); lastFocus = document.activeElement;
    state.sel = { product: productId, level: opts.level || (p.kind !== 'capsules' ? 'beginner' : undefined), classTime: '', capsules: opts.capsules && opts.capsules.length ? opts.capsules : (productId === 'capsule-3' ? Object.keys(CFG.capsules) : []) };
    state.asideOpen = false;
    var saved = loadLead();
    renderStep1(saved && saved.lead);
    modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('fa-ck-lock');
    if (isDesktop()) setTimeout(function () { var f = modal.querySelector('#fa-ck-fn'); if (f && !f.value) f.focus(); }, 380);
    lastProduct = productId;   /* InitiateCheckout fires on the payment screen with the CRM order id (Julie format) */
  }
  function close() {
    if (!modal) return;
    modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); document.body.classList.remove('fa-ck-lock');
    try { if (lastFocus && lastFocus.focus) lastFocus.focus(); } catch (e) {}
  }

  function assetBase() { return /\/courses\//.test(location.pathname) ? '../' : ''; }
  var CAP_IMG = { 'fashion-art': 'assets/capsules/capsule-chanel.jpg', 'gastronomy': 'assets/img/culture/wine-hero.jpg', 'cinema-music': 'assets/img/culture/music-hero.jpg' };
  function productImage(sel) {
    var p = product(sel.product), b = assetBase();
    if (!p) return '';
    if (p.kind === 'course') return b + 'assets/courses_webp/fa-' + (sel.level || 'beginner') + '-1.webp';
    if (p.kind === 'membership') return b + 'assets/gen/hero-paris.webp';
    var caps = sel.capsules || [];
    if (caps.length === 1 && CAP_IMG[caps[0]]) return b + CAP_IMG[caps[0]];
    return b + 'assets/capsules/hero-versailles.jpg';
  }
  function titleParts(sel) { var t = productTitle(sel), i = t.indexOf(' · '); return { name: i > 0 ? t.slice(0, i) : t, sub: i > 0 ? t.slice(i + 3) : '' }; }
  function routeFor(sel) {
    var p = product(sel.product);
    if (p.kind === 'membership') return 'A year at the Atelier';
    if (p.kind === 'course') { var lv = CFG.levels[sel.level]; return lv ? lv.route : ''; }
    return (sel.capsules || []).map(function (c) { return (CFG.capsules[c] || {}).tagline || ''; }).filter(Boolean).join(' · ');
  }
  function factsFor(p) { return p.kind === 'capsules' ? CFG.capsuleFacts : CFG.courseFacts; }
  function factRows(p) { return '<dl class="fa-ck-facts">' + factsFor(p).map(function (f) { return '<div><dt>' + h(f[0]) + '</dt><dd>' + h(f[1]) + '</dd></div>'; }).join('') + '</dl>'; }
  function tuitionBand(p) {
    if (p.kind === 'capsules') return '<div class="fa-ck-band"><div class="fa-ck-band-k">Your package price' + (p.promo ? ' · ' + h(p.promo.code) + ' applied' : '') + '</div><div class="fa-ck-band-v"><span>' + fmt2(p.firstPayment) + ' due today</span></div><div class="fa-ck-band-s">Then ' + (p.numberOfPayments - 1) + ' monthly payments of ' + fmt2(p.monthly) + '.<br><b>Total payable: ' + fmt2(p.total) + '</b></div></div>';
    if (p.kind === 'course') return '<div class="fa-ck-band"><div class="fa-ck-band-k">Course tuition · online enrollment</div><div class="fa-ck-band-v"><s>' + fmt(p.listTotal) + '</s><span>' + fmt2(p.total) + ' for the full course</span><em class="fa-ck-off">' + (p.pct || 41) + '% off</em></div><div class="fa-ck-band-s">First month only <b>' + fmt2(p.firstPayment) + ' today</b> — your first two weeks free — then ' + (p.numberOfPayments - 1) + ' × ' + fmt2(p.monthly) + ' · ' + fmt2(p.total) + ' in total instead of ' + fmt(p.listTotal) + '</div></div>';
    if (p.kind === 'membership') return '<div class="fa-ck-band"><div class="fa-ck-band-k">Atelier Membership</div><div class="fa-ck-band-v"><span>' + fmt(p.monthly) + ' a month for 12 months</span></div><div class="fa-ck-band-s">1 language course + all 3 Culture Capsules + the Atelier Benefits · ' + fmt2(p.total) + ' in total</div></div>';
    if (p.promo) return '<div class="fa-ck-band"><div class="fa-ck-band-k">Culture Capsule tuition · code ' + h(p.promo.code) + '</div><div class="fa-ck-band-v"><s>' + fmt(p.baseMonthly) + '</s><span>' + fmt2(p.monthly) + ' a month for 3 months</span><em class="fa-ck-off">' + p.promo.pct + '% off</em></div><div class="fa-ck-band-s">' + fmt2(p.total) + ' in total instead of ' + fmt(p.baseTotal) + '</div></div>';
    if (p.packs === 1 && p.listTotal && p.pct) return '<div class="fa-ck-band"><div class="fa-ck-band-k">Culture Capsule tuition · online enrollment</div><div class="fa-ck-band-v"><s>' + fmt(p.listTotal) + '</s><span>' + fmt2(p.total) + ' for the full capsule</span><em class="fa-ck-off">' + p.pct + '% off</em></div><div class="fa-ck-band-s">' + fmt2(p.monthly) + ' a month for 3 months</div></div>';
    var per = p.packs === 1 ? '$99' : p.packs === 2 ? '$89' : '$63';
    return '<div class="fa-ck-band"><div class="fa-ck-band-k">Culture Capsules tuition</div><div class="fa-ck-band-v">' + (p.packs > 1 ? '<s>$99</s>' : '') + '<span>' + per + ' a month per capsule · 3 months</span>' + (p.packs > 1 ? '<em class="fa-ck-off">' + (p.packs === 2 ? 'Save $20 a month' : 'Save $108 a month') + '</em>' : '') + '</div><div class="fa-ck-band-s">' + fmt2(p.monthly) + ' a month for 3 months · ' + fmt2(p.total) + ' in total</div></div>';
  }
  function savings(p) {
    if (p.kind === 'capsules' && !p.promo && p.packs === 1) return null;
    var base = p.kind === 'course' ? p.listTotal : p.promo ? p.baseTotal : (p.kind === 'capsules' && p.packs > 1 ? 99 * 3 * p.packs : p.listTotal || 0);
    var s = base ? Math.round((base - p.total) * 100) / 100 : 0; if (s <= 0) return null;
    var why = p.kind === 'course' ? 'vs. the ' + fmt(p.listTotal) + ' list price' : p.promo ? 'with code ' + p.promo.code : p.packs > 1 ? 'vs. buying each capsule alone' : 'vs. the $500 list price';
    return { amount: s, label: p.promo ? p.promo.code + ' savings: ' + fmt2(s) : 'You save ' + fmt2(s) + ' ' + why };
  }
  var SAVE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  function saveChip(p, cls) { var s = savings(p); return s ? '<span class="' + cls + '">' + SAVE_ICON + h(s.label) + '</span>' : ''; }
  function sumRows(p) {
    if (p.kind === 'course') return '<div class="fa-ck-sum-row is-accent"><span>Today · first month</span><strong>' + fmt2(p.firstPayment) + '</strong></div>' +
      '<div class="fa-ck-sum-row"><span>Then ' + (p.numberOfPayments - 1) + ' monthly payments</span><strong>' + fmt2(p.monthly) + '</strong></div>' +
      '<div class="fa-ck-sum-row is-total"><span>Total · ' + (p.pct || 41) + '% off ' + fmt(p.listTotal) + '</span><strong>' + fmt2(p.total) + '</strong></div>' + saveChip(p, 'fa-ck-save');
    return '<div class="fa-ck-sum-row is-accent"><span>Due today</span><strong>' + fmt2(p.firstPayment) + '</strong></div>' +
      '<div class="fa-ck-sum-row"><span>Then ' + (p.numberOfPayments - 1) + ' monthly payments of</span><strong>' + fmt2(p.monthly) + '</strong></div>' +
      '<div class="fa-ck-sum-row is-total"><span>Total payable for this package</span><strong>' + fmt2(p.total) + '</strong></div>' + saveChip(p, 'fa-ck-save');
  }
  function renderAside() {
    var sel = state.sel, p = product(sel.product); if (!modal || !p) return;
    var aside = modal.querySelector('.fa-ck-aside'), tp = titleParts(sel), route = routeFor(sel), img = productImage(sel);
    aside.classList.toggle('is-open', !!state.asideOpen);
    aside.innerHTML =
      '<button type="button" class="fa-ck-sumbar" aria-expanded="' + (state.asideOpen ? 'true' : 'false') + '" aria-controls="fa-ck-aside-full">' +
        '<span class="fa-ck-sumbar-img"><img src="' + img + '" alt=""></span>' +
        '<span class="fa-ck-sumbar-txt"><b>' + h(tp.name) + '</b><span>' + (state.asideOpen ? 'Hide details' : 'Show details') + '</span></span>' +
        '<span class="fa-ck-sumbar-price"><b>' + fmt2(p.firstPayment) + '</b><span>today</span></span>' +
        '<span class="fa-ck-sumbar-chev">' + ICON.chev + '</span>' +
      '</button>' +
      '<div class="fa-ck-aside-full" id="fa-ck-aside-full">' +
        '<div class="fa-ck-aside-img"><img src="' + img + '" alt="">' + (route ? '<span class="fa-ck-route">' + h(route) + '</span>' : '') + '</div>' +
        '<div class="fa-ck-aside-body">' +
          '<div class="fa-ck-brandline">The French Atelier by Acadomia</div>' +
          '<h3 class="fa-ck-aside-title">' + h(tp.name) + '</h3>' + (tp.sub ? '<div class="fa-ck-aside-sub">' + h(tp.sub) + '</div>' : '') +
          '<div class="fa-ck-price"><span class="fa-ck-price-num">' + fmt2(p.firstPayment) + '</span><span class="fa-ck-price-lab">due today<br>' + (p.kind === 'course' ? 'first month · 2 weeks free' : 'then monthly') + '</span></div>' +
          '<div class="fa-ck-rows">' + sumRows(p) + '</div>' +
          (p.kind === 'capsules' ? '<p class="fa-ck-refund">' + ICON.check + '14-day full refund</p>' : '') +
          '<ul class="fa-ck-trust">' + p.includes.filter(function(i) { return p.kind !== 'capsules' || !/capsule at .*month/i.test(i); }).slice(0, 4).map(function (i) { return '<li>' + h(i) + '</li>'; }).join('') + '</ul>' +
        '</div>' +
      '</div>';
    aside.querySelector('.fa-ck-sumbar').addEventListener('click', function () { state.asideOpen = !state.asideOpen; renderAside(); });
  }
  function payMarks() {
    var b = assetBase() + 'assets/pay/';
    return '<div class="fa-ck-marks" aria-label="Accepted payment methods"><span><img src="' + b + 'visa.svg" alt="Visa"></span><span><img src="' + b + 'mastercard.svg" alt="Mastercard"></span><span><img src="' + b + 'amex.svg" alt="American Express"></span><span><img src="' + b + 'paypal.svg" alt="PayPal" class="pp"></span></div>';
  }
  function field(id, label, control, extraClass) {
    return '<div class="fa-ck-field' + (extraClass ? ' ' + extraClass : '') + '" data-f="' + id + '"><label for="' + id + '">' + label + '</label>' + control + '<p class="fa-ck-msg" id="' + id + '-msg" aria-live="polite"></p></div>';
  }
  var EMAIL_FIX = { 'gmial.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gnail.com': 'gmail.com', 'gmail.co': 'gmail.com', 'gmail.con': 'gmail.com', 'gmaill.com': 'gmail.com', 'gmail.cm': 'gmail.com', 'hotmial.com': 'hotmail.com', 'hotmal.com': 'hotmail.com', 'hotmail.con': 'hotmail.com', 'hotmail.co': 'hotmail.com', 'yahooo.com': 'yahoo.com', 'yaho.com': 'yahoo.com', 'yahoo.con': 'yahoo.com', 'yahoo.co': 'yahoo.com', 'outlok.com': 'outlook.com', 'outlook.con': 'outlook.com', 'iclod.com': 'icloud.com', 'icloud.con': 'icloud.com', 'icoud.com': 'icloud.com' };
  function suggestEmail(v) {
    var m = /^([^@\s]+)@([^@\s]+)$/.exec(v || ''); if (!m) return '';
    var d = m[2].toLowerCase(), s = EMAIL_FIX[d] || (/\.(con|cmo|cm|om|comm|vom)$/.test(d) ? d.replace(/\.(con|cmo|cm|om|comm|vom)$/, '.com') : '');
    return s && s !== d ? m[1] + '@' + s : '';
  }
  function fmtNanp(v) {
    var d = String(v || '').replace(/\D/g, ''); if (d.length === 11 && d.charAt(0) === '1') d = d.slice(1); d = d.slice(0, 10);
    if (d.length < 4) return d; if (d.length < 7) return '(' + d.slice(0, 3) + ') ' + d.slice(3); return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
  }
  function btnBusy(b, label) { b.disabled = true; b.classList.add('is-busy'); b.setAttribute('aria-busy', 'true'); b.innerHTML = '<span class="fa-ck-spin" aria-hidden="true"></span><span>' + label + '</span>'; }

  /* ---------- step 1: Register ---------- */
  function renderStep1(prefill) {
    setStep(1); renderAside();
    var sel = state.sel, lead = prefill || {}, iso0 = lead.countryIso || 'US';
    var body = modal.querySelector('.fa-ck-body');
    body.innerHTML = '<header class="fa-ck-head"><div class="fa-ck-stepline">Step 1 of 3</div><h3 id="fa-ck-title" class="fa-ck-title">' + (product(sel.product) && product(sel.product).kind === 'capsules' ? 'Your capsules <span class="gi">start here.</span>' : 'Your French <span class="gi">starts here.</span>') + '</h3>' +
      '<p class="fa-ck-sub">Register in a minute. Your seat is held while you complete the secure payment.</p></header>' +
      '<form class="fa-ck-form" novalidate>' +
      '<div class="fa-ck-row two">' + field('fa-ck-fn', 'First name', '<input id="fa-ck-fn" autocomplete="given-name" autocapitalize="words" required placeholder="Camille" value="' + h(lead.firstName || '') + '">') +
        field('fa-ck-ln', 'Last name', '<input id="fa-ck-ln" autocomplete="family-name" autocapitalize="words" required placeholder="Durand" value="' + h(lead.lastName || '') + '">') + '</div>' +
      field('fa-ck-em', 'Email', '<input id="fa-ck-em" type="email" autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false" required placeholder="camille@example.com" value="' + h(lead.email || '') + '">') +
      field('fa-ck-co', 'Country', '<select id="fa-ck-co" autocomplete="country">' + countryOptions(iso0) + '</select>') +
      '<div class="fa-ck-row two">' + field('fa-ck-ph', 'Mobile number', '<div class="fa-ck-tel"><span class="fa-ck-dial" id="fa-ck-dial">+1</span><input id="fa-ck-ph" type="tel" autocomplete="tel-national" inputmode="tel" required placeholder="(212) 555-0147" value="' + h(lead.phoneRaw || '') + '"></div>') +
        field('fa-ck-st', 'State', '<select id="fa-ck-st" autocomplete="address-level1">' + stateOptions() + '</select>', iso0 === 'US' ? '' : 'is-hidden') + '</div>' +
      '<label class="fa-ck-consent"><input type="checkbox" id="fa-ck-sms"' + (lead.consent === false ? '' : ' checked') + '><span>I agree to receive a call, SMS and email from The French Atelier by Acadomia about my enrollment. Message frequency varies, message and data rates may apply.</span></label>' +
      '<p class="fa-ck-error" hidden></p>' +
      '<div class="fa-ck-go"><button type="submit" class="fa-ck-submit"><span>Continue</span>' + ICON.arrow + '</button></div>' +
      '<p class="fa-ck-fine">' + ICON.lock + ' Secure checkout by eTeacher Group for The French Atelier by Acadomia. By continuing you agree to our <a href="' + assetBase() + 'terms.html" target="_blank" rel="noopener">Terms</a> and <a href="' + assetBase() + 'privacy.html" target="_blank" rel="noopener">Privacy Policy</a>.</p>' +
      '</form>';
    var $f = function (id) { return body.querySelector('#' + id); };
    var co = $f('fa-ck-co'), ph = $f('fa-ck-ph'), st = $f('fa-ck-st'), dial = $f('fa-ck-dial'), em = $f('fa-ck-em');
    var stWrap = body.querySelector('[data-f="fa-ck-st"]');
    function nanp() { return co.value === 'US' || co.value === 'CA'; }
    function syncDial() { var g = GEO.BY_ISO[co.value]; dial.textContent = g ? '+' + g.dial : '+'; stWrap.classList.toggle('is-hidden', co.value !== 'US'); ph.placeholder = nanp() ? '(212) 555-0147' : 'Mobile number'; if (nanp() && ph.value) ph.value = fmtNanp(ph.value); }
    if (lead.stateCode) st.value = lead.stateCode;
    syncDial();
    if (!prefill) ipCountry().then(function (ip) { if (ip && GEO.BY_ISO[ip] && !ph.value) { co.value = ip; syncDial(); } });
    var rules = {
      'fa-ck-fn': function () { return $f('fa-ck-fn').value.trim() ? '' : 'Please enter your first name.'; },
      'fa-ck-ln': function () { return $f('fa-ck-ln').value.trim() ? '' : 'Please enter your last name.'; },
      'fa-ck-em': function () { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value.trim()) ? '' : 'Please enter a valid email address.'; },
      'fa-ck-ph': function () { var r = GEO.toE164(ph.value, co.value); return r.ok ? '' : (co.value === 'US' ? 'Please enter a 10-digit US mobile number.' : 'Please enter a valid mobile number for ' + (GEO.BY_ISO[co.value] || {}).name + '.'); },
      'fa-ck-st': function () { return co.value !== 'US' || GEO.US_STATES[st.value] ? '' : 'Please select your state.'; }
    };
    function mark(id, show) {
      var wrap = body.querySelector('[data-f="' + id + '"]'), msg = $f(id + '-msg'), m = rules[id]();
      if (show) { wrap.classList.toggle('is-invalid', !!m); msg.textContent = m; }
      else if (!m && wrap.classList.contains('is-invalid')) { wrap.classList.remove('is-invalid'); msg.textContent = ''; }
      wrap.classList.toggle('is-valid', !m);
      if (id === 'fa-ck-em' && !m) { var s = suggestEmail(em.value.trim()); if (s) { msg.innerHTML = 'Did you mean <button type="button" class="fa-ck-suggest">' + h(s) + '</button>?'; msg.querySelector('button').addEventListener('click', function () { em.value = s; mark('fa-ck-em', true); }); } else if (show) msg.textContent = ''; }
      return !m;
    }
    Object.keys(rules).forEach(function (id) {
      var el = $f(id);
      el.addEventListener('blur', function () { if (el.value) mark(id, true); });
      el.addEventListener('input', function () { var w = body.querySelector('[data-f="' + id + '"]'); mark(id, w.classList.contains('is-invalid')); });
      el.addEventListener('change', function () { mark(id, true); });
      if (el.value) mark(id, false);
    });
    co.addEventListener('change', function () { syncDial(); if (ph.value) mark('fa-ck-ph', true); mark('fa-ck-st', false); });
    var stateTouched = false; st.addEventListener('change', function () { stateTouched = true; });
    ph.addEventListener('input', function () {
      if (nanp()) { var end = ph.selectionStart === ph.value.length; var f = fmtNanp(ph.value); if (end && f !== ph.value) ph.value = f; }
      if (co.value === 'US' && !stateTouched) { var s = GEO.stateForPhone(ph.value); if (s && GEO.US_STATES[s]) { st.value = s; mark('fa-ck-st', false); } }
    });
    body.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = Object.keys(rules).filter(function (id) { return !(id === 'fa-ck-st' && co.value !== 'US') && !mark(id, true); });
      if (bad.length) { var first = $f(bad[0]); first.focus(); try { first.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (x) {} return; }
      var iso = co.value, phone = GEO.toE164(ph.value, iso);
      var leadObj = { firstName: $f('fa-ck-fn').value.trim(), lastName: $f('fa-ck-ln').value.trim(), email: em.value.trim(), countryIso: iso, phoneRaw: ph.value, e164: phone.e164, stateCode: iso === 'US' ? st.value : '', consent: !!$f('fa-ck-sms').checked };
      saveLead(leadObj, sel);
      track('Lead', { content_name: productTitle(sel), content_ids: [sel.product], content_type: 'product' }, { suffix: sel.product });
      registerLead(leadObj, sel);
      acStage('FA_Abandoned_Cart_Name_Details', leadObj);
      renderStep2(leadObj);
    });
  }

  /* Step 1 = CRM lead, exactly like the Longevity checkout: the advisor sees the
     prospect even if the payment is never completed. Production only — on the
     staging host nothing is sent (no test leads in the production CRM). */
  function registerLead(lead, sel) {
    try {
      if (CFG.env !== 'production' || !window.eTeacherLeads || typeof window.eTeacherLeads.submit !== 'function') return;
      if (sessionStorage.getItem('fa_ck_lead_sent') === lead.email) return;
      var lv = CFG.levels[sel.level];
      window.eTeacherLeads.submit({ firstName: lead.firstName, lastName: lead.lastName, email: lead.email, phone: lead.e164, countryIso: lead.countryIso,
        level: lv ? lv.name + ' (' + lv.cefr + ')' : '', adminNotes: 'Self-service checkout started: ' + productTitle(sel) + (lead.stateCode ? ' | State: ' + lead.stateCode : '') + ' | SMS consent: ' + (lead.consent ? 'yes' : 'no') })
        .then(function (r) { if (r && r.ok) sessionStorage.setItem('fa_ck_lead_sent', lead.email); });
    } catch (e) {}
  }

  /* ---------- step 2: Your course ---------- */
  function renderStep2(lead) {
    setStep(2);
    var sel = state.sel, p = product(sel.product);
    var body = modal.querySelector('.fa-ck-body');
    renderAside();
    var noun = p.kind === 'course' ? 'course.' : p.kind === 'membership' ? 'membership.' : (p.packs === 1 ? 'capsule.' : 'capsules.');
    var html = '<header class="fa-ck-head"><div class="fa-ck-stepline">Step 2 of 3</div><h3 id="fa-ck-title" class="fa-ck-title">Your <span class="gi">' + noun + '</span></h3>' +
      '<p class="fa-ck-sub">' + h(lead.firstName) + ', confirm what you are enrolling in. Nothing is charged until the next screen.</p></header>';
    if (p.kind === 'course' || p.kind === 'membership') {
      html += '<fieldset class="fa-ck-group"><legend>' + (p.kind === 'membership' ? 'Your language course · one of our 4 levels' : 'Choose your level') + '</legend><div class="fa-ck-levels">' +
        Object.keys(CFG.levels).map(function (k) { var lv = CFG.levels[k]; return '<label class="fa-ck-opt"><input type="radio" name="fa-ck-lv" value="' + k + '"' + (k === sel.level ? ' checked' : '') + '><span class="fa-ck-opt-in"><span class="fa-ck-opt-cefr">' + h(lv.cefr) + '</span><b>' + h(lv.name) + '</b><span class="fa-ck-opt-route">' + h(lv.route) + '</span><i class="fa-ck-opt-dot">' + ICON.check + '</i></span></label>'; }).join('') +
        '</div><a class="fa-ck-help" href="' + assetBase() + 'courses.html" target="_blank" rel="noopener">Not sure? Compare the four levels ' + ICON.arrow + '</a></fieldset>';
      html += '<fieldset class="fa-ck-group"><legend>Preferred class time</legend><div class="fa-ck-chips">' +
        CFG.classTimes.map(function (t, i) { return '<label class="fa-ck-chip"><input type="radio" name="fa-ck-time" value="' + h(t) + '"' + ((sel.classTime ? sel.classTime === t : i === 0) ? ' checked' : '') + '><span>' + h(t) + '</span></label>'; }).join('') +
        '</div><p class="fa-ck-hint">Classes run Sunday to Friday at times matched to your timezone.</p></fieldset>';
    }
    if (p.kind === 'capsules') {
      var locked = p.packs === 3;
      html += '<fieldset class="fa-ck-group"><legend>' + (p.packs === 1 ? 'Choose your capsule' : p.packs === 2 ? 'Choose your 2 capsules' : 'Your 3 capsules') + (p.packs === 2 ? ' <span class="fa-ck-count" id="fa-ck-count"></span>' : '') + '</legend><div class="fa-ck-picks">' +
        Object.keys(CFG.capsules).map(function (k) { var c = CFG.capsules[k]; return '<label class="fa-ck-pick"><input type="' + (p.packs === 1 ? 'radio' : 'checkbox') + '" name="fa-ck-cap" value="' + k + '"' + (locked || sel.capsules.indexOf(k) > -1 ? ' checked' : '') + (locked ? ' disabled' : '') + '><span class="fa-ck-pick-in"><span class="fa-ck-pick-img"><img src="' + assetBase() + CAP_IMG[k] + '" alt=""></span><span class="fa-ck-pick-txt"><b>' + h(c.name) + '</b><span>' + h(c.status) + '</span></span><i class="fa-ck-opt-dot">' + ICON.check + '</i></span></label>'; }).join('') +
        '</div><p class="fa-ck-hint">Each capsule is 10 live one-hour classes on Zoom, once a week. No French required.</p></fieldset>';
    }
    html += '<div class="fa-ck-course"><div class="fa-ck-course-name" id="fa-ck-course-name">' + h(productTitle(sel)) + '</div>' + factRows(p) + tuitionBand(p) + (p.kind === 'capsules' ? '<p class="fa-ck-refund">' + ICON.check + '14-day full refund</p>' : '') + '</div>' +
      (p.kind === 'membership' ? '<p class="fa-ck-hint">Fashion &amp; Art has already started, you join the running capsule. Gastronomy &amp; Wine and Cinema &amp; Music start in November.</p>' : '') +
      '<div class="fa-ck-promo"><span class="fa-ck-promo-k">' + ICON.check + '</span><span>' + (p.kind === 'course' ? 'Online offer applied · ' + (p.pct || 41) + '% off · ' + fmt2(p.firstPayment) + ' first month' : p.kind === 'membership' ? 'Membership price applied · $99 a month' : 'Package price: ' + fmt2(p.monthly) + ' per month for ' + p.packs + (p.packs === 1 ? ' capsule' : ' capsules')) + '</span></div>' +
      (p.kind === 'capsules' ? '<div class="fa-ck-code" id="fa-ck-code">' + (p.promo ? '<div class="fa-ck-code-on"><span class="fa-ck-promo-k">' + ICON.check + '</span><span>Promo code <b>' + h(p.promo.code) + '</b> applied · ' + h(p.promo.label) + '</span><button type="button" class="fa-ck-code-x" id="fa-ck-code-rm">Remove</button></div>' : '<label class="fa-ck-code-lb" for="fa-ck-code-in">I have a promo code</label><div class="fa-ck-code-row"><input id="fa-ck-code-in" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Enter promo code"><button type="button" class="fa-ck-code-go" id="fa-ck-code-go">Apply</button></div><p class="fa-ck-code-msg" id="fa-ck-code-msg" hidden></p>') + '</div>' : '') +
      '<p class="fa-ck-error" hidden></p>' +
      '<div class="fa-ck-go"><button type="button" class="fa-ck-submit" id="fa-ck-pay">' + ICON.lock + '<span>Continue to secure payment</span><span class="fa-ck-submit-amt">' + fmt2(p.firstPayment) + ' today</span>' + ICON.arrow + '</button></div>' +
      '<button type="button" class="fa-ck-back" id="fa-ck-back">&larr; Edit my details</button>' +
      payMarks();
    body.innerHTML = html;
    function refresh() { renderAside(); var n = body.querySelector('#fa-ck-course-name'); if (n) n.textContent = productTitle(state.sel); }
    var codeBox = body.querySelector('#fa-ck-code');
    var stepHeader = body.querySelector('.fa-ck-head');
    if (codeBox && stepHeader) body.insertBefore(codeBox, stepHeader.nextSibling);
    var codeGo = body.querySelector('#fa-ck-code-go'), codeRm = body.querySelector('#fa-ck-code-rm');
    function tryCode() {
      var inp=body.querySelector('#fa-ck-code-in'),msg=body.querySelector('#fa-ck-code-msg'),v=(inp.value||'').trim().toUpperCase().replace(/\s+/g,'');
      if(!v){inp.focus();return;}
      if(window.FA_PAYMENT_LOCKED){msg.hidden=false;msg.textContent='Payment is processing. Wait for confirmation before changing the code.';return;}
      var def=CFG.promos&&CFG.promos[v];
      if(!def || def.applies.indexOf(sel.product)<0){msg.hidden=false;msg.textContent='This code is not valid for this offer.';inp.setAttribute('aria-invalid','true');return;}
      var r=promoApply(v,'manual');
      if(!r){msg.hidden=false;msg.textContent='This code could not be applied.';return;}
      renderStep2(lead);window.dispatchEvent(new Event('fa:quotechange'));
    }
    if (codeGo) { codeGo.addEventListener('click', tryCode); body.querySelector('#fa-ck-code-in').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); tryCode(); } }); }
    if (codeRm) codeRm.addEventListener('click', function () { if(window.FA_PAYMENT_LOCKED)return; promoClear(); renderStep2(lead); });
    body.querySelectorAll('input[name="fa-ck-lv"]').forEach(function (r) { r.addEventListener('change', function () { state.sel.level = r.value; refresh(); }); });
    body.querySelectorAll('input[name="fa-ck-time"]').forEach(function (r) { if (r.checked) sel.classTime = r.value; r.addEventListener('change', function () { state.sel.classTime = r.value; }); });
    var caps = body.querySelectorAll('input[name="fa-ck-cap"]');
    function syncCaps() {
      state.sel.capsules = Array.prototype.map.call(body.querySelectorAll('input[name="fa-ck-cap"]:checked'), function (i) { return i.value; });
      if (p.kind === 'capsules' && p.packs === 2) {
        var full = state.sel.capsules.length >= 2;
        caps.forEach(function (c) { c.disabled = full && !c.checked; c.closest('.fa-ck-pick').classList.toggle('is-off', full && !c.checked); });
        var cnt = body.querySelector('#fa-ck-count'); if (cnt) cnt.textContent = state.sel.capsules.length + ' of 2 selected';
      }
      refresh();
    }
    caps.forEach(function (c) { c.addEventListener('change', syncCaps); });
    if (caps.length) syncCaps();
    body.querySelector('#fa-ck-back').addEventListener('click', function () { renderStep1(lead); });
    body.querySelector('#fa-ck-pay').addEventListener('click', function () {
      var err = body.querySelector('.fa-ck-error'), btn = this; err.hidden = true;
      if (btn.disabled) return;
      if (p.kind === 'capsules' && p.packs < 3 && sel.capsules.length !== p.packs) { err.textContent = 'Please choose ' + (p.packs === 1 ? 'one capsule.' : 'exactly two capsules.'); err.hidden = false; return; }
      btnBusy(btn, 'Opening secure payment…');
      saveLead(lead, sel);
      var delivery = track('AddToCart', { content_name: productTitle(sel), content_ids: [sel.product], content_type: 'product', value: p.firstPayment, currency: 'USD' }, { suffix: sel.product });
      acStage('FA_Abandoned_Cart_Course_Details', lead);
      return deliveryBeforePayment(delivery).then(goPayment);
      function goPayment() {
      if (typeof window.FA_CK_START === 'function') { close(); window.FA_CK_START({ lead: lead, sel: sel }); return; }
      var inSub = /\/courses\//.test(location.pathname);
      var checkoutKeys = { product: true, level: true, capsules: true, time: true, env: true };
      var rawQuery = (location.search || '').replace(/^\?/, '');
      var carried = rawQuery ? rawQuery.split('&').filter(function (part) {
        var rawKey = part.split('=')[0], key;
        try { key = decodeURIComponent(rawKey.replace(/\+/g, ' ')); }
        catch (e) { return true; }
        return !Object.prototype.hasOwnProperty.call(checkoutKeys, key);
      }) : [];
      carried.push('product=' + encodeURIComponent(sel.product));
      if (sel.level) carried.push('level=' + encodeURIComponent(sel.level));
      if (sel.capsules && sel.capsules.length) carried.push('capsules=' + encodeURIComponent(sel.capsules.join(',')));
      if (sel.classTime) carried.push('time=' + encodeURIComponent(sel.classTime));
      if (CFG.env === 'staging') carried.push('env=staging');
      location.href = (inSub ? '../' : '') + CFG.checkoutPage + '?' + carried.join('&');
      }
    });
  }

  /* ---------- entry points: any element with data-fa-buy="<product>" ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-fa-buy]'); if (!el) return;
    e.preventDefault();
    open(el.getAttribute('data-fa-buy'), { level: el.getAttribute('data-fa-level') || undefined, capsules: (el.getAttribute('data-fa-capsules') || '').split(',').filter(Boolean) });
  });
  // URL parameters never apply a coupon; the customer must enter it in checkout.
  /* ?buy=<product>&level=<level> deep link (e.g. from ads) */
  try { var q = new URLSearchParams(location.search); if (q.get('buy') && product(q.get('buy'))) window.addEventListener('load', function () { open(q.get('buy'), { level: q.get('level') || undefined }); }); } catch (e) {}

  window.FA_CHECKOUT = { savings: savings, saveChip: saveChip,
    config: CFG, open: open, close: close, product: product, productTitle: productTitle, crmCourseFor: crmCourseFor,
    setProduct: function (id) { lastProduct = String(id || ''); },
    loadLead: loadLead, saveLead: saveLead, createOrder: createOrder, fetchDetails: fetchDetails, validateDetails: validateDetails, validatePaymentAmounts: validatePaymentAmounts,
    reportPayment: reportPayment, attachBundleCourses: attachBundleCourses, bundleExtras: bundleExtras, reserveViaLeads: reserveViaLeads, productImage: productImage, factRows: factRows, tuitionBand: tuitionBand, payMarks: payMarks, routeFor: routeFor, sumRows: sumRows, icon: ICON, progressHtml: progressHtml, titleParts: titleParts, clearIds: clearIds, track: track, eventId: eventId, acStage: acStage, fmt: fmt, fmt2: fmt2, h: h, promoGet: promoGet, promoApply: promoApply, promoClear: promoClear, promoFor: promoFor
  };
})();
