/* Culture Capsules mobile carousels: dots only. Scrolling is native CSS scroll-snap. */
(function () {
  'use strict';
  var mq = window.matchMedia ? window.matchMedia('(max-width: 767px)') : null;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function wire(track, dots, slidesFn) {
    if (!track || !dots.length) return null;
    function slides() { return slidesFn(); }
    function leftOf(el) { return el.offsetLeft - track.firstElementChild.offsetLeft; }
    function current() {
      var s = slides(), best = 0, d = Infinity, mid = track.scrollLeft + track.clientWidth / 2;
      s.forEach(function (el, i) { var c = el.offsetLeft + el.offsetWidth / 2 - track.offsetLeft; var x = Math.abs(c - mid); if (x < d) { d = x; best = i; } });
      return best;
    }
    function paint() { var i = current(); dots.forEach(function (b, k) { b.setAttribute('aria-current', k === i ? 'true' : 'false'); }); }
    function go(i, instant) {
      var el = slides()[i]; if (!el) return;
      var target = el.offsetLeft - track.offsetLeft - (track.clientWidth - el.offsetWidth) / 2;
      if (getComputedStyle(el).scrollSnapAlign.indexOf('start') === 0) target = leftOf(el);
      target = Math.max(0, Math.min(target, track.scrollWidth - track.clientWidth));
      if (instant || reduce) { var sb = track.style.scrollBehavior; track.style.scrollBehavior = 'auto'; track.scrollLeft = target; track.style.scrollBehavior = sb; }
      else track.scrollTo({ left: target, behavior: 'smooth' });
    }
    dots.forEach(function (b, k) { b.addEventListener('click', function () { go(k); }); });
    var raf = 0;
    track.addEventListener('scroll', function () { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; paint(); }); }, { passive: true });
    paint();
    return { go: go, paint: paint };
  }

  function visualOrder(list) {
    return list.slice().sort(function (a, b) { return a.offsetLeft - b.offsetLeft; });
  }

  /* themes */
  var th = document.querySelector('.cap-mthemes');
  var thC = th && wire(th.querySelector('[data-mcar-track]'), [].slice.call(th.querySelectorAll('.cap-mdot')), function () {
    return [].slice.call(th.querySelectorAll('.cap-mt-card'));
  });

  /* instructors */
  var fac = document.getElementById('capsule-teachers');
  var facC = fac && wire(fac.querySelector('.cap-faculty-grid'), [].slice.call(fac.querySelectorAll('.cap-mtdots .cap-mdot')), function () {
    return [].slice.call(fac.querySelectorAll('.cap-faculty-grid .cap-teacher'));
  });

  /* prices: dots are labelled 1 / 2 / 3 capsules; cards are ordered 1 / 2 / 3 on mobile by CSS */
  var off = document.getElementById('offers');
  var grid = off && off.querySelector('.kpz-grid');
  var pDots = off ? [].slice.call(off.querySelectorAll('.cap-mpdots .cap-mdot')) : [];
  var byPlan = function () {
    return pDots.map(function (b) { return off.querySelector('.kpz-card[data-plan="' + b.getAttribute('data-plan') + '"]'); }).filter(Boolean);
  };
  var priceC = grid && wire(grid, pDots, function () { return visualOrder(byPlan()); });

  var touched = false;
  if (grid) ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(function (ev) { grid.addEventListener(ev, function () { touched = true; }, { passive: true }); });
  pDots.forEach(function (b) { b.addEventListener('click', function () { touched = true; }); });

  function openOnBestValue() {
    if (!priceC || touched || !(mq && mq.matches)) return;
    var cards = visualOrder(byPlan()), idx = -1;
    cards.forEach(function (c, i) { if (c.getAttribute('data-plan') === 'capsule-3') idx = i; });
    if (idx >= 0) { priceC.go(idx, true); priceC.paint(); }
  }
  function refresh() { openOnBestValue(); if (thC) thC.paint(); if (facC) facC.paint(); }
  refresh();
  window.addEventListener('load', refresh);
  if (mq) { if (mq.addEventListener) mq.addEventListener('change', refresh); else if (mq.addListener) mq.addListener(refresh); }
})();
