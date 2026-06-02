/* ============================================================
   MAPSTR — "Your Authentic French Journey to Fluency"
   Self-contained IIFE. No globals beyond window.Mapstr (idempotent).
   Drives: SVG route draw, comet, cinematic camera pan/zoom,
   region glow, story-card crossfade, chapter rail, progress meter.
   Respects prefers-reduced-motion. Mobile = tap accordion.
   ============================================================ */
(function () {
  'use strict';
  if (window.__mapstrInit) return;
  window.__mapstrInit = true;

  function init() {
    var fold = document.getElementById('mapstr');
    if (!fold) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mqMobile = window.matchMedia('(max-width: 880px)');

    // ----- element refs -----
    var scroller = fold.querySelector('[data-scroller]');
    var camera   = fold.querySelector('[data-camera]');
    var routeEl  = fold.querySelector('[data-route]');
    var cometG   = fold.querySelector('[data-comet]');
    var meterEl  = fold.querySelector('[data-meter]');
    var stops    = Array.prototype.slice.call(fold.querySelectorAll('.mp-stop'));
    var cards    = Array.prototype.slice.call(fold.querySelectorAll('.mp-card'));
    var pois     = Array.prototype.slice.call(fold.querySelectorAll('.mp-poi'));
    var glows    = Array.prototype.slice.call(fold.querySelectorAll('.mp-region-glow'));
    var poiByCity = {};
    pois.forEach(function (p) { poiByCity[p.getAttribute('data-poi')] = p; });
    var glowByCity = {};
    glows.forEach(function (g) { glowByCity[g.getAttribute('data-glow')] = g; });

    // city for each stop (from card portrait alt / matching rail order)
    // derive from the mobile list (has data-city) to stay in sync
    var mstops = Array.prototype.slice.call(fold.querySelectorAll('.mp-m-stop'));
    var stopCity = mstops.map(function (m) { return m.getAttribute('data-city'); });
    var N = stops.length;

    // ----- route geometry -----
    var routeLen = 1;
    if (routeEl && routeEl.getTotalLength) {
      try { routeLen = routeEl.getTotalLength(); } catch (e) { routeLen = 1; }
      routeEl.style.strokeDasharray = routeLen;
      routeEl.style.strokeDashoffset = routeLen;
    }

    // progress (0..1) at which each stop is "reached" — even spacing with a lead-in
    var stopAt = [];
    for (var i = 0; i < N; i++) stopAt.push((i + 0.5) / N);

    // ----- camera target per stop (pan map so the city sits center-ish, zoom in) -----
    // The .mp-map svg viewBox is 1000x1000 centered in .mp-camera (inset:0).
    // We compute a transform that places the city near center at a zoom level.
    var cityXY = {
      strasbourg:[898.3,317.4], paris:[541.3,291.4], westparis:[511.6,296.2],
      lyon:[705.2,589.1], pau:[361.5,826.2], montpellier:[642.5,796.3], nice:[866.5,787.6]
    };

    function cameraFor(stopIdx) {
      // first stop = wide establishing shot, later stops zoom in gently
      var city = stopCity[stopIdx];
      var p = cityXY[city] || [500,500];
      // normalized 0..1 position of city in the 1000 box
      var nx = p[0] / 1000, ny = p[1] / 1000;
      var wrap = camera.parentElement; // .mp-mapwrap
      var w = wrap.clientWidth, h = wrap.clientHeight;
      // map element occupies min(86%,760) of wrap width, square, centered
      var mapW = Math.min(w * 0.86, 760);
      var mapLeft = (w - mapW) / 2, mapTop = (h - mapW) / 2;
      // zoom ramps from 1.0 (establish) to ~1.85 by the finale
      var zoom = 1.05 + (stopIdx / (N - 1)) * 0.8;
      // city pixel position within wrap (pre-transform)
      var cityPx = mapLeft + nx * mapW;
      var cityPy = mapTop + ny * mapW;
      // we want, after scaling about origin (0,0), city to land at the focal point
      var focalX = w * 0.42; // slightly left of center (cards sit bottom-right)
      var focalY = h * 0.46;
      var tx = focalX - cityPx * zoom;
      var ty = focalY - cityPy * zoom;
      return 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + zoom.toFixed(3) + ')';
    }

    // ----- apply a stop state (cards, rail, pois, glow, camera) -----
    var current = -1;
    function setStop(idx, fromScroll) {
      idx = Math.max(0, Math.min(N - 1, idx));
      if (idx === current) return;
      current = idx;
      var city = stopCity[idx];

      cards.forEach(function (c, j) { c.classList.toggle('is-active', j === idx); });
      stops.forEach(function (s, j) {
        s.classList.toggle('is-active', j === idx);
        s.classList.toggle('is-done', j < idx);
      });
      // POIs: light the active city, mark passed cities done
      pois.forEach(function (p) {
        var pc = p.getAttribute('data-poi');
        var firstIdxForCity = stopCity.indexOf(pc);
        p.classList.toggle('is-lit', pc === city);
        p.classList.toggle('is-done', firstIdxForCity < idx && pc !== city);
      });
      glows.forEach(function (g) {
        g.classList.toggle('is-on', g.getAttribute('data-glow') === city);
      });
      if (camera && !reduce && !mqMobile.matches) {
        camera.style.transform = cameraFor(idx);
      }
    }

    // ----- continuous scroll progress (route draw, comet, meter) -----
    function onScroll() {
      if (!scroller || mqMobile.matches) return;
      var rect = scroller.getBoundingClientRect();
      var vh = window.innerHeight;
      var total = scroller.offsetHeight - vh;
      var prog = total > 0 ? (-rect.top) / total : 0;
      prog = Math.max(0, Math.min(1, prog));

      // draw route 1:1 with progress
      if (routeEl) routeEl.style.strokeDashoffset = (routeLen * (1 - prog)).toFixed(1);
      // comet position
      if (cometG && routeEl && routeEl.getPointAtLength) {
        try {
          var pt = routeEl.getPointAtLength(routeLen * prog);
          cometG.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ',' + pt.y.toFixed(1) + ')');
          cometG.style.opacity = (prog > 0.001 && prog < 0.999) ? 1 : 0;
        } catch (e) {}
      }
      // meter
      if (meterEl) meterEl.style.width = (prog * 100).toFixed(1) + '%';

      // active stop = nearest stopAt boundary below progress
      var idx = 0;
      for (var i = 0; i < N; i++) { if (prog >= (i / N)) idx = i; }
      setStop(idx, true);
    }

    var ticking = false;
    function reqScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { onScroll(); ticking = false; });
    }

    // ----- rail / poi click → scroll to that stop -----
    function scrollToStop(idx) {
      if (mqMobile.matches || !scroller) { setStop(idx); return; }
      var vh = window.innerHeight;
      var total = scroller.offsetHeight - vh;
      var targetProg = (idx + 0.45) / N; // land mid-stop
      var top = scroller.offsetTop + targetProg * total;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    }
    stops.forEach(function (s, j) {
      s.addEventListener('click', function () { scrollToStop(j); });
    });
    pois.forEach(function (p) {
      p.addEventListener('click', function () {
        var c = p.getAttribute('data-poi');
        var idx = stopCity.indexOf(c);
        if (idx >= 0) scrollToStop(idx);
      });
    });

    // ----- mobile accordion -----
    mstops.forEach(function (m, j) {
      m.addEventListener('click', function () {
        var open = m.classList.contains('is-open');
        mstops.forEach(function (o) { o.classList.remove('is-open'); o.setAttribute('aria-expanded', 'false'); });
        if (!open) { m.classList.add('is-open'); m.setAttribute('aria-expanded', 'true'); }
        // light up the mobile map poi
        var city = m.getAttribute('data-city');
        fold.querySelectorAll('.mp-mobile .mp-poi').forEach(function (p) {
          p.classList.toggle('is-lit', p.getAttribute('data-poi') === city);
        });
        fold.querySelectorAll('.mp-mobile .mp-region-glow').forEach(function (g) {
          g.classList.toggle('is-on', g.getAttribute('data-glow') === city);
        });
      });
    });
    // init mobile: light first
    (function () {
      var first = mstops[0];
      if (first) {
        var city = first.getAttribute('data-city');
        fold.querySelectorAll('.mp-mobile .mp-poi').forEach(function (p) {
          p.classList.toggle('is-lit', p.getAttribute('data-poi') === city);
        });
      }
      // draw mobile route fully (static)
      var mroute = fold.querySelector('[data-mroute]');
      if (mroute) { mroute.style.strokeDasharray = 'none'; mroute.style.strokeDashoffset = '0'; }
    })();

    // ----- reduced motion: reveal all statically -----
    function applyReduced() {
      if (routeEl) { routeEl.style.strokeDashoffset = '0'; }
      if (cometG) cometG.style.opacity = 0;
      // show all cards stacked? No — keep first active, let rail clicks switch instantly.
      setStop(0);
    }

    // ----- boot -----
    if (reduce) {
      applyReduced();
      stops.forEach(function (s, j) { s.addEventListener('click', function () { setStop(j); }); });
    } else if (!mqMobile.matches) {
      window.addEventListener('scroll', reqScroll, { passive: true });
      window.addEventListener('resize', function () { current = -1; reqScroll(); }, { passive: true });
      onScroll();
      setStop(0);
    } else {
      // mobile: nothing scroll-driven
    }

    // Re-evaluate on breakpoint change
    mqMobile.addEventListener('change', function () {
      current = -1;
      if (!mqMobile.matches && !reduce) { onScroll(); setStop(0); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
