/* French Atelier — self-service checkout configuration.
 * Separate from the lead-gen forms (js/eteacher-leads.js is NOT touched).
 * Mirrors the proven Longevity engine: staged lead -> AddNewECommerceLeadAndOrder
 * -> GetECommerceFirstPaymentDetails -> Airwallex Drop-In (card) or PayPal — no Apple Pay / Google Pay -> SetECommercePayment. ProductID 25 is forced by the relay.
 *
 * ENVIRONMENT: production by default. ?env=staging (or github.io / localhost)
 * targets the eTeacher STAGING CRM + Airwallex demo — no real money.
 *
 * CRM COURSE IDENTITY: the FA course ids below MUST come from eTeacher
 * (MainAbroadCourseId / AbroadCourseId / PreferredCourseId / CampusId / LanguageId
 * for each French Atelier course and each Culture Capsule). Until they are set,
 * production checkout runs in "reserve" mode: it captures the enrollment as a
 * ProductID-25 lead through the proven leads relay (with the chosen product, plan
 * and amount in AdminNotes) and no card is charged. In staging the Longevity
 * staging placeholder is used ONLY to exercise the payment pipe (fake money).
 */
(function () {
  'use strict';
  var qs = new URLSearchParams(location.search);
  var host = location.hostname;
  var env = (qs.get('env') === 'staging' || /github\.io$|vercel\.app$|^localhost$|^127\./.test(host)) ? 'staging' : 'production';
  try {
    sessionStorage.removeItem('fa_ck_env');
    if (env === 'staging' && !/\/enroll-checkout(?:\.html)?$/.test(location.pathname)) document.addEventListener('DOMContentLoaded', function () {
      var note = document.createElement('div');
      note.setAttribute('role', 'alert');
      note.textContent = 'TEST MODE: no real enrollment or payment. Do not enter real customer details.';
      note.style.cssText = 'position:relative;z-index:100000;background:#ffe49a;color:#171717;padding:12px;text-align:center;font:700 15px/1.4 sans-serif';
      document.body.prepend(note);
    });
  } catch (e) {}

  /* No placeholder course: French Atelier orders only ever bind to French Atelier CRM courses (levels 254-257, capsules 267-270). */
  var STAGING_PIPE_PLACEHOLDER = null;

  window.FA_ECOMM_CONFIG = {
    env: env,
    relayBase: 'https://fa-leads-proxy.vercel.app',
    leadsEndpoint: 'https://fa-leads-proxy.vercel.app/leads/production',
    productId: 25,
    currency: 'USD',
    brand: 'The French Atelier by Acadomia',
    advisorEmail: 'advisor@eTeacherGroup.com',
    paypalClientId: 'AXL1tqJTVoHQ2RltFz9SUVu8EM5ZTKDLCviVev-lOPQEEX1ScBii9d5MSo3_dxGjemVjTQJr7hpztwkQ', /* eTeacher PayPal (same merchant as the CRM's Airwallex) */
    metaPixelId: '4075596186030950', /* French Atelier pixel (ETeacher Group business) — the pixel the FA Sales ad sets optimise on. NEVER the Longevity pixel. */
    capiEndpoint: 'https://fa-leads-proxy.vercel.app/api/meta/capi',
    acEventEndpoint: 'https://fa-leads-proxy.vercel.app/api/ac/event',
    checkoutPage: 'enroll-checkout.html',

    /* Course levels sold on the homepage / course pages. CRM AbroadCourseIDs from the eTeacher admin (2026-10-20). */
    levels: {
      foundation:   { name: 'FA Foundation',   cefr: 'A0 → A1.1',   route: 'Paris',                         page: 'courses/fa-foundation.html', crm: { abroadCourseId: 1768, studyGroupAbroadCourseId: 1737, mainAbroadCourseId: 254, preferredCourseId: null, semesterId: null, campusId: null } },
      beginner:     { name: 'FA Beginner',     cefr: 'A1.1 → A1.2', route: 'Normandy to Paris',             page: 'courses/fa-beginner.html', crm: { abroadCourseId: 1770, studyGroupAbroadCourseId: 1738, mainAbroadCourseId: 255, preferredCourseId: null, semesterId: null, campusId: null } },
      elementary:   { name: 'FA Elementary',   cefr: 'A1.2 → A2.1', route: 'Loire · Bordeaux · Basque',     page: 'courses/fa-elementary.html', crm: { abroadCourseId: 1772, studyGroupAbroadCourseId: 1808, mainAbroadCourseId: 256, preferredCourseId: null, semesterId: null, campusId: null } },
      intermediate: { name: 'FA Intermediate', cefr: 'A2.1 → A2.2', route: 'Marseille · Chamonix · Alsace', page: 'courses/fa-intermediate.html', crm: { abroadCourseId: 1773, studyGroupAbroadCourseId: 1809, mainAbroadCourseId: 257, preferredCourseId: null, semesterId: null, campusId: null } }
    },
    /* Course facts shown in the checkout (source: how-it-works.html, faq.html, course pages). */
    courseFacts: [
      ['Format', '20 live lessons · one class a week'],
      ['Lesson', '85 minutes · live from France'],
      ['Group', 'Small groups of 10–12 learners'],
      ['Class times', 'Sunday to Friday · matched to your timezone'],
      ['Certificate', 'CEFR-aligned certificate by Acadomia + $100 in credits'],
      ['Recordings', 'Every lesson recorded · on-demand in your dashboard']
    ],
    capsuleFacts: [
      ['Format', '10 live one-hour classes · once a week'],
      ['Speaker', 'Bilingual signature speaker · 15–20 min Q&A'],
      ['Language', 'No French required'],
      ['Platform', 'Live on Zoom · 10 weeks, one class a week']
    ],
    /* Promo codes shown in the top strip. Display-level pricing; the CRM price plan is the charge of record. */
    promos: {
      CAPSULE20: { pct: 20, applies: ['capsule-1', 'capsule-2', 'capsule-3'], label: '20% off any Culture Capsules package', days: 7 },
      /* Private end-to-end attribution test (Omri, 2026-10-23). Not shown anywhere on the site; expires automatically. */
      TEST: { pct: 99, applies: ['capsule-1', 'capsule-2', 'capsule-3'], label: 'Internal test', days: 1, until: 1792711138000 }
    },
    classTimes: ['Weekday evenings (my timezone)', 'Weekday mornings or midday', 'Weekend', 'Any — next available start'],
    phone: '+1-888-230-5110',

    /* Culture Capsules — three thematic packs, 10 live one-hour Zoom classes each, once a week. */
    capsules: {
      /* eTeacher CRM course records (supplied by Omri 2026-10-20). Campus 4204 = Culture Capsules. */
      'fashion-art':  { name: 'Fashion & Art',      tagline: 'French aesthetics',   status: 'Starts Sunday, December 6, 2026 · 1:00 pm EST · 6:00 pm GMT · 10:00 am PST · live on Zoom', start: 'Sunday, December 6, 2026 · 1:00 pm EST · 6:00 pm GMT · 10:00 am PST',
                        crm: { mainAbroadCourseId: 267, abroadCourseId: 1798, preferredCourseId: 170581, semesterId: 2268, campusId: 4204, groupNum: 6, mainGroupId: 4202 } },
      'gastronomy':   { name: 'Gastronomy & Wine',  tagline: 'Terroir on the plate', status: 'Starts Sunday, December 6, 2026 · 2:30 pm EST · 7:30 pm GMT · 11:30 am PST · live on Zoom', start: 'Sunday, December 6, 2026 · 2:30 pm EST · 7:30 pm GMT · 11:30 am PST',
                        crm: { mainAbroadCourseId: 270, abroadCourseId: 1807, preferredCourseId: 170256, semesterId: 2268, campusId: 4204, groupNum: 3, mainGroupId: 4202 } },
      'cinema-music': { name: 'Cinema & Music',     tagline: 'Screens and songs',    status: 'Starts Sunday, January 10, 2027 · 12:00 pm EST · 5:00 pm GMT · 9:00 am PST · live on Zoom', start: 'Sunday, January 10, 2027 · 12:00 pm EST · 5:00 pm GMT · 9:00 am PST',
                        crm: { mainAbroadCourseId: 269, abroadCourseId: 1806, preferredCourseId: 170258, semesterId: 2381, campusId: 4204, groupNum: 4, mainGroupId: 4202 } }
    },

    /* OFFERS. Amounts are the ONLY source of truth for what the page shows; the
       engine refuses to mount a payment form unless the CRM's AmountToCharge and
       number of payments match the chosen offer exactly. */
    products: {
      'fa-course': {
        kind: 'course',
        title: 'The French Atelier — 20 live lessons',
        offerLabel: '$89 today · then 4 × $199 · $885 total · 28% off the $1,235 CRM list price',
        /* CRM e-commerce plan for ProductID 25 (verified staging+production 2026-10-20): list $1,235 -> order $885 = $89 today + 4 x $199 (28% off). numberOfPayments counts the first payment. */
        listMonthly: 308.75, listTotal: 1235, numberOfPayments: 5,
        monthly: 199, firstPayment: 89, total: 885, pct: 28,
        includes: ['20 live lessons · 85 minutes each', 'First 2 weeks free · cancel within 14 days for a full refund', 'Cancel anytime after that · no further payments', 'Certified native French teachers, live from France', 'Small groups of 10–12 learners', 'Julien, your 24/7 AI French tutor', 'Lifetime access to lesson recordings', 'CEFR-aligned certificate by Acadomia + $100 in credits'],
        crmCourse: null
      },
      'fa-course-full': {
        kind: 'course',
        title: 'The French Atelier — 20 live lessons · paid in full',
        offerLabel: 'Pay in full · $799 once · 35% off · study groups included',
        listMonthly: 1235, listTotal: 1235, numberOfPayments: 1,
        monthly: 799, firstPayment: 799, total: 799, pct: 35,
        includes: ['20 live lessons · 85 minutes each', 'Twice-weekly study groups included', 'Certified native French teachers, live from France', 'Small groups of 10–12 learners', 'Julien, your 24/7 AI French tutor', 'Lifetime access to lesson recordings', 'CEFR-aligned certificate by Acadomia + $100 in credits'],
        crmCourse: null
      },
      'capsule-1': {
        kind: 'capsules', packs: 1,
        title: '1 Culture Capsule',
        offerLabel: '3 monthly payments of $99 · $297 total · 41% off the $500 CRM list price',
        /* CRM list (USA, no trial) $500 per capsule, max 44% off. 297 = 40.6% off. */
        listTotal: 500, numberOfPayments: 3, monthly: 99, firstPayment: 99, total: 297, pct: 41, perCapsule: 99,
        includes: ['10 live one-hour classes on Zoom', 'Bilingual signature speaker', '15–20 minutes of questions after each class', 'No French required', 'Sold independently of the language courses'],
        crmCourse: null
      },
      'capsule-2': {
        kind: 'capsules', packs: 2,
        title: '2 Culture Capsules',
        offerLabel: '3 monthly payments of $178 · $89 per capsule',
        numberOfPayments: 3, monthly: 178, firstPayment: 178, total: 534, perCapsule: 89,
        includes: ['20 live one-hour classes on Zoom', 'Bilingual signature speakers', 'Each capsule at $89 a month instead of $99', 'No French required', 'Sold independently of the language courses'],
        crmCourse: null
      },
      'capsule-3': {
        kind: 'capsules', packs: 3,
        title: 'All 3 Culture Capsules',
        offerLabel: '3 monthly payments of $189 · $63 per capsule',
        numberOfPayments: 3, monthly: 189, firstPayment: 189, total: 567, perCapsule: 63,
        includes: ['30 live one-hour classes on Zoom', 'Fashion & Art · Gastronomy & Wine · Cinema & Music', 'Every capsule at $63 a month instead of $99', 'No French required', 'Sold independently of the language courses'],
        crmCourse: null
      },
      'membership-12': {
        kind: 'membership',
        title: 'Atelier Membership — 12 months',
        offerLabel: 'Best value · $99 a month for 12 months',
        numberOfPayments: 12, monthly: 99, firstPayment: 99, total: 1188,
        includes: ['1 French Atelier language course (one of our 4 levels)', 'All 3 Culture Capsules — 30 classes', 'The Atelier Benefits hub: ~10% at partner French restaurants, 15% on famous macarons, travel-in-France perks', 'Julien, your 24/7 AI French tutor', 'Private community & cultural resources'],
        crmCourse: null
      }
    },

    stagingPipePlaceholder: STAGING_PIPE_PLACEHOLDER
  };
})();
