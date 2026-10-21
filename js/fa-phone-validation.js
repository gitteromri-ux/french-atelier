/* Uses full libphonenumber-js metadata; never constructs a CRM payload.
 * Browser: load the locally vendored libphonenumber-max.js before this file.
 * Reference: https://github.com/catamphetamine/libphonenumber-js
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('libphonenumber-js/max'));
  } else {
    root.FA_PHONE = factory(root.libphonenumber);
  }
}(typeof window !== 'undefined' ? window : globalThis, function (lib) {
  'use strict';
  function validate(raw, iso, options) {
    options = options || {};
    iso = String(iso || '').toUpperCase();
    if (!lib || typeof lib.parsePhoneNumberFromString !== 'function') {
      return { ok: false, reason: 'phone_validator_unavailable' };
    }
    if (!lib.isSupportedCountry(iso)) return { ok: false, reason: 'unknown_country' };
    var input = String(raw == null ? '' : raw).trim();
    // Formatting syntax only, NOT numbering rules. Reject prose, extensions,
    // extra plus signs and arbitrary characters rather than silently stripping.
    if (!input || !/^\+?[\d\s().-]+$/.test(input)) {
      return { ok: false, reason: 'phone_format' };
    }
    var phone;
    try {
      // Library owns national-prefix removal and country-code handling.
      phone = lib.parsePhoneNumberFromString(input, { defaultCountry: iso, extract: false });
    } catch (e) {
      return { ok: false, reason: 'phone_format' };
    }
    if (!phone || !phone.isValid() || phone.ext) {
      return { ok: false, reason: 'phone_invalid' };
    }
    if (phone.country !== iso) return { ok: false, reason: 'phone_country_mismatch' };
    // Mobile-entry policy: US/Canada often cannot distinguish mobile/fixed.
    // Accept the ambiguous type, not known fixed-line, VoIP, toll-free, etc.
    // Number-plan validation does not establish SMS delivery or ownership.
    var type = phone.getType();
    if (options.mobileOnly !== false && type !== 'MOBILE' && type !== 'FIXED_LINE_OR_MOBILE') {
      return { ok: false, reason: 'phone_not_mobile' };
    }
    return { ok: true, e164: phone.number };
  }
  function toE164(raw, iso, geo) {
    if (!geo || !geo.BY_ISO[iso]) return { ok: false, reason: 'unknown_country' };
    var result = validate(raw, iso);
    // Some NANP selectors display +1 plus the territory's area code.
    // Retry ONLY a seven-digit local subscriber number rejected as invalid.
    // Never repair an international number, wrong country, or non-mobile type.
    if (!result.ok && result.reason === 'phone_invalid' &&
        lib && lib.isSupportedCountry(iso)) {
      var dial = String(geo.BY_ISO[iso].dial || '');
      var input = String(raw == null ? '' : raw).trim();
      var local = input.replace(/[\s().-]/g, '');
      var callingCode = lib.getCountryCallingCode(iso);
      if (callingCode === '1' && /^1\d{3}$/.test(dial) &&
          /^\d{7}$/.test(local) && /^[\d\s().-]+$/.test(input)) {
        // Prefix comes from the existing visible UI dial, not invented digits.
        // Revalidation checks exact country, full numbering pattern and type.
        result = validate('+' + dial + local, iso);
      }
    }
    if (result.ok && iso === 'US') {
      // Preserve existing US state-map eligibility and return shape.
      var state = geo.NANP[result.e164.slice(2, 5)];
      if (!state) return { ok: false, reason: 'non_us_area_code' };
      result.state = state;
    }
    return result;
  }
  return { validate: validate, toE164: toE164 };
}));
