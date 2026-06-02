/* ============================================================
   MAPSTR SIGNATURE FOLD — scroll-driven journey logic
   - IntersectionObserver per chapter panel
   - requestAnimationFrame camera + route-draw + traveling comet
   - per-course color via [data-course] on the fold (sets --c-* vars)
   - respects prefers-reduced-motion · keyboard + aria
   ============================================================ */
(function () {
  'use strict';
  var fold = document.querySelector('[data-mp]');
  if (!fold) return;

  var DATA;
  try { DATA = JSON.parse(fold.getAttribute('data-mp-json')); }
  catch (e) { return; }

  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var mqMobile = window.matchMedia('(max-width:880px)');

  /* per-course color tokens (mirror of fa.css [data-course]) so we can
     set them on the fold as the active chapter changes */
  var COLORS = {};
  DATA.cam.forEach(function (c) {
    COLORS[c.id] = { bg: c.bg, accent: c.accent, tint: c.tint };
  });
  function glow(hex, a) {
    var h = hex.replace('#', '');
    var r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }
  function applyColor(id) {
    var c = COLORS[id]; if (!c) return;
    fold.style.setProperty('--c-bg', c.bg);
    fold.style.setProperty('--c-accent', c.accent);
    fold.style.setProperty('--c-tint', c.tint);
    fold.style.setProperty('--c-glow', glow(c.accent, .34));
    fold.setAttribute('data-course', id);
  }

  /* ---------- DESKTOP ---------- */
  var camera = fold.querySelector('[data-camera]');
  var routeEl = fold.querySelector('[data-route]');
  var cometG = fold.querySelector('[data-comet]');
  var meter = fold.querySelector('[data-meter]');
  var glowEl = fold.querySelector('[data-glow]');
  var stops = Array.prototype.slice.call(fold.querySelectorAll('.mp-stop'));
  var cards = Array.prototype.slice.call(fold.querySelectorAll('.mp-card'));
  var pois = Array.prototype.slice.call(fold.querySelectorAll('.mp-scroller .mp-poi'));
  var panels = Array.prototype.slice.call(fold.querySelectorAll('.mp-panel'));

  var routeLen = routeEl ? routeEl.getTotalLength() : 0;
  if (routeEl) {
    routeEl.style.strokeDasharray = routeLen;
    routeEl.style.strokeDashoffset = routeLen;
  }

  var N = DATA.cam.length;
  var active = -1;
  var targetOffset = routeLen;     // route draw target (animated)
  var curOffset = routeLen;
  var targetCam = { x: 500, y: 500, z: 1 };
  var curCam = { x: 500, y: 500, z: 1 };

  function chapterProgressFrac(i) {
    // fraction of total route drawn at END of chapter i
    return DATA.seg[i] / (DATA.total - 1);
  }

  function setChapter(i, instant) {
    if (i === active) return;
    active = i;
    var c = DATA.cam[i];
    applyColor(c.id);

    // rail
    stops.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
    // cards
    cards.forEach(function (cd, k) {
      var on = k === i;
      cd.classList.toggle('is-active', on);
      cd.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    // pois: active highlighted, earlier dimmed-on, later dim
    pois.forEach(function (p, k) {
      p.classList.toggle('is-active', k === i);
      p.classList.toggle('is-dim', k > i);
    });
    // region glow follows active pin
    if (glowEl) {
      glowEl.setAttribute('cx', c.x);
      glowEl.setAttribute('cy', c.y);
      glowEl.classList.add('is-on');
    }
    if (cometG) cometG.classList.add('is-on');

    // camera target: center the pin, zoom in
    var z = c.zoom || 1.9;
    targetCam = { x: c.x, y: c.y, z: z };
    // route draw target
    targetOffset = routeLen * (1 - chapterProgressFrac(i));

    // meter
    if (meter) meter.style.width = (chapterProgressFrac(i) * 100).toFixed(1) + '%';

    if (instant || reduce) { snapCam(); }
  }

  function snapCam() {
    curCam.x = targetCam.x; curCam.y = targetCam.y; curCam.z = targetCam.z;
    curOffset = targetOffset;
    drawCam(); drawRoute();
    placeComet(1 - curOffset / routeLen);
  }

  function drawCam() {
    if (!camera) return;
    // translate so (x,y) maps to viewBox center 500,500 then scale
    var z = curCam.z;
    var tx = (500 - curCam.x) / 1000 * 100;
    var ty = (500 - curCam.y) / 1000 * 100;
    camera.style.transform =
      'scale(' + z + ') translate(' + tx + '%,' + ty + '%)';
  }
  function drawRoute() {
    if (routeEl) routeEl.style.strokeDashoffset = curOffset;
  }
  function placeComet(frac) {
    if (!cometG || !routeEl) return;
    frac = Math.max(0, Math.min(1, frac));
    var pt = routeEl.getPointAtLength(frac * routeLen);
    cometG.setAttribute('transform', 'translate(' + pt.x + ',' + pt.y + ')');
  }

  var rafId = null;
  function tick() {
    rafId = null;
    var e = 0.12;
    curCam.x += (targetCam.x - curCam.x) * e;
    curCam.y += (targetCam.y - curCam.y) * e;
    curCam.z += (targetCam.z - curCam.z) * e;
    curOffset += (targetOffset - curOffset) * e;
    drawCam(); drawRoute();
    placeComet(1 - curOffset / routeLen);
    var moving = Math.abs(targetCam.x - curCam.x) > .4 ||
      Math.abs(targetCam.y - curCam.y) > .4 ||
      Math.abs(targetCam.z - curCam.z) > .002 ||
      Math.abs(targetOffset - curOffset) > .6;
    if (moving) schedule();
  }
  function schedule() { if (rafId == null) rafId = requestAnimationFrame(tick); }

  // IntersectionObserver: which chapter panel is centered
  if ('IntersectionObserver' in window && panels.length) {
    var io = new IntersectionObserver(function (entries) {
      var best = null;
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          if (!best || en.intersectionRatio > best.intersectionRatio) best = en;
        }
      });
      if (best) {
        var idx = parseInt(best.target.getAttribute('data-panel'), 10);
        setChapter(idx);
        if (!reduce) schedule();
      }
    }, { threshold: [.5], rootMargin: '-20% 0px -20% 0px' });
    panels.forEach(function (p) { io.observe(p); });
  }

  // rail click → scroll to that panel
  stops.forEach(function (s) {
    s.addEventListener('click', function () {
      var idx = parseInt(s.getAttribute('data-stop'), 10);
      var panel = panels[idx];
      if (panel) panel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    });
    s.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); focusStop(active + 1); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); focusStop(active - 1); }
    });
  });
  function focusStop(i) {
    if (i < 0 || i >= stops.length) return;
    stops[i].focus();
    var panel = panels[i];
    if (panel) panel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  }

  // init
  applyColor(DATA.cam[0].id);
  setChapter(0, true);

  /* ---------- MOBILE ACCORDION ---------- */
  var maccordion = fold.querySelector('[data-maccordion]');
  if (maccordion) {
    var mstops = Array.prototype.slice.call(maccordion.querySelectorAll('.mp-m-stop'));
    function setMobileColor(stopEl) {
      var id = stopEl.getAttribute('data-course');
      var c = COLORS[id]; if (!c) return;
      stopEl.style.setProperty('--c-bg', c.bg);
      stopEl.style.setProperty('--c-accent', c.accent);
      stopEl.style.setProperty('--c-tint', c.tint);
      stopEl.style.setProperty('--c-glow', glow(c.accent, .34));
    }
    mstops.forEach(function (st) {
      setMobileColor(st);
      var head = st.querySelector('.mp-m-head');
      head.addEventListener('click', function () {
        var open = st.classList.contains('is-open');
        mstops.forEach(function (o) {
          o.classList.remove('is-open');
          o.querySelector('.mp-m-head').setAttribute('aria-expanded', 'false');
        });
        if (!open) {
          st.classList.add('is-open');
          head.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }
})();
