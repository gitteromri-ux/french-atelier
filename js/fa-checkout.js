/* French Atelier — self-service checkout engine + enrollment modal.
 *
 * Port of the proven Longevity / Julie masterclass checkout:
 *   step 1  Your details (name, email, phone E.164 for every country, US state)
 *   step 2  Your plan (offer review, exact amounts, consent)
 *   step 3  checkout.html — eTeacher order -> Airwallex Drop-In (card, Apple Pay,
 *           Google Pay) or PayPal -> SetECommercePayment -> confirmation.
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
  var GEO = window.FA_GEO;
  if (!CFG || !GEO) { console.warn('[fa-checkout] config or geo missing'); return; }

  var STORE_LEAD = 'fa_ck_lead_v1', STORE_IDS = 'fa_ck_ids_v1', STORE_EVT = 'fa_ck_evt_v1';
  var fmt = function (n) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\.00$/, ''); };
  var fmt2 = function (n) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };

  /* ---------- tracking: dataLayer always, fbq only with an FA pixel ---------- */
  function eventId(name) {
    try {
      var m = JSON.parse(sessionStorage.getItem(STORE_EVT) || '{}');
      if (!m[name]) { m[name] = 'fa_' + name.toLowerCase() + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); sessionStorage.setItem(STORE_EVT, JSON.stringify(m)); }
      return m[name];
    } catch (e) { return 'fa_' + name.toLowerCase() + '_' + Date.now().toString(36); }
  }
  function track(name, params, opts) {
    params = params || {};
    var id = (opts && opts.eventId) || eventId(name + (opts && opts.suffix ? '_' + opts.suffix : ''));
    try { window.dataLayer = window.dataLayer || []; window.dataLayer.push(Object.assign({ event: 'fa_' + name.toLowerCase(), event_id: id, env: CFG.env }, params)); } catch (e) {}
    try { if (CFG.metaPixelId && window.fbq) window.fbq('track', name, params, { eventID: id }); } catch (e) {}
    return id;
  }
  if (CFG.metaPixelId && !window.fbq) {
    /* standard Meta base code, FA pixel only */
    (function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', CFG.metaPixelId); window.fbq('track', 'PageView');
  }

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
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.text().then(function (t) { var j = null; try { j = JSON.parse(t); } catch (e) {} return { ok: r.ok, status: r.status, body: j, raw: t }; }); })
      .then(function (res) {
        if (res.status >= 500 && res.status !== 503 && attempt < 3) return new Promise(function (ok) { setTimeout(function () { ok(post(url, body, attempt + 1)); }, 600 * Math.pow(2, attempt - 1)); });
        return res;
      })
      .catch(function (err) {
        if (attempt < 3) return new Promise(function (ok) { setTimeout(function () { ok(post(url, body, attempt + 1)); }, 600 * Math.pow(2, attempt - 1)); });
        return { ok: false, status: 0, body: null, error: String(err && err.message || err) };
      });
  }
  function relay(path) { return CFG.relayBase.replace(/\/$/, '') + (CFG.env === 'staging' ? '/staging' : '') + path; }

  /* ---------- product helpers ---------- */
  function product(id) { return CFG.products[id] || null; }
  function productTitle(sel) {
    var p = product(sel.product); if (!p) return '';
    if (p.kind === 'course') { var lv = CFG.levels[sel.level]; return lv ? lv.name + ' · ' + lv.cefr + ' · 20 live lessons' : p.title; }
    if (p.kind === 'capsules') { var names = (sel.capsules || []).map(function (c) { return (CFG.capsules[c] || {}).name || c; }); return p.title + (names.length ? ' · ' + names.join(' + ') : ''); }
    if (p.kind === 'membership') { var lv2 = CFG.levels[sel.level]; return p.title + (lv2 ? ' · ' + lv2.name : ''); }
    return p.title;
  }
  function crmCourseFor(id) {
    var p = product(id); if (!p) return null;
    if (p.crmCourse && p.crmCourse.mainAbroadCourseId) return p.crmCourse;
    if (CFG.env === 'staging') return CFG.stagingPipePlaceholder;
    return null; /* production without an eTeacher course id -> reserve mode */
  }

  /* ---------- payload (eTeacher ecommerce DTO, as verified on the Longevity checkout) ---------- */
  function words(arr) { return arr.map(function (w) { return String(w).replace(/[^A-Za-z0-9_\-]/g, ''); }).filter(Boolean).join('%20'); }
  function buildEcommPayload(lead, sel, ipIso) {
    var p = product(sel.product), crs = crmCourseFor(sel.product);
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

    var payload = {
      FirstName: lead.firstName, LastName: lead.lastName, Email: lead.email, MobilePhone: lead.e164,
      /* Verified on the Longevity checkout: the CRM prices the order from CountryIsoCode. The real buyer
         country travels in DynamicParameters (message=Buyer country XX) and in stateisocodebyip for US. */
      CountryIsoCode: 'US', CountryIsoCodeByIp: 'US',
      LandingPage: location.href, UserAgent: navigator.userAgent, ReferringSite: document.referrer || location.hostname,
      QueryString: qs.slice(0, 2000), ProductID: CFG.productId,
      MainAbroadCourseId: crs.mainAbroadCourseId, LanguageId: crs.languageId != null ? crs.languageId : 101, IsTrial: crs.isTrial != null ? crs.isTrial : 0,
      FirstPayment: p.firstPayment, NumberOfPayments: p.numberOfPayments, LeftToPay: Math.round((p.total - p.firstPayment) * 100) / 100,
      DynamicParameters: dyn.join('&').slice(0, 4000)
    };
    if (crs.abroadCourseId) payload.AbroadCourseId = crs.abroadCourseId;
    if (crs.preferredCourseId) payload.PreferredCourseId = crs.preferredCourseId;
    if (crs.campusId) { payload.CampusId = crs.campusId; payload.CampusID = crs.campusId; }
    if (crs.semesterId) { payload.SemesterID = crs.semesterId; payload.ActivitySessionLevel1ID = crs.semesterId; }
    return payload;
  }

  /* ---------- session state ---------- */
  function saveLead(lead, sel) { try { sessionStorage.setItem(STORE_LEAD, JSON.stringify({ lead: lead, sel: sel, ts: Date.now(), env: CFG.env })); } catch (e) {} }
  function loadLead() { try { var o = JSON.parse(sessionStorage.getItem(STORE_LEAD) || 'null'); return o && Date.now() - o.ts < 2 * 36e5 ? o : null; } catch (e) { return null; } }
  function saveIds(ids) { try { sessionStorage.setItem(STORE_IDS, JSON.stringify(Object.assign({ ts: Date.now(), env: CFG.env }, ids))); } catch (e) {} }
  function loadIds(sel) { try { var o = JSON.parse(sessionStorage.getItem(STORE_IDS) || 'null'); return o && o.env === CFG.env && o.product === sel.product && Date.now() - o.ts < 2 * 36e5 ? o : null; } catch (e) { return null; } }
  function clearIds() { try { sessionStorage.removeItem(STORE_IDS); } catch (e) {} }

  var orderInFlight = null;
  function createOrder(staged) {
    var existing = loadIds(staged.sel);
    if (existing) return Promise.resolve(existing);
    if (orderInFlight) return orderInFlight;
    orderInFlight = ipCountry().then(function (ip) {
      var payload = buildEcommPayload(staged.lead, staged.sel, ip);
      return post(relay('/api/lead/ecomm'), payload);
    }).then(function (r) {
      orderInFlight = null;
      if (r.status === 503 && r.body && r.body.error === 'ENV_NOT_CONFIGURED') throw new Error('ENV_NOT_CONFIGURED');
      var b = r.body || {};
      var stid = b.StudentId || b.StudentID || b.studentId, oid = b.OrderId || b.OrderID || b.orderId;
      if (!r.ok || !stid || !oid) throw new Error('LEAD_CREATE_FAILED');
      var ids = { stid: String(stid), orderid: String(oid), product: staged.sel.product };
      saveIds(ids); return ids;
    }).catch(function (e) { orderInFlight = null; throw e; });
    return orderInFlight;
  }
  function fetchDetails(ids) {
    return post(relay('/api/checkout/details'), { StudentId: String(ids.stid), OrderId: String(ids.orderid) }).then(function (r) { return r.ok && r.body && typeof r.body === 'object' ? r.body : null; });
  }
  /* The CRM decides the charge. Accept it only if it equals the displayed offer. */
  function validateDetails(d, p) {
    var a = (d && d.Airwallex) || {};
    if (!a.paymentIntentId || !a.clientSecret || d.PaymentID == null) return { ok: false, reason: 'PAYMENT_DETAILS_INCOMPLETE' };
    var amount = Number(a.amount), n = Number(d.NumOfPayments);
    if (String(a.currency || d.CurrencyCode || '').toUpperCase() !== 'USD') return { ok: false, reason: 'CURRENCY_NOT_USD', amount: amount, n: n };
    if (Math.abs(amount - p.firstPayment) > 0.005 || n !== p.numberOfPayments) return { ok: false, reason: 'PAYMENT_PLAN_MISMATCH', amount: amount, n: n, perMonth: d.PaymentPerMonth, total: d.OrderCoursePrice };
    return { ok: true, amount: amount, currency: 'USD', paymentId: d.PaymentID, intentId: a.paymentIntentId, clientSecret: a.clientSecret };
  }
  function reportPayment(report) {
    for (var k in report) if (/^(card_?number|pan|cvc|cvv|expiry)$/i.test(k)) delete report[k];
    return post(relay('/api/checkout/payments/crm'), report);
  }

  /* Reserve mode: proven lead path, nothing charged. */
  function reserveViaLeads(staged, reason) {
    var lead = staged.lead, sel = staged.sel, p = product(sel.product);
    if (!window.eTeacherLeads || typeof window.eTeacherLeads.submit !== 'function') return Promise.resolve({ ok: false, error: 'leads_unavailable' });
    var notes = 'SELF-SERVICE CHECKOUT (reserve, not charged: ' + reason + ') | Product: ' + productTitle(sel) + ' | Plan: ' + p.numberOfPayments + ' payments of ' + fmt2(p.monthly) + (p.firstPayment !== p.monthly ? ' (first ' + fmt2(p.firstPayment) + ')' : '') + ' | Total: ' + fmt2(p.total) + ' | Buyer country: ' + lead.countryIso + (lead.stateCode ? ' ' + lead.stateCode : '');
    return window.eTeacherLeads.submit({ firstName: lead.firstName, lastName: lead.lastName, email: lead.email, phone: lead.e164, countryIso: lead.countryIso, level: sel.level ? (CFG.levels[sel.level] || {}).name : undefined, adminNotes: notes });
  }

  /* ======================================================================
     ENROLLMENT MODAL (steps 1–2). Separate DOM (#fa-ck) from the lead popup.
     ====================================================================== */
  var modal = null, state = { sel: null, step: 1 };
  function h(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function countryOptions(selected) {
    return GEO.LIST.map(function (c) { return '<option value="' + c.iso + '"' + (c.iso === selected ? ' selected' : '') + '>' + h(c.name) + ' (+' + c.dial + ')</option>'; }).join('');
  }
  function stateOptions() { return '<option value="">Select your state</option>' + Object.keys(GEO.US_STATES).map(function (k) { return '<option value="' + k + '">' + h(GEO.US_STATES[k]) + '</option>'; }).join(''); }
  function levelOptions(sel) { return Object.keys(CFG.levels).map(function (k) { return '<option value="' + k + '"' + (k === sel ? ' selected' : '') + '>' + h(CFG.levels[k].name) + ' · ' + h(CFG.levels[k].cefr) + '</option>'; }).join(''); }

  function ensureModal() {
    if (modal) return modal;
    var wrap = document.createElement('div');
    wrap.className = 'fa-ck-overlay'; wrap.id = 'fa-ck'; wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = '<div class="fa-ck-modal" role="dialog" aria-modal="true" aria-labelledby="fa-ck-title">' +
      '<button type="button" class="fa-ck-close" aria-label="Close">&times;</button>' +
      '<div class="fa-ck-steps"><span class="fa-ck-step is-on" data-step="1"><i>1</i>Your details</span><span class="fa-ck-step" data-step="2"><i>2</i>Your plan</span><span class="fa-ck-step" data-step="3"><i>3</i>Secure payment</span></div>' +
      '<div class="fa-ck-body"></div></div>';
    document.body.appendChild(wrap);
    wrap.addEventListener('click', function (e) { if (e.target === wrap || e.target.closest('.fa-ck-close')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && wrap.classList.contains('is-open')) close(); });
    modal = wrap; return wrap;
  }
  function setStep(n) {
    state.step = n;
    modal.querySelectorAll('.fa-ck-step').forEach(function (s) { var k = Number(s.getAttribute('data-step')); s.classList.toggle('is-on', k === n); s.classList.toggle('is-done', k < n); });
  }
  function open(productId, opts) {
    opts = opts || {};
    var p = product(productId); if (!p) return;
    ensureModal();
    state.sel = { product: productId, level: opts.level || (p.kind !== 'capsules' ? 'beginner' : undefined), capsules: opts.capsules || (productId === 'capsule-3' ? Object.keys(CFG.capsules) : []) };
    var saved = loadLead();
    renderStep1(saved && saved.lead);
    modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('fa-ck-lock');
    track('InitiateCheckout', { content_name: productTitle(state.sel), content_ids: [productId], content_type: 'product', value: p.firstPayment, currency: 'USD', num_items: 1 }, { suffix: productId });
  }
  function close() { if (!modal) return; modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); document.body.classList.remove('fa-ck-lock'); }

  function summaryCard(sel) {
    var p = product(sel.product);
    var lines = '';
    if (p.kind === 'course') lines = '<div class="fa-ck-sum-row"><span>' + h(p.numberOfPayments) + ' monthly payments</span><strong>' + fmt2(p.monthly) + '/mo</strong></div>' +
      '<div class="fa-ck-sum-row is-accent"><span>Today — first month 50% off</span><strong>' + fmt2(p.firstPayment) + '</strong></div>' +
      '<div class="fa-ck-sum-row"><span>Then 4 × ' + fmt2(p.monthly) + '</span><strong>' + fmt2(p.total) + ' total</strong></div>' +
      '<div class="fa-ck-sum-row is-muted"><span>Website price</span><s>' + fmt(p.listTotal) + '</s></div>';
    else lines = '<div class="fa-ck-sum-row is-accent"><span>Today</span><strong>' + fmt2(p.firstPayment) + '</strong></div>' +
      '<div class="fa-ck-sum-row"><span>' + p.numberOfPayments + ' monthly payments of ' + fmt2(p.monthly) + '</span><strong>' + fmt2(p.total) + ' total</strong></div>';
    return '<div class="fa-ck-sum"><div class="fa-ck-kicker">' + h(p.offerLabel) + '</div><h4 class="fa-ck-sum-title">' + h(productTitle(sel)) + '</h4>' + lines + '</div>';
  }

  function renderStep1(prefill) {
    setStep(1);
    var sel = state.sel, p = product(sel.product), lead = prefill || {};
    var body = modal.querySelector('.fa-ck-body');
    var levelField = (p.kind === 'course' || p.kind === 'membership') ? '<div class="fa-ck-field"><label for="fa-ck-level">' + (p.kind === 'membership' ? 'Your language course (one of our 4 levels)' : 'Your level') + '</label><select id="fa-ck-level">' + levelOptions(sel.level) + '</select></div>' : '';
    var capsField = '';
    if (p.kind === 'capsules' && p.packs < 3) {
      capsField = '<div class="fa-ck-field"><label>Choose ' + (p.packs === 1 ? 'your capsule' : 'your 2 capsules') + '</label><div class="fa-ck-caps">' + Object.keys(CFG.capsules).map(function (k) { var c = CFG.capsules[k]; return '<label class="fa-ck-cap"><input type="' + (p.packs === 1 ? 'radio' : 'checkbox') + '" name="fa-ck-cap" value="' + k + '"' + (sel.capsules.indexOf(k) > -1 ? ' checked' : '') + '><span><b>' + h(c.name) + '</b><small>' + h(c.status) + '</small></span></label>'; }).join('') + '</div></div>';
    }
    body.innerHTML = '<h3 id="fa-ck-title" class="fa-ck-title">Enroll <span class="gi">online</span></h3>' +
      '<p class="fa-ck-sub">' + h(p.title) + ' · ' + h(p.offerLabel) + '</p>' +
      '<form class="fa-ck-form" novalidate>' + levelField + capsField +
      '<div class="fa-ck-row two"><div class="fa-ck-field"><label for="fa-ck-fn">First name</label><input id="fa-ck-fn" autocomplete="given-name" required value="' + h(lead.firstName || '') + '"></div><div class="fa-ck-field"><label for="fa-ck-ln">Last name</label><input id="fa-ck-ln" autocomplete="family-name" required value="' + h(lead.lastName || '') + '"></div></div>' +
      '<div class="fa-ck-field"><label for="fa-ck-em">Email</label><input id="fa-ck-em" type="email" autocomplete="email" inputmode="email" required value="' + h(lead.email || '') + '"></div>' +
      '<div class="fa-ck-row two"><div class="fa-ck-field"><label for="fa-ck-co">Country</label><select id="fa-ck-co" autocomplete="country">' + countryOptions(lead.countryIso || 'US') + '</select></div><div class="fa-ck-field"><label for="fa-ck-ph">Mobile phone</label><input id="fa-ck-ph" type="tel" autocomplete="tel" inputmode="tel" required placeholder="+1 (212) 555-0147" value="' + h(lead.phoneRaw || '') + '"></div></div>' +
      '<div class="fa-ck-field" id="fa-ck-st-wrap"' + ((lead.countryIso || 'US') === 'US' ? '' : ' hidden') + '><label for="fa-ck-st">State</label><select id="fa-ck-st">' + stateOptions() + '</select></div>' +
      '<p class="fa-ck-error" hidden></p>' +
      '<button type="submit" class="fa-ck-submit">Continue to your plan</button>' +
      '<p class="fa-ck-fine">Secure checkout by eTeacher Group for The French Atelier by Acadomia. Card, Apple Pay, Google Pay and PayPal accepted. By continuing you agree to our <a href="terms.html" target="_blank" rel="noopener">Terms</a> and <a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a>.</p>' +
      '</form>';
    var co = body.querySelector('#fa-ck-co'), ph = body.querySelector('#fa-ck-ph'), stWrap = body.querySelector('#fa-ck-st-wrap'), st = body.querySelector('#fa-ck-st');
    if (lead.stateCode) st.value = lead.stateCode;
    if (!prefill) ipCountry().then(function (ip) { if (ip && GEO.BY_ISO[ip] && !ph.value) { co.value = ip; stWrap.hidden = ip !== 'US'; } });
    co.addEventListener('change', function () { stWrap.hidden = co.value !== 'US'; });
    var stateTouched = false; st.addEventListener('change', function () { stateTouched = true; });
    ph.addEventListener('input', function () { if (co.value === 'US' && !stateTouched) { var s = GEO.stateForPhone(ph.value); if (s && GEO.US_STATES[s]) st.value = s; } });
    body.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var err = body.querySelector('.fa-ck-error'); err.hidden = true;
      var fn = body.querySelector('#fa-ck-fn').value.trim(), ln = body.querySelector('#fa-ck-ln').value.trim(), em = body.querySelector('#fa-ck-em').value.trim();
      var iso = co.value, phone = GEO.toE164(ph.value, iso);
      var lv = body.querySelector('#fa-ck-level'); if (lv) sel.level = lv.value;
      if (p.kind === 'capsules' && p.packs < 3) { sel.capsules = Array.prototype.map.call(body.querySelectorAll('input[name="fa-ck-cap"]:checked'), function (i) { return i.value; }); }
      var msg = '';
      if (!fn || !ln) msg = 'Please enter your first and last name.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) msg = 'Please enter a valid email address.';
      else if (!phone.ok) msg = iso === 'US' ? 'Please enter a valid US mobile number (10 digits, a real area code).' : 'Please enter a valid mobile number for ' + GEO.BY_ISO[iso].name + '.';
      else if (iso === 'US' && !GEO.US_STATES[st.value]) msg = 'Please select your state.';
      else if (p.kind === 'capsules' && p.packs < 3 && sel.capsules.length !== p.packs) msg = 'Please choose ' + (p.packs === 1 ? 'one capsule.' : 'exactly two capsules.');
      if (msg) { err.textContent = msg; err.hidden = false; return; }
      var leadObj = { firstName: fn, lastName: ln, email: em, countryIso: iso, phoneRaw: ph.value, e164: phone.e164, stateCode: iso === 'US' ? st.value : '' };
      saveLead(leadObj, sel);
      track('Lead', { content_name: productTitle(sel), content_ids: [sel.product], content_type: 'product' }, { suffix: sel.product });
      renderStep2(leadObj);
    });
  }

  function renderStep2(lead) {
    setStep(2);
    var sel = state.sel, p = product(sel.product);
    var body = modal.querySelector('.fa-ck-body');
    body.innerHTML = '<h3 id="fa-ck-title" class="fa-ck-title">Your <span class="gi">plan</span></h3>' +
      '<p class="fa-ck-sub">' + h(lead.firstName) + ', here is exactly what you are enrolling in.</p>' +
      summaryCard(sel) +
      '<ul class="fa-ck-includes">' + p.includes.map(function (i) { return '<li>' + h(i) + '</li>'; }).join('') + '</ul>' +
      (p.kind === 'capsules' || p.kind === 'membership' ? '<p class="fa-ck-note">Fashion &amp; Art has already started — you join the running pack. Gastronomy &amp; Wine and Cinema &amp; Music start in November. Every capsule is 10 weekly one-hour conferences on Zoom.</p>' : '') +
      '<p class="fa-ck-error" hidden></p>' +
      '<button type="button" class="fa-ck-submit" id="fa-ck-pay">Continue to secure payment · ' + fmt2(p.firstPayment) + ' today</button>' +
      '<button type="button" class="fa-ck-back" id="fa-ck-back">&larr; Edit my details</button>';
    body.querySelector('#fa-ck-back').addEventListener('click', function () { renderStep1(lead); });
    body.querySelector('#fa-ck-pay').addEventListener('click', function () {
      track('AddToCart', { content_name: productTitle(sel), content_ids: [sel.product], content_type: 'product', value: p.firstPayment, currency: 'USD' }, { suffix: sel.product });
      saveLead(lead, sel);
      if (typeof window.FA_CK_START === 'function') { close(); window.FA_CK_START({ lead: lead, sel: sel }); return; }
      var inSub = /\/courses\//.test(location.pathname);
      location.href = (inSub ? '../' : '') + CFG.checkoutPage + '?product=' + encodeURIComponent(sel.product) + (sel.level ? '&level=' + encodeURIComponent(sel.level) : '') + (sel.capsules && sel.capsules.length ? '&capsules=' + encodeURIComponent(sel.capsules.join(',')) : '') + (CFG.env === 'staging' ? '&env=staging' : '');
    });
  }

  /* ---------- entry points: any element with data-fa-buy="<product>" ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-fa-buy]'); if (!el) return;
    e.preventDefault();
    open(el.getAttribute('data-fa-buy'), { level: el.getAttribute('data-fa-level') || undefined, capsules: (el.getAttribute('data-fa-capsules') || '').split(',').filter(Boolean) });
  });
  /* ?buy=<product>&level=<level> deep link (e.g. from ads) */
  try { var q = new URLSearchParams(location.search); if (q.get('buy') && product(q.get('buy'))) window.addEventListener('load', function () { open(q.get('buy'), { level: q.get('level') || undefined }); }); } catch (e) {}

  window.FA_CHECKOUT = {
    config: CFG, open: open, close: close, product: product, productTitle: productTitle, crmCourseFor: crmCourseFor,
    loadLead: loadLead, saveLead: saveLead, createOrder: createOrder, fetchDetails: fetchDetails, validateDetails: validateDetails,
    reportPayment: reportPayment, reserveViaLeads: reserveViaLeads, clearIds: clearIds, track: track, eventId: eventId, fmt: fmt, fmt2: fmt2, h: h
  };
})();
