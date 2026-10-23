/* Culture Capsules mobile sliders (2026-10-23): dots, open prices on "All three",
   and prices one section higher (before the films) on mobile only. Desktop untouched. */
(function () {
  var mq = window.matchMedia('(max-width: 767px)');
  var offers, watch, homeNext;

  function placeOffers() {
    offers = offers || document.getElementById('offers');
    watch = watch || document.getElementById('watch');
    if (!offers || !watch) return;
    if (homeNext === undefined) homeNext = offers.nextElementSibling; /* original position */
    if (mq.matches) {
      if (offers.nextElementSibling !== watch) watch.parentNode.insertBefore(offers, watch);
    } else if (homeNext && offers.nextElementSibling !== homeNext) {
      homeNext.parentNode.insertBefore(offers, homeNext);
    }
  }

  function centerOn(track, card) {
    if (!track || !card) return;
    var left = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
    track.scrollLeft = Math.max(0, left);
  }

  function dots(track, labelFor) {
    if (!track || track.getAttribute('data-fa-sl')) return;
    track.setAttribute('data-fa-sl', '1');
    var cards = [].slice.call(track.children);
    var nav = document.createElement('div');
    nav.className = 'fa-sl-dots';
    nav.setAttribute('aria-label', 'Choose a card');
    var btns = cards.map(function (card, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = labelFor ? labelFor(card, i) : '';
      if (!labelFor) b.setAttribute('aria-label', 'Card ' + (i + 1) + ' of ' + cards.length);
      b.addEventListener('click', function () {
        var left = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
        try { track.scrollTo({ left: left, behavior: 'smooth' }); } catch (e) { track.scrollLeft = left; }
      });
      nav.appendChild(b);
      return b;
    });
    track.parentNode.insertBefore(nav, track.nextSibling);
    function sync() {
      var mid = track.scrollLeft + track.clientWidth / 2, best = 0, bestD = 1e9;
      cards.forEach(function (c, i) { var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bestD) { bestD = d; best = i; } });
      btns.forEach(function (b, i) { b.setAttribute('aria-current', i === best ? 'true' : 'false'); });
    }
    track.addEventListener('scroll', function () { window.requestAnimationFrame(sync); }, { passive: true });
    sync();
    track._faSync = sync;
  }

  function planLabel(card) {
    var p = card.getAttribute('data-plan') || '';
    var n = p.replace('capsule-', '');
    return n === '1' ? '1 capsule' : (n + ' capsules');
  }

  var opened = false;
  function openOnAllThree() {
    if (!mq.matches) return;
    var track = document.querySelector('#offers .kpz-grid');
    var all = track && track.querySelector('[data-plan="capsule-3"]');
    if (!track || !all || !all.offsetWidth) return;
    centerOn(track, all);
    if (track._faSync) track._faSync();
    opened = Math.abs(track.scrollLeft - Math.max(0, all.offsetLeft - (track.clientWidth - all.offsetWidth) / 2)) < 4;
  }

  function init() {
    placeOffers();
    if (!mq.matches) return;
    dots(document.querySelector('#capsules .kps-cards'));
    dots(document.querySelector('#capsule-teachers .cap-faculty-grid'));
    dots(document.querySelector('#offers .kpz-grid'), planLabel);
    openOnAllThree();
    /* Android/iOS may reset scroll after images and fonts load: retry until it sticks. */
    [150, 500, 1200, 2500].forEach(function (t) { setTimeout(function () { if (!opened) openOnAllThree(); }, t); });
    window.addEventListener('load', function () { opened = false; openOnAllThree(); });
    var offersEl = document.getElementById('offers');
    if (offersEl && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { var t = document.querySelector('#offers .kpz-grid'); if (t && t.scrollLeft < 2) openOnAllThree(); io.disconnect(); } });
      }, { rootMargin: '200px 0px' });
      io.observe(offersEl);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  try { mq.addEventListener('change', function () { placeOffers(); init(); }); } catch (e) {}
})();
