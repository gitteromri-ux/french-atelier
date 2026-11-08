/* Refer-a-Friend attribution only. RequestID is an opaque identifier supplied
   by eTeacher, not a new lead ID and not an authentication credential. */
(function (root) {
  'use strict';
  if (!/^\/refer-a-friend(?:\.html)?\/?$/.test(root.location.pathname)) return;
  var KEY = 'fa_referral_request_v1';
  var TTL = 24 * 60 * 60 * 1000;
  var id = '', error = '', present = false, values = [];
  function valid(value) {
    return typeof value === 'string' && value.trim().length > 0 &&
      value.length <= 2048 && !/[\u0000-\u001f\u007f]/.test(value);
  }
  function forget() { try { root.sessionStorage.removeItem(KEY); } catch (_) {} }
  try {
    new URLSearchParams(root.location.search).forEach(function (value, key) {
      if (key.toLowerCase() === 'requestid') { present = true; values.push(value); }
    });
    if (present) {
      var first = values[0] || '';
      var conflicting = values.some(function (value) { return value !== first; });
      if (conflicting || (first && !valid(first))) {
        error = 'Please reopen the original referral link before submitting.';
        forget();
      } else if (valid(first)) {
        id = first;
        try { root.sessionStorage.setItem(KEY, JSON.stringify({id:id, at:Date.now()})); } catch (_) {}
      } else { forget(); }
    } else {
      var saved = null;
      try { saved = JSON.parse(root.sessionStorage.getItem(KEY) || 'null'); } catch (_) {}
      var age = saved ? Date.now() - saved.at : -1;
      if (saved && valid(saved.id) && typeof saved.at === 'number' && age >= 0 && age < TTL) id = saved.id;
      else forget();
    }
  } catch (_) { error = 'Please reopen the original referral link before submitting.'; }
  function render() {
    var input = root.document.querySelector('#refer-form input[name="RequestID"]');
    if (input) input.value = id;
  }
  root.FA_REFERRAL_REQUEST = {
    release: 'fa-referral-request-20261108-1',
    get: function () { return id; },
    error: function () { return error; }
  };
  if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', render);
  else render();
})(window);
