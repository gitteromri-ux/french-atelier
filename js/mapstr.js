/* ============================================================
   MAPSTR MAP ENGINE — The French Atelier by Acadomia  v4.2 (2026)
   3 FA courses only: Foundation (Paris), Beginner (Normandy→Paris),
   Elementary (Loire→Bordeaux→Basque)

   PUBLIC API:
     window.Mapstr.mount(target)    target: CSS selector or Element
     window.Mapstr.data             course data array
   Auto-mounts into #mapstr-mount on DOMContentLoaded.
   ============================================================ */
(function () {
  'use strict';

  /* ── COORDINATE SYSTEM ─────────────────────────────────────
     France bounding box → SVG 560×680
  ─────────────────────────────────────────────────────────── */
  var VW = 560, VH = 680;
  var LAT_N = 51.15, LAT_S = 42.25;
  var LNG_W = -5.15, LNG_E = 8.30;

  function lngToX(lng) { return ((lng - LNG_W) / (LNG_E - LNG_W)) * VW; }
  function latToY(lat) { return ((LAT_N - lat) / (LAT_N - LAT_S)) * VH; }
  function pt(lat, lng) { return lngToX(lng).toFixed(1) + ',' + latToY(lat).toFixed(1); }

  /* ── FRANCE OUTLINE ─────────────────────────────────────── */
  var FRANCE_PATH = (function() {
    var o = [
      [51.09,2.55],[51.05,2.10],[50.95,1.83],[50.72,1.56],
      [50.40,1.63],[50.07,1.57],[49.93,0.50],[49.70,0.20],
      [49.68,-1.03],[49.68,-1.43],[49.39,-1.78],
      [48.72,-1.85],[48.63,-2.02],[48.65,-2.35],
      [48.55,-3.15],[48.46,-4.75],[47.85,-4.45],
      [47.78,-4.23],[47.50,-2.77],[47.34,-2.45],
      [47.28,-2.53],[47.27,-2.23],[47.20,-2.05],
      [47.00,-2.02],[46.50,-1.75],[46.30,-1.30],
      [46.27,-1.15],[45.80,-1.08],[45.68,-1.05],
      [45.58,-1.10],[45.20,-1.13],[44.95,-1.18],
      [44.67,-1.25],[44.42,-1.14],[43.88,-1.38],
      [43.66,-1.53],
      [43.37,-1.79],[43.28,-1.20],[43.15,-0.25],
      [42.56,0.73],[42.43,1.73],[42.48,2.93],
      [42.50,3.10],
      [43.05,3.05],[43.18,3.22],[43.40,3.68],
      [43.50,3.87],[43.53,4.26],[43.30,5.10],
      [43.16,5.78],[43.27,6.68],[43.55,7.02],
      [43.70,7.42],[43.78,7.55],
      [44.38,7.20],[44.98,6.65],[45.93,6.88],
      [46.38,6.90],
      [46.88,6.05],[47.50,6.10],[47.68,7.55],
      [47.95,7.62],[48.68,7.90],[48.85,7.98],
      [49.47,6.37],[50.18,6.35],[50.50,4.85],
      [50.75,3.38],[51.09,2.55]
    ];
    return 'M ' + o.map(function(p){return pt(p[0],p[1]);}).join(' L ') + ' Z';
  })();

  var CORSICA_PATH = (function(){
    var c = [[43.02,9.35],[42.60,9.55],[41.38,9.22],[41.37,8.54],[42.03,8.54],[42.68,9.05],[43.02,9.35]];
    return 'M ' + c.map(function(p){return pt(p[0],p[1]);}).join(' L ') + ' Z';
  })();

  /* ── COURSE IMAGES ─────────────────────────────────────── */
  var COURSE_IMAGES = {
    'fa-foundation': 'assets/juliane/juliane-tshirt.jpg',
    'fa-beginner':   'assets/juliane/juliane-tshirt.jpg',
    'fa-elementary': 'assets/juliane/juliane-tshirt.jpg'
  };

  /* ── STAR FIELD ─────────────────────────────────────────── */
  var STARS = (function(){
    var a=[], r=function(s){return((s*9301+49297)%233280)/233280;};
    for(var i=0;i<50;i++) a.push({x:r(i*7+1)*100,y:r(i*13+3)*100,r:r(i*3+5)*1.5+0.4,delay:r(i*11+7)*3,dur:r(i*17+9)*2+2.5});
    return a;
  })();

  /* ── PIN POSITION OVERRIDE (FA Foundation: Paris inset zoom) ──
     Since all Paris locations are within ~3km of each other,
     they'd overlap on the France scale. We use a dedicated
     Paris inset with spread-out positions for FA Foundation.
     Other courses use real coordinates since their cities are far apart.
  ────────────────────────────────────────────────────────── */

  /* Paris inset area: center of Paris is at SVG ~(311, 175).
     We'll spread pins around this center in an organic pattern.
     These are SVG coordinate offsets from Paris center (311, 175).
     The inset visually "zooms in" on Paris with its own coordinate space. */
  var PARIS_CENTER_X = 311, PARIS_CENTER_Y = 175;

  // Organic spread positions for 12 Paris pins (in SVG coords)
  var PARIS_PIN_POSITIONS = {
    'eiffel':         [299, 178],
    'alma-cafe':      [305, 172],
    'bakery-16':      [295, 176],
    'bouillon-chartier': [317, 169],
    'palais-royal':   [311, 171],
    'pont-des-arts':  [308, 177],
    'pantheon':       [313, 183],
    'jardin-luxembourg': [307, 182],
    'coulée-verte':   [320, 181],
    'bastille':       [318, 180],
    'montmartre':     [313, 164],
    'canal-saint-martin': [318, 170]
  };

  /* ─────────────────────────────────────────────────────────
     SVG BUILDER
  ───────────────────────────────────────────────────────── */
  function buildDefs(rc) {
    return '<defs>' +
      '<linearGradient id="mg-land" x1="0.2" y1="0" x2="0.8" y2="1">' +
        '<stop offset="0%" stop-color="#0F2268"/>' +
        '<stop offset="45%" stop-color="#0B1C56"/>' +
        '<stop offset="100%" stop-color="#08123A"/>' +
      '</linearGradient>' +
      '<radialGradient id="mg-glow" cx="50%" cy="45%" r="58%">' +
        '<stop offset="0%" stop-color="#1E3A8A" stop-opacity="0.55"/>' +
        '<stop offset="100%" stop-color="#000034" stop-opacity="0"/>' +
      '</radialGradient>' +
      '<filter id="mf-land" x="-8%" y="-8%" width="116%" height="116%">' +
        '<feGaussianBlur in="SourceAlpha" stdDeviation="14" result="b"/>' +
        '<feColorMatrix in="b" type="matrix" values="0.5 0.4 0.15 0 0  0.4 0.35 0.1 0 0  0.05 0.05 0.08 0 0  0 0 0 0.55 0" result="c"/>' +
        '<feMerge><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter>' +
      '<filter id="mf-pin" x="-120%" y="-120%" width="340%" height="340%">' +
        '<feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="b"/>' +
        '<feColorMatrix in="b" type="matrix" values="1.3 0.9 0.1 0 0  0.9 0.8 0.05 0 0  0.05 0.15 0.3 0 0  0 0 0 1.5 0" result="g"/>' +
        '<feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter>' +
      '<filter id="mf-route" x="-15%" y="-15%" width="130%" height="130%">' +
        '<feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b"/>' +
        '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter>' +
      '</defs>';
  }

  function getPinXY(pin, courseId) {
    if (courseId === 'fa-foundation' && PARIS_PIN_POSITIONS[pin.id]) {
      return PARIS_PIN_POSITIONS[pin.id];
    }
    return [lngToX(pin.lng), latToY(pin.lat)];
  }

  function buildRoute(course) {
    if (!course || !course.routeOrder) return '';
    var pts = [];
    course.routeOrder.forEach(function(pinId) {
      var pin = course.pins.find(function(p){return p.id===pinId;});
      if (pin) {
        var xy = getPinXY(pin, course.id);
        pts.push(xy);
      }
    });
    if (pts.length < 2) return '';
    var d = 'M ' + pts.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' L ');
    var rc = course.routeColor || '#C8A96B';
    return '<path id="mapstr-route-line" d="' + d + '"' +
      ' stroke="' + rc + '" stroke-width="1.8" stroke-linecap="round"' +
      ' stroke-linejoin="round" stroke-dasharray="8 5" fill="none"' +
      ' filter="url(#mf-route)"' +
      ' style="opacity:0.9;stroke-dashoffset:3000;stroke-dasharray:3000;transition:stroke-dashoffset 2.4s cubic-bezier(0.4,0,0.2,1)"/>';
  }

  function buildPins(course) {
    if (!course) return '';
    return course.pins.map(function(pin, idx) {
      var xy = getPinXY(pin, course.id);
      var px = xy[0].toFixed(1), py = xy[1].toFixed(1);
      var rc = course.routeColor || '#C8A96B';
      var delay = idx * 70;
      var label = (pin.city.split('—')[1] || pin.city).trim();
      if (label.length > 14) label = label.slice(0,13) + '…';
      var n = pin.units.length;

      return [
        '<g class="mapstr-pin-group" data-pin-id="' + pin.id + '"',
        '   role="button" tabindex="0"',
        '   aria-label="' + pin.city.replace(/"/g,'&quot;') + '"',
        '   style="transition-delay:' + delay + 'ms"',
        '   transform="translate(' + px + ',' + py + ')">',
        // Outer halo pulses
        '  <circle class="pin-pulse" r="13" stroke="' + rc + '" stroke-width="1.5" fill="none" opacity="0"/>',
        '  <circle class="pin-pulse pin-pulse-2" r="13" stroke="' + rc + '" stroke-width="1" fill="none" opacity="0"/>',
        // Soft glow bg
        '  <circle r="11" fill="' + rc + '" opacity="0.12"/>',
        // Core
        '  <g class="pin-core" filter="url(#mf-pin)">',
        '    <circle r="9" fill="' + rc + '" stroke="rgba(0,0,26,0.6)" stroke-width="1.5"/>',
        '    <circle r="4.5" fill="rgba(0,0,20,0.45)"/>',
        '    <text text-anchor="middle" y="3.8"',
        '      font-family="Inter,Arial,sans-serif" font-size="7.5" font-weight="900" fill="#00001A">' + n + '</text>',
        '  </g>',
        // Label
        '  <text class="pin-label" x="13" y="-12" fill="#F3EFE9">' + label + '</text>',
        '</g>'
      ].join('\n');
    }).join('\n');
  }

  function buildParisInset(course) {
    if (!course || course.id !== 'fa-foundation') return '';
    // Draw a subtle Paris district circle indicator
    var cx = PARIS_CENTER_X, cy = PARIS_CENTER_Y;
    var rc = course.routeColor || '#C8A96B';
    return [
      '<g opacity="0.6">',
      // Paris label
      '<text x="' + cx + '" y="' + (cy+28) + '"',
      '  text-anchor="middle"',
      '  font-family="Inter,sans-serif" font-size="7" font-weight="700"',
      '  fill="' + rc + '" letter-spacing="0.12em" opacity="0.7">PARIS</text>',
      // Subtle circle outline for Paris "district"
      '<circle cx="' + cx + '" cy="' + cy + '" r="22"',
      '  fill="none" stroke="' + rc + '" stroke-width="0.4"',
      '  stroke-dasharray="3 4" opacity="0.25"/>',
      '</g>'
    ].join('\n');
  }

  function buildSVG(courseData, activeCourseId) {
    var course = courseData.find(function(c){return c.id===activeCourseId;});
    var rc = course ? course.routeColor : '#C8A96B';

    return [
      '<svg id="mapstr-france-svg"',
      '  viewBox="0 0 ' + VW + ' ' + VH + '"',
      '  xmlns="http://www.w3.org/2000/svg"',
      '  aria-label="Interactive map of France"',
      '  preserveAspectRatio="xMidYMid meet">',
      buildDefs(rc),
      // Ocean bg
      '<rect width="' + VW + '" height="' + VH + '" fill="#00001C"/>',
      // Subtle ocean lines
      '<g opacity="0.04" stroke="#1A3A6A" stroke-width="0.5">',
      (function(){var ls=[];for(var y=20;y<VH;y+=24)ls.push('<line x1="0" y1="'+y+'" x2="'+VW+'" y2="'+(y+3)+'"/>');return ls.join('');})(),
      '</g>',
      // France landmass
      '<path d="' + FRANCE_PATH + '" fill="url(#mg-land)" filter="url(#mf-land)"',
      '  stroke="rgba(200,169,107,0.28)" stroke-width="0.7"/>',
      // Inner radial glow
      '<path d="' + FRANCE_PATH + '" fill="url(#mg-glow)" opacity="0.7"/>',
      // Fine coast highlight  
      '<path d="' + FRANCE_PATH + '" fill="none" stroke="rgba(200,169,107,0.15)" stroke-width="1.5"/>',
      // Graticule
      '<g opacity="0.05" stroke="#C8A96B" stroke-width="0.35" stroke-dasharray="2 8">',
      [44,46,48,50].map(function(lat){var y=latToY(lat).toFixed(0);return '<line x1="0" y1="'+y+'" x2="'+VW+'" y2="'+y+'"/>';}).join(''),
      [-2,0,2,4,6].map(function(lng){var x=lngToX(lng).toFixed(0);return '<line x1="'+x+'" y1="0" x2="'+x+'" y2="'+VH+'"/>';}).join(''),
      '</g>',
      // Corsica
      '<path d="' + CORSICA_PATH + '" fill="#0E1F65" stroke="rgba(200,169,107,0.22)" stroke-width="0.5"/>',
      // Paris inset ring (for Foundation course)
      buildParisInset(course),
      // Route
      buildRoute(course),
      // Pins
      buildPins(course),
      '</svg>'
    ].join('\n');
  }

  /* ─────────────────────────────────────────────────────────
     HTML COMPONENT BUILDERS
  ───────────────────────────────────────────────────────── */
  function buildStars() {
    return '<div class="mapstr-stars" aria-hidden="true">' +
      STARS.map(function(s) {
        return '<div class="mapstr-star" style="left:'+s.x.toFixed(1)+'%;top:'+s.y.toFixed(1)+'%;width:'+s.r.toFixed(1)+'px;height:'+s.r.toFixed(1)+'px;animation-delay:'+s.delay.toFixed(1)+'s;animation-duration:'+s.dur.toFixed(1)+'s"></div>';
      }).join('') + '</div>';
  }

  function buildTabs(courses, activeId) {
    return '<nav class="mapstr-tabs" role="tablist" aria-label="Select course journey">' +
      courses.map(function(c) {
        return '<button class="mapstr-tab" role="tab" aria-selected="' + (c.id===activeId) + '" data-course-id="' + c.id + '">' +
          '<span class="tab-dot" style="background:' + (c.routeColor||'#C8A96B') + '"></span>' +
          '<span class="tab-name">' + c.name + '</span>' +
          '<span class="tab-level">' + c.shortLevel + '</span>' +
          '</button>';
      }).join('') + '</nav>';
  }

  function buildEyebrow() {
    return '<div class="mapstr-eyebrow">' +
      '<p class="mapstr-tagline"><em>French is learned where it is lived</em></p>' +
      '<div class="mapstr-legend">' +
        '<span class="mapstr-legend-item"><span class="legend-dot"></span>Location</span>' +
        '<span class="mapstr-legend-item"><span class="legend-line"></span>Route</span>' +
      '</div></div>';
  }

  function buildPanel() {
    return [
      '<aside class="mapstr-panel" id="mapstr-panel" aria-label="Location detail" aria-hidden="true">',
      '  <button class="mapstr-panel-close" id="mapstr-panel-close" aria-label="Close">',
      '    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">',
      '      <line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/>',
      '    </svg>',
      '  </button>',
      '  <div class="mapstr-panel-inner">',
      '    <div class="mapstr-panel-head">',
      '      <div class="panel-head-bg" id="panel-head-bg"></div>',
      '      <div class="panel-head-ov"></div>',
      '      <div class="panel-head-text">',
      '        <div class="panel-cname" id="panel-cname"></div>',
      '        <div class="panel-cmeta" id="panel-cmeta"></div>',
      '      </div>',
      '    </div>',
      '    <div class="mapstr-panel-body">',
      '      <div class="panel-city" id="panel-city"></div>',
      '      <div class="panel-loc">',
      '        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">',
      '          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>',
      '          <circle cx="12" cy="9" r="2.5"/>',
      '        </svg>',
      '        <span id="panel-loc-text"></span>',
      '      </div>',
      '      <div class="panel-units" id="panel-units"></div>',
      '      <a class="panel-cta" id="panel-cta" href="#">',
      '        <span id="panel-cta-text">Explore Course</span>',
      '        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2">',
      '          <path d="M1 7h12M7 1l6 6-6 6"/>',
      '        </svg>',
      '      </a>',
      '    </div>',
      '  </div>',
      '</aside>',
      '<div class="mapstr-backdrop" id="mapstr-backdrop"></div>'
    ].join('\n');
  }

  function buildPopover() {
    return '<div class="mapstr-popover" id="mapstr-popover" role="tooltip">' +
      '<div class="mapstr-popover-inner">' +
      '<div class="pop-city" id="pop-city"></div>' +
      '<ul class="pop-units" id="pop-units"></ul>' +
      '<div class="pop-hint">Click to explore →</div>' +
      '</div></div>';
  }

  function buildJourneyBar(course) {
    if (!course) return '';
    return '<div class="mapstr-journey-bar">' +
      '<div class="journey-label">Journey stops</div>' +
      '<div class="journey-chips">' +
      course.pins.map(function(pin, i) {
        var label = (pin.city.split('—')[1] || pin.city).trim();
        return '<button class="journey-chip" data-pin-id="' + pin.id + '">' +
          '<span class="chip-n">' + (i+1) + '</span>' + label + '</button>';
      }).join('') + '</div></div>';
  }

  function buildMobileCards(course) {
    if (!course) return '';
    return '<div class="mapstr-mobile-cards">' +
      course.pins.map(function(pin) {
        return '<div class="mobile-pin-card" data-pin-id="' + pin.id + '">' +
          '<div class="mpc-city">' + pin.city + '</div>' +
          '<div class="mpc-loc">' + pin.location + '</div>' +
          '<div class="mpc-units">' +
          pin.units.map(function(u){
            return '<span class="mpc-tag">U' + u.num + ' · ' + u.fr + '</span>';
          }).join('') +
          '</div></div>';
      }).join('') + '</div>';
  }

  /* ─────────────────────────────────────────────────────────
     MOUNT
  ───────────────────────────────────────────────────────── */
  function mount(target) {
    var root;
    if (typeof target === 'string') root = document.querySelector(target);
    else if (target instanceof Element) root = target;
    else root = document.querySelector('#mapstr-mount');
    if (!root) return null;
    if (root.dataset.mapstrReady === '1') return null;
    root.dataset.mapstrReady = '1';
    root.classList.add('mapstr');

    var activeCourseId = 'fa-foundation';
    var _data = null;

    function render() {
      var course = _data.find(function(c){return c.id===activeCourseId;});
      root.setAttribute('data-course', activeCourseId);

      root.innerHTML = [
        buildStars(),
        buildEyebrow(),
        buildTabs(_data, activeCourseId),
        '<div class="mapstr-stage">',
        '  <div class="mapstr-svg-wrap" id="mapstr-svg-wrap">',
        buildSVG(_data, activeCourseId),
        buildPopover(),
        '  </div>',
        buildPanel(),
        '</div>',
        '<div class="mapstr-divider"></div>',
        buildJourneyBar(course),
        buildMobileCards(course)
      ].join('\n');

      // Animate after next paint
      requestAnimationFrame(function() {
        setTimeout(function() {
          // Route animation
          var rl = root.querySelector('#mapstr-route-line');
          if (rl) rl.style.strokeDashoffset = '0';

          // Stagger pins
          var pgs = root.querySelectorAll('.mapstr-pin-group');
          pgs.forEach(function(pg, i) {
            setTimeout(function() { pg.classList.add('visible'); }, i * 65);
          });
        }, 200);
      });

      bindEvents();
    }

    function bindEvents() {
      // Tabs
      root.querySelectorAll('.mapstr-tab').forEach(function(tab) {
        tab.addEventListener('click', function() { switchTo(tab.dataset.courseId); });
        tab.addEventListener('keydown', function(e) {
          if (e.key==='Enter'||e.key===' ') { e.preventDefault(); switchTo(tab.dataset.courseId); }
        });
      });

      // SVG pins
      root.querySelectorAll('.mapstr-pin-group').forEach(function(pg) {
        pg.addEventListener('mouseenter', function() { showPop(pg); });
        pg.addEventListener('mouseleave', hidePop);
        pg.addEventListener('click', function() { openPanel(pg.dataset.pinId); });
        pg.addEventListener('keydown', function(e) {
          if (e.key==='Enter'||e.key===' ') { e.preventDefault(); openPanel(pg.dataset.pinId); }
        });
      });

      // Journey chips + mobile cards
      root.querySelectorAll('.journey-chip, .mobile-pin-card').forEach(function(el) {
        el.addEventListener('click', function() { openPanel(el.dataset.pinId); });
      });

      // Close
      var closeBtn = root.querySelector('#mapstr-panel-close');
      var backdrop = root.querySelector('#mapstr-backdrop');
      if (closeBtn) closeBtn.addEventListener('click', closePanel);
      if (backdrop) backdrop.addEventListener('click', closePanel);
      document.addEventListener('keydown', function(e) { if (e.key==='Escape') closePanel(); });
    }

    function switchTo(id) {
      if (id === activeCourseId) return;
      activeCourseId = id;
      closePanel();
      root.dataset.mapstrReady = '0';
      root.dataset.mapstrReady = '1';
      render();
    }

    function getCourse() { return _data.find(function(c){return c.id===activeCourseId;}); }
    function getPin(id) { var c=getCourse(); return c?c.pins.find(function(p){return p.id===id;}):null; }

    function showPop(pg) {
      var pin = getPin(pg.dataset.pinId);
      if (!pin) return;
      var pop = root.querySelector('#mapstr-popover');
      var city = root.querySelector('#pop-city');
      var units = root.querySelector('#pop-units');
      if (!pop || !city || !units) return;

      city.textContent = pin.city;
      units.innerHTML = pin.units.map(function(u) {
        return '<li><span class="pu-num">U' + u.num + '</span><em class="pu-fr"> ' + u.fr + '</em></li>';
      }).join('');

      // Position
      var svgEl = root.querySelector('#mapstr-france-svg');
      var wrap = root.querySelector('#mapstr-svg-wrap');
      if (svgEl && wrap) {
        try {
          var svgPt = svgEl.createSVGPoint();
          var course = getCourse();
          var xy = getPinXY(pin, course ? course.id : '');
          svgPt.x = xy[0]; svgPt.y = xy[1];
          var ctm = svgEl.getScreenCTM();
          if (ctm) {
            var s = svgPt.matrixTransform(ctm);
            var wr = wrap.getBoundingClientRect();
            var rx = s.x - wr.left + 16;
            var ry = s.y - wr.top - 95;
            if (rx + 250 > wrap.offsetWidth) rx = s.x - wr.left - 260;
            if (ry < 8) ry = s.y - wr.top + 20;
            pop.style.left = Math.max(8, rx) + 'px';
            pop.style.top  = Math.max(8, ry) + 'px';
          }
        } catch(e) {}
      }

      root.querySelectorAll('.mapstr-pin-group').forEach(function(p){p.classList.remove('hovered');});
      pg.classList.add('hovered');
      pop.classList.add('visible');
    }

    function hidePop() {
      var pop = root.querySelector('#mapstr-popover');
      if (pop) pop.classList.remove('visible');
      root.querySelectorAll('.mapstr-pin-group').forEach(function(p){p.classList.remove('hovered');});
    }

    function openPanel(pinId) {
      var course = getCourse();
      var pin = getPin(pinId);
      if (!course || !pin) return;

      var qs = function(id) { return root.querySelector('#'+id); };
      if (qs('panel-cname')) qs('panel-cname').textContent = course.name;
      if (qs('panel-cmeta')) qs('panel-cmeta').textContent = course.level + ' · ' + course.region;
      if (qs('panel-city')) qs('panel-city').textContent = pin.city;
      if (qs('panel-loc-text')) qs('panel-loc-text').textContent = pin.location;

      var headBg = qs('panel-head-bg');
      if (headBg) {
        var img = COURSE_IMAGES[course.id];
        headBg.style.backgroundImage = img ? 'url('+img+')' : 'none';
      }

      if (qs('panel-units')) {
        qs('panel-units').innerHTML = pin.units.map(function(u) {
          return '<div class="pul-card">' +
            '<div class="pul-header"><span class="pul-num">Unit ' + u.num + '</span></div>' +
            '<div class="pul-fr">' + u.fr + '</div>' +
            '<div class="pul-en">' + u.en + '</div>' +
            '</div>';
        }).join('');
      }

      if (qs('panel-cta')) {
        qs('panel-cta').href = course.href || '#';
        if (qs('panel-cta-text')) qs('panel-cta-text').textContent = 'Explore ' + course.name;
      }

      // Highlight
      root.querySelectorAll('.mapstr-pin-group').forEach(function(p){p.classList.toggle('active',p.dataset.pinId===pinId);});
      root.querySelectorAll('.journey-chip').forEach(function(c){c.classList.toggle('active',c.dataset.pinId===pinId);});

      var panel = root.querySelector('#mapstr-panel');
      var backdrop = root.querySelector('#mapstr-backdrop');
      if (panel) { panel.classList.add('open'); panel.setAttribute('aria-hidden','false'); }
      if (backdrop) backdrop.classList.add('visible');
      hidePop();
    }

    function closePanel() {
      var panel = root.querySelector('#mapstr-panel');
      var backdrop = root.querySelector('#mapstr-backdrop');
      if (panel) { panel.classList.remove('open'); panel.setAttribute('aria-hidden','true'); }
      if (backdrop) backdrop.classList.remove('visible');
      root.querySelectorAll('.mapstr-pin-group').forEach(function(p){p.classList.remove('active');});
      root.querySelectorAll('.journey-chip').forEach(function(c){c.classList.remove('active');});
    }

    /* ── DATA LOAD ── */
    var DATA_URL = (function(){
      if (root.dataset.src) return root.dataset.src;
      var scripts = document.querySelectorAll('script[src*="mapstr"]');
      if (scripts.length) {
        var base = scripts[scripts.length-1].src.replace(/js\/mapstr\.js.*$/,'');
        return base + 'data/courses_geo.json';
      }
      return 'data/courses_geo.json';
    })();

    var ALLOWED = ['fa-foundation','fa-beginner','fa-elementary'];

    if (window.Mapstr._courseData) {
      _data = window.Mapstr._courseData;
      render();
    } else {
      fetch(DATA_URL)
        .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
        .then(function(json){
          _data = (json.courses||[]).filter(function(c){return ALLOWED.indexOf(c.id)!==-1;});
          window.Mapstr._courseData = _data;
          render();
        })
        .catch(function(err){
          console.error('[Mapstr]',err);
          root.innerHTML='<p style="color:#F3D3D9;padding:3rem;text-align:center;font-family:Georgia,serif">Map unavailable. <a href="courses.html" style="color:#C8A96B">Browse courses →</a></p>';
        });
    }

    return { root:root, openCity:openPanel, closePanel:closePanel };
  }

  /* ─────────────────────────────────────────────────────────
     GLOBAL API + AUTO-INIT
  ───────────────────────────────────────────────────────── */
  window.Mapstr = { mount:mount, data:null, _courseData:null };

  function autoInit() {
    var el = document.querySelector('#mapstr-mount');
    if (el) mount(el);
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', autoInit);
  else autoInit();

})();
