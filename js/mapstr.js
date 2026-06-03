/* ============================================================
   MAPSTR MAP ENGINE — The French Atelier by Acadomia  v5.0 (2026)
   3 FA courses only: Foundation (Paris city zoom), Beginner (Normandy→Paris),
   Elementary (Loire→Bordeaux→Basque)

   PUBLIC API:
     window.Mapstr.mount(target)    target: CSS selector or Element
     window.Mapstr.data             course data array
   Auto-mounts into #mapstr-mount on DOMContentLoaded.
   ============================================================ */
(function () {
  'use strict';

  /* ── FRANCE COORDINATE SYSTEM ───────────────────────────────
     France bounding box → SVG 560×680
  ─────────────────────────────────────────────────────────── */
  var VW = 560, VH = 680;
  var LAT_N = 51.15, LAT_S = 42.25;
  var LNG_W = -5.15, LNG_E = 8.30;

  function lngToX(lng) { return ((lng - LNG_W) / (LNG_E - LNG_W)) * VW; }
  function latToY(lat) { return ((LAT_N - lat) / (LAT_N - LAT_S)) * VH; }
  function ptF(lat, lng) { return lngToX(lng).toFixed(1) + ',' + latToY(lat).toFixed(1); }

  /* ── PARIS ZOOM COORDINATE SYSTEM ───────────────────────────
     Paris bounding box for the 12 FA Foundation locations.
     Real lat/lng range: ~48.84–48.89 lat, ~2.27–2.38 lng
     We map this to the full SVG canvas (560×680) with generous padding.
     Padding: 60px each side horizontally, 80px top, 60px bottom.
  ─────────────────────────────────────────────────────────── */
  var PARIS_VW = 560, PARIS_VH = 680;
  var PARIS_PAD_LEFT = 55, PARIS_PAD_RIGHT = 55;
  var PARIS_PAD_TOP = 90, PARIS_PAD_BOT = 70;

  // Paris geo bounds (slightly expanded beyond the actual pins for context)
  var PARIS_LAT_N = 48.900, PARIS_LAT_S = 48.835;
  var PARIS_LNG_W =  2.265, PARIS_LNG_E =  2.395;

  function parisLngToX(lng) {
    var frac = (lng - PARIS_LNG_W) / (PARIS_LNG_E - PARIS_LNG_W);
    return PARIS_PAD_LEFT + frac * (PARIS_VW - PARIS_PAD_LEFT - PARIS_PAD_RIGHT);
  }
  function parisLatToY(lat) {
    var frac = (PARIS_LAT_N - lat) / (PARIS_LAT_N - PARIS_LAT_S);
    return PARIS_PAD_TOP + frac * (PARIS_VH - PARIS_PAD_TOP - PARIS_PAD_BOT);
  }

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
    return 'M ' + o.map(function(p){return ptF(p[0],p[1]);}).join(' L ') + ' Z';
  })();

  var CORSICA_PATH = (function(){
    var c = [[43.02,9.35],[42.60,9.55],[41.38,9.22],[41.37,8.54],[42.03,8.54],[42.68,9.05],[43.02,9.35]];
    return 'M ' + c.map(function(p){return ptF(p[0],p[1]);}).join(' L ') + ' Z';
  })();

  /* ── PARIS ARRONDISSEMENT OUTLINES (simplified) ─────────── */
  /* A rough outline of greater Paris (périphérique area) in Paris coords */
  var PARIS_OUTLINE = (function() {
    // Rough outer boundary of Paris (20 arrondissements)
    var pts = [
      [48.902, 2.318], // Montmartre N
      [48.897, 2.347], // Buttes-Chaumont N
      [48.891, 2.397], // Vincennes direction NE
      [48.878, 2.407], // Est NE
      [48.857, 2.413], // Bastille direction E
      [48.840, 2.400], // Bois de Vincennes SE
      [48.825, 2.380], // S13 SE
      [48.818, 2.350], // Montrouge S
      [48.822, 2.320], // Malakoff S
      [48.832, 2.287], // Issy SW
      [48.843, 2.267], // Boulogne W
      [48.862, 2.260], // Neuilly NW
      [48.880, 2.273], // Levallois NW
      [48.896, 2.293], // Clichy N
      [48.902, 2.318]
    ];
    return 'M ' + pts.map(function(p){ return parisLngToX(p[1]).toFixed(1)+','+parisLatToY(p[0]).toFixed(1); }).join(' L ') + ' Z';
  })();

  /* Seine river path through Paris in Paris coords */
  var PARIS_SEINE = (function() {
    var pts = [
      [48.839, 2.268], // Boulogne entry W
      [48.846, 2.277], // Pont de Grenelle
      [48.851, 2.291], // Eiffel / Alma area
      [48.863, 2.302], // Trocadéro
      [48.862, 2.321], // Pont des Arts area
      [48.860, 2.338], // Notre Dame
      [48.852, 2.356], // Austerlitz
      [48.843, 2.373], // Ivry direction E
      [48.836, 2.388]  // exit E
    ];
    return 'M ' + pts.map(function(p){ return parisLngToX(p[1]).toFixed(1)+','+parisLatToY(p[0]).toFixed(1); }).join(' L ');
  })();

  /* Seine island path (Île de la Cité) */
  var PARIS_ILE_CITE = (function() {
    var pts = [
      [48.854, 2.346], [48.853, 2.357], [48.857, 2.357], [48.857, 2.346], [48.854, 2.346]
    ];
    return 'M ' + pts.map(function(p){ return parisLngToX(p[1]).toFixed(1)+','+parisLatToY(p[0]).toFixed(1); }).join(' L ') + ' Z';
  })();

  /* ── PARIS DISTRICT LABEL POSITIONS ─────────────────────── */
  var PARIS_DISTRICT_LABELS = [
    { label: '16e', lat: 48.860, lng: 2.276 },
    { label: '7e', lat: 48.855, lng: 2.309 },
    { label: '1er', lat: 48.862, lng: 2.340 },
    { label: '4e', lat: 48.854, lng: 2.353 },
    { label: '5e', lat: 48.848, lng: 2.347 },
    { label: '6e', lat: 48.848, lng: 2.333 },
    { label: '8e', lat: 48.871, lng: 2.310 },
    { label: '9e', lat: 48.877, lng: 2.340 },
    { label: '10e', lat: 48.876, lng: 2.360 },
    { label: '11e', lat: 48.860, lng: 2.376 },
    { label: '12e', lat: 48.846, lng: 2.379 },
    { label: '18e', lat: 48.888, lng: 2.343 },
    { label: 'Canal', lat: 48.870, lng: 2.367 }
  ];

  /* ── COURSE IMAGES ─────────────────────────────────────── */
  var COURSE_IMAGES = {
    'fa-foundation': 'assets/juliane/juliane-tshirt.jpg',
    'fa-beginner':   'assets/juliane/juliane-tshirt.jpg',
    'fa-elementary': 'assets/juliane/juliane-tshirt.jpg'
  };

  /* ── STAR FIELD ─────────────────────────────────────────── */
  var STARS = (function(){
    var a=[], r=function(s){return((s*9301+49297)%233280)/233280;};
    for(var i=0;i<60;i++) a.push({x:r(i*7+1)*100,y:r(i*13+3)*100,r:r(i*3+5)*1.8+0.3,delay:r(i*11+7)*4,dur:r(i*17+9)*2+2});
    return a;
  })();

  /* ── GET PIN POSITION ────────────────────────────────────── */
  function getPinXY(pin, courseId) {
    if (courseId === 'fa-foundation') {
      // Use Paris coordinate system for Foundation course
      return [parisLngToX(pin.lng), parisLatToY(pin.lat)];
    }
    return [lngToX(pin.lng), latToY(pin.lat)];
  }

  /* ── SVG DEFS ────────────────────────────────────────────── */
  function buildDefs(rc, isParis) {
    return '<defs>' +
      '<linearGradient id=\"mg-land\" x1=\"0.2\" y1=\"0\" x2=\"0.8\" y2=\"1\">' +
        '<stop offset=\"0%\" stop-color=\"#122070\"/>' +
        '<stop offset=\"45%\" stop-color=\"#0B1C56\"/>' +
        '<stop offset=\"100%\" stop-color=\"#060E35\"/>' +
      '</linearGradient>' +
      '<linearGradient id=\"mg-paris-land\" x1=\"0.2\" y1=\"0\" x2=\"0.8\" y2=\"1\">' +
        '<stop offset=\"0%\" stop-color=\"#152378\"/>' +
        '<stop offset=\"50%\" stop-color=\"#0E1A5C\"/>' +
        '<stop offset=\"100%\" stop-color=\"#080F3A\"/>' +
      '</linearGradient>' +
      '<radialGradient id=\"mg-pin-core\" cx=\"42%\" cy=\"38%\" r=\"70%\">' +
        '<stop offset=\"0%\" stop-color=\"#FBEAC8\"/>' +
        '<stop offset=\"45%\" stop-color=\"#E0BE7E\"/>' +
        '<stop offset=\"100%\" stop-color=\"#B8924F\"/>' +
      '</radialGradient>' +
      '<radialGradient id=\"mg-glow\" cx=\"50%\" cy=\"45%\" r=\"58%\">' +
        '<stop offset=\"0%\" stop-color=\"#1E3A8A\" stop-opacity=\"0.55\"/>' +
        '<stop offset=\"100%\" stop-color=\"#000034\" stop-opacity=\"0\"/>' +
      '</radialGradient>' +
      '<radialGradient id=\"mg-paris-glow\" cx=\"50%\" cy=\"50%\" r=\"55%\">' +
        '<stop offset=\"0%\" stop-color=\"#1A3280\" stop-opacity=\"0.6\"/>' +
        '<stop offset=\"100%\" stop-color=\"#00001F\" stop-opacity=\"0\"/>' +
      '</radialGradient>' +
      '<filter id=\"mf-land\" x=\"-8%\" y=\"-8%\" width=\"116%\" height=\"116%\">' +
        '<feGaussianBlur in=\"SourceAlpha\" stdDeviation=\"14\" result=\"b\"/>' +
        '<feColorMatrix in=\"b\" type=\"matrix\" values=\"0.5 0.4 0.15 0 0  0.4 0.35 0.1 0 0  0.05 0.05 0.08 0 0  0 0 0 0.55 0\" result=\"c\"/>' +
        '<feMerge><feMergeNode in=\"c\"/><feMergeNode in=\"SourceGraphic\"/></feMerge>' +
      '</filter>' +
      '<filter id=\"mf-paris\" x=\"-10%\" y=\"-10%\" width=\"120%\" height=\"120%\">' +
        '<feGaussianBlur in=\"SourceAlpha\" stdDeviation=\"18\" result=\"b\"/>' +
        '<feColorMatrix in=\"b\" type=\"matrix\" values=\"0.4 0.35 0.15 0 0  0.3 0.28 0.08 0 0  0.04 0.04 0.07 0 0  0 0 0 0.6 0\" result=\"c\"/>' +
        '<feMerge><feMergeNode in=\"c\"/><feMergeNode in=\"SourceGraphic\"/></feMerge>' +
      '</filter>' +
      '<filter id=\"mf-pin\" x=\"-150%\" y=\"-150%\" width=\"400%\" height=\"400%\">' +
        '<feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"5\" result=\"b\"/>' +
        '<feColorMatrix in=\"b\" type=\"matrix\" values=\"1.4 0.9 0.05 0 0  1.0 0.8 0.02 0 0  0.02 0.12 0.2 0 0  0 0 0 1.6 0\" result=\"g\"/>' +
        '<feMerge><feMergeNode in=\"g\"/><feMergeNode in=\"SourceGraphic\"/></feMerge>' +
      '</filter>' +
      '<filter id=\"mf-route\" x=\"-15%\" y=\"-15%\" width=\"130%\" height=\"130%\">' +
        '<feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"2\" result=\"b\"/>' +
        '<feMerge><feMergeNode in=\"b\"/><feMergeNode in=\"SourceGraphic\"/></feMerge>' +
      '</filter>' +
      '<filter id=\"mf-seine\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"140%\">' +
        '<feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"1\" result=\"b\"/>' +
        '<feMerge><feMergeNode in=\"b\"/><feMergeNode in=\"SourceGraphic\"/></feMerge>' +
      '</filter>' +
      '<filter id=\"mf-label-glow\" x=\"-50%\" y=\"-50%\" width=\"200%\" height=\"200%\">' +
        '<feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"3\" result=\"b\"/>' +
        '<feMerge><feMergeNode in=\"b\"/><feMergeNode in=\"SourceGraphic\"/></feMerge>' +
      '</filter>' +
      '</defs>';
  }

  /* ── ROUTE LINE ─────────────────────────────────────────── */
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
    // Total path length estimate for dasharray animation
    var totalLen = 0;
    for (var i = 1; i < pts.length; i++) {
      var dx = pts[i][0] - pts[i-1][0], dy = pts[i][1] - pts[i-1][1];
      totalLen += Math.sqrt(dx*dx + dy*dy);
    }
    var animLen = Math.ceil(totalLen + 200);

    return [
      // Glow/shadow line
      '<path d=\"' + d + '\"' +
        ' stroke=\"' + rc + '\" stroke-width=\"4\" stroke-linecap=\"round\"' +
        ' stroke-linejoin=\"round\" fill=\"none\" opacity=\"0.18\"/>',
      // Main dashed route
      '<path id=\"mapstr-route-line\" d=\"' + d + '\"' +
        ' stroke=\"' + rc + '\" stroke-width=\"3.4\" stroke-linecap=\"round\"' +
        ' stroke-linejoin=\"round\" stroke-dasharray=\"10 6\" fill=\"none\"' +
        ' filter=\"url(#mf-route)\"' +
        ' style=\"opacity:0.92;stroke-dashoffset:' + animLen + ';stroke-dasharray:' + animLen + ';' +
        'transition:stroke-dashoffset 2.8s cubic-bezier(0.4,0,0.2,1)\"/>'
    ].join('\n');
  }

  /* ── PIN LABEL — smart offset based on position ─────────── */
  function getPinLabelOffset(px, py, courseId) {
    var midX = courseId === 'fa-foundation' ? PARIS_VW / 2 : VW / 2;
    var midY = courseId === 'fa-foundation' ? PARIS_VH / 2 : VH / 2;
    // Default: label to the right
    var lx = 14, ly = -14;
    if (px > midX * 1.3) { lx = -14; } // near right edge: go left
    if (py < 80) { ly = 16; }           // near top: go below
    return [lx, ly];
  }

  /* ── PINS ───────────────────────────────────────────────── */
  function buildPins(course) {
    if (!course) return '';
    var rc = course.routeColor || '#C8A96B';
    var isParis = course.id === 'fa-foundation';

    return course.pins.map(function(pin, idx) {
      var xy = getPinXY(pin, course.id);
      var px = xy[0].toFixed(1), py = xy[1].toFixed(1);
      var delay = idx * 75;
      var label = (pin.city.split('—')[1] || pin.city).trim();
      if (label.length > 16) label = label.slice(0,15) + '…';
      var routeIdx = course.routeOrder ? course.routeOrder.indexOf(pin.id) : idx;
      var pinNum = routeIdx >= 0 ? routeIdx + 1 : idx + 1;
      var lo = getPinLabelOffset(parseFloat(px), parseFloat(py), course.id);
      var lx = lo[0], ly = lo[1];

      // PROMINENT GOLD PINS — large, bright, numbered (sized up for a powerful map)
      var PR = isParis ? 30 : 24;   // pulse ring radius
      var PG = isParis ? 24 : 19;   // glow disc radius
      var PC = isParis ? 18 : 15;   // core circle radius
      var PD = isParis ? 8 : 6;     // inner dark dot radius
      var PFS = isParis ? 14 : 12;  // font size
      var PTY = isParis ? 6.5 : 5.5;// text y

      return [
        '<g class=\"mapstr-pin-group\" data-pin-id=\"' + pin.id + '\"',
        '   role=\"button\" tabindex=\"0\"',
        '   aria-label=\"Stop ' + pinNum + ': ' + pin.city.replace(/"/g,'&quot;') + '\"',
        '   style=\"transition-delay:' + delay + 'ms\"',
        '   transform=\"translate(' + px + ',' + py + ')\">',
        // Outer ambient glow
        '  <circle r=\"' + (PR+6) + '\" fill=\"' + rc + '\" opacity=\"0.15\"/>',
        // Pulse rings (animated)
        '  <circle class=\"pin-pulse\" r=\"' + PR + '\" stroke=\"' + rc + '\" stroke-width=\"2.5\" fill=\"none\"/>',
        '  <circle class=\"pin-pulse pin-pulse-2\" r=\"' + PR + '\" stroke=\"' + rc + '\" stroke-width=\"1.5\" fill=\"none\"/>',
        // Glow halo
        '  <circle r=\"' + PG + '\" fill=\"' + rc + '\" opacity=\"0.45\"/>',
        // Core gold circle — luminous radial fill for a bright, powerful pin
        '  <circle r=\"' + PC + '\" fill=\"url(#mg-pin-core)\" stroke=\"#FBEAC8\" stroke-width=\"2\"/>',
        // Inner dark dot (for contrast)
        '  <circle class=\"pin-inner\" r=\"' + PD + '\" fill=\"rgba(0,0,20,0.65)\"/>',
        // Number — always visible
        '  <text text-anchor=\"middle\" y=\"' + PTY + '\"',
        '    font-family=\"Inter,Arial,sans-serif\" font-size=\"' + PFS + '\" font-weight=\"900\" fill=\"#00001A\">' + pinNum + '</text>',
        // Location label (shown on hover via CSS)
        '  <text class=\"pin-label\" x=\"' + lx + '\" y=\"' + ly + '\"',
        '    font-family=\"Inter,Arial,sans-serif\" font-size=\"' + (isParis ? 12 : 11) + '\" font-weight=\"700\"',
        '    fill=\"#F3EFE9\"',
        '    paint-order=\"stroke fill\"',
        '    stroke=\"rgba(0,0,26,0.95)\" stroke-width=\"4\" stroke-linejoin=\"round\">' + label + '</text>',
        '</g>'
      ].join('\n');
    }).join('\n');
  }

  /* ── PARIS CITY SVG ─────────────────────────────────────── */
  function buildParisSVG(course) {
    var rc = course ? course.routeColor : '#C8A96B';

    // Grid lines for Paris (lat/lng graticule)
    var gridLines = '';
    // Latitude grid lines
    [48.84, 48.85, 48.86, 48.87, 48.88, 48.89].forEach(function(lat) {
      var y = parisLatToY(lat).toFixed(0);
      gridLines += '<line x1=\"0\" y1=\"' + y + '\" x2=\"' + PARIS_VW + '\" y2=\"' + y + '\"/>';
    });
    // Longitude grid lines
    [2.27, 2.29, 2.31, 2.33, 2.35, 2.37, 2.39].forEach(function(lng) {
      var x = parisLngToX(lng).toFixed(0);
      gridLines += '<line x1=\"' + x + '\" y1=\"0\" x2=\"' + x + '\" y2=\"' + PARIS_VH + '\"/>';
    });

    // District labels
    var districtLabels = PARIS_DISTRICT_LABELS.map(function(d) {
      var x = parisLngToX(d.lng).toFixed(1);
      var y = parisLatToY(d.lat).toFixed(1);
      return '<text x=\"' + x + '\" y=\"' + y + '\" text-anchor=\"middle\"' +
        ' font-family=\"Inter,sans-serif\" font-size=\"8\" font-weight=\"600\"' +
        ' fill=\"rgba(200,169,107,0.30)\" letter-spacing=\"0.05em\">' + d.label + '</text>';
    }).join('');

    // Key Paris landmarks as subtle markers (not pins)
    var landmarks = [
      { label: 'Tour Eiffel', lat: 48.8584, lng: 2.2945 },
      { label: 'Notre-Dame', lat: 48.8530, lng: 2.3499 },
      { label: 'Louvre', lat: 48.8606, lng: 2.3376 },
      { label: 'Sacré-Cœur', lat: 48.8867, lng: 2.3431 }
    ];
    var landmarkMarks = landmarks.map(function(l) {
      var x = parisLngToX(l.lng).toFixed(1);
      var y = parisLatToY(l.lat).toFixed(1);
      return '<g opacity=\"0.35\">' +
        '<circle cx=\"' + x + '\" cy=\"' + y + '\" r=\"3\" fill=\"rgba(200,169,107,0.4)\" stroke=\"rgba(200,169,107,0.5)\" stroke-width=\"0.8\"/>' +
        '<text x=\"' + x + '\" y=\"' + (parseFloat(y)-5) + '\" text-anchor=\"middle\"' +
        ' font-family=\"Inter,sans-serif\" font-size=\"7\" fill=\"rgba(200,169,107,0.5)\">' + l.label + '</text>' +
        '</g>';
    }).join('');

    return [
      '<svg id=\"mapstr-france-svg\"',
      '  viewBox=\"0 0 ' + PARIS_VW + ' ' + PARIS_VH + '\"',
      '  xmlns=\"http://www.w3.org/2000/svg\"',
      '  overflow=\"hidden\"',
      '  aria-label=\"Interactive map of Paris — FA Foundation journey\"',
      '  preserveAspectRatio=\"xMidYMid meet\">',
      buildDefs(rc, true),
      // Ocean / dark bg
      '<rect width=\"' + PARIS_VW + '\" height=\"' + PARIS_VH + '\" fill=\"#00001A\"/>',
      // Subtle grid
      '<g opacity=\"0.06\" stroke=\"#2A4A9A\" stroke-width=\"0.5\">',
      gridLines,
      '</g>',
      // Paris outer land fill
      '<path d=\"' + PARIS_OUTLINE + '\" fill=\"url(#mg-paris-land)\" filter=\"url(#mf-paris)\"',
      '  stroke=\"rgba(200,169,107,0.3)\" stroke-width=\"0.9\" stroke-linejoin=\"round\"/>',
      // Inner glow
      '<path d=\"' + PARIS_OUTLINE + '\" fill=\"url(#mg-paris-glow)\" opacity=\"0.8\"/>',
      // Fine border accent
      '<path d=\"' + PARIS_OUTLINE + '\" fill=\"none\" stroke=\"rgba(200,169,107,0.12)\" stroke-width=\"2\"/>',
      // Seine river
      '<path d=\"' + PARIS_SEINE + '\" fill=\"none\" stroke=\"#1A3A7A\" stroke-width=\"4.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" opacity=\"0.7\"/>',
      '<path d=\"' + PARIS_SEINE + '\" fill=\"none\" stroke=\"#2252A8\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\" opacity=\"0.5\" filter=\"url(#mf-seine)\"/>',
      '<path d=\"' + PARIS_SEINE + '\" fill=\"none\" stroke=\"rgba(80,130,220,0.25)\" stroke-width=\"1.5\" stroke-linecap=\"round\"/>',
      // Île de la Cité
      '<path d=\"' + PARIS_ILE_CITE + '\" fill=\"#0E1D60\" stroke=\"rgba(200,169,107,0.2)\" stroke-width=\"0.6\"/>',
      // District labels
      districtLabels,
      // Landmark ghost marks
      landmarkMarks,
      // PARIS title overlay
      '<text x=\"' + (PARIS_VW/2) + '\" y=\"52\"',
      '  text-anchor=\"middle\"',
      '  font-family=\"Cormorant Garamond,Georgia,serif\" font-size=\"16\" font-weight=\"700\"',
      '  fill=\"rgba(200,169,107,0.55)\" letter-spacing=\"0.28em\">PARIS</text>',
      '<text x=\"' + (PARIS_VW/2) + '\" y=\"68\"',
      '  text-anchor=\"middle\"',
      '  font-family=\"Inter,sans-serif\" font-size=\"8\" font-weight=\"400\"',
      '  fill=\"rgba(200,169,107,0.32)\" letter-spacing=\"0.18em\">CITY JOURNEY · 12 STOPS</text>',
      // Route
      buildRoute(course),
      // Pins
      buildPins(course),
      '</svg>'
    ].join('\n');
  }

  /* ── FRANCE MAP SVG ─────────────────────────────────────── */
  function buildFranceSVG(courseData, activeCourseId) {
    var course = courseData.find(function(c){return c.id===activeCourseId;});
    var rc = course ? course.routeColor : '#C8A96B';

    // Ocean lines
    var oceanLines = '';
    for (var y = 20; y < VH; y += 28) {
      oceanLines += '<line x1=\"0\" y1=\"' + y + '\" x2=\"' + VW + '\" y2=\"' + (y+2) + '\"/>';
    }

    return [
      '<svg id=\"mapstr-france-svg\"',
      '  viewBox=\"0 0 ' + VW + ' ' + VH + '\"',
      '  xmlns=\"http://www.w3.org/2000/svg\"',
      '  overflow=\"hidden\"',
      '  aria-label=\"Interactive map of France\"',
      '  preserveAspectRatio=\"xMidYMid meet\">',
      buildDefs(rc, false),
      // Ocean bg
      '<rect width=\"' + VW + '\" height=\"' + VH + '\" fill=\"#00001C\"/>',
      // Subtle ocean texture lines
      '<g opacity=\"0.035\" stroke=\"#1A3A6A\" stroke-width=\"0.5\">',
      oceanLines,
      '</g>',
      // France landmass
      '<path d=\"' + FRANCE_PATH + '\" fill=\"url(#mg-land)\" filter=\"url(#mf-land)\"',
      '  stroke=\"rgba(200,169,107,0.32)\" stroke-width=\"0.8\"/>',
      // Inner radial glow
      '<path d=\"' + FRANCE_PATH + '\" fill=\"url(#mg-glow)\" opacity=\"0.65\"/>',
      // Fine coast highlight
      '<path d=\"' + FRANCE_PATH + '\" fill=\"none\" stroke=\"rgba(200,169,107,0.18)\" stroke-width=\"1.8\"/>',
      // Graticule
      '<g opacity=\"0.055\" stroke=\"#C8A96B\" stroke-width=\"0.4\" stroke-dasharray=\"2 9\">',
      [44,46,48,50].map(function(lat){var y=latToY(lat).toFixed(0);return '<line x1=\"0\" y1=\"'+y+'\" x2=\"'+VW+'\" y2=\"'+y+'\"/>';}).join(''),
      [-4,-2,0,2,4,6,8].map(function(lng){var x=lngToX(lng).toFixed(0);return '<line x1=\"'+x+'\" y1=\"0\" x2=\"'+x+'\" y2=\"'+VH+'\"/>';}).join(''),
      '</g>',
      // Corsica
      '<path d=\"' + CORSICA_PATH + '\" fill=\"#0E1F65\" stroke=\"rgba(200,169,107,0.22)\" stroke-width=\"0.5\"/>',
      // Route
      buildRoute(course),
      // Pins
      buildPins(course),
      '</svg>'
    ].join('\n');
  }

  /* ── MAIN SVG DISPATCHER ─────────────────────────────────── */
  function buildSVG(courseData, activeCourseId) {
    var course = courseData.find(function(c){return c.id===activeCourseId;});
    if (!course) return '';
    if (activeCourseId === 'fa-foundation') {
      return buildParisSVG(course);
    }
    return buildFranceSVG(courseData, activeCourseId);
  }

  /* ─────────────────────────────────────────────────────────
     HTML COMPONENT BUILDERS
  ───────────────────────────────────────────────────────── */
  function buildStars() {
    return '<div class=\"mapstr-stars\" aria-hidden=\"true\">' +
      STARS.map(function(s) {
        return '<div class=\"mapstr-star\" style=\"left:'+s.x.toFixed(1)+'%;top:'+s.y.toFixed(1)+'%;width:'+s.r.toFixed(1)+'px;height:'+s.r.toFixed(1)+'px;animation-delay:'+s.delay.toFixed(1)+'s;animation-duration:'+s.dur.toFixed(1)+'s\"></div>';
      }).join('') + '</div>';
  }

  function buildTabs(courses, activeId) {
    return '<nav class=\"mapstr-tabs\" role=\"tablist\" aria-label=\"Select course journey\">' +
      courses.map(function(c) {
        var isActive = c.id === activeId;
        return '<button class=\"mapstr-tab' + (isActive ? ' active' : '') + '\" role=\"tab\" aria-selected=\"' + isActive + '\" data-course-id=\"' + c.id + '\">' +
          '<span class=\"tab-dot\" style=\"background:' + (c.routeColor||'#C8A96B') + '\"></span>' +
          '<span class=\"tab-name\">' + c.name + '</span>' +
          '<span class=\"tab-level\">' + c.shortLevel + '</span>' +
          '</button>';
      }).join('') + '</nav>';
  }

  function buildEyebrow(course) {
    var regionLabel = course ? course.region : 'France';
    return '<div class=\"mapstr-eyebrow\">' +
      '<p class=\"mapstr-tagline\"><em>French is learned where it is lived</em></p>' +
      '<div class=\"mapstr-legend\">' +
        '<span class=\"mapstr-legend-item\"><span class=\"legend-dot\"></span>Stop</span>' +
        '<span class=\"mapstr-legend-item\"><span class=\"legend-line\"></span>Route</span>' +
        '<span class=\"mapstr-legend-region\">📍 ' + regionLabel + '</span>' +
      '</div></div>';
  }

  function buildPanel() {
    return [
      '<aside class=\"mapstr-panel\" id=\"mapstr-panel\" aria-label=\"Location detail\" aria-hidden=\"true\">',
      '  <button class=\"mapstr-panel-close\" id=\"mapstr-panel-close\" aria-label=\"Close\">',
      '    <svg width=\"12\" height=\"12\" viewBox=\"0 0 12 12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\">',
      '      <line x1=\"1\" y1=\"1\" x2=\"11\" y2=\"11\"/><line x1=\"11\" y1=\"1\" x2=\"1\" y2=\"11\"/>',
      '    </svg>',
      '  </button>',
      '  <div class=\"mapstr-panel-inner\">',
      '    <div class=\"mapstr-panel-head\">',
      '      <div class=\"panel-head-bg\" id=\"panel-head-bg\"></div>',
      '      <div class=\"panel-head-ov\"></div>',
      '      <div class=\"panel-head-text\">',
      '        <div class=\"panel-cname\" id=\"panel-cname\"></div>',
      '        <div class=\"panel-cmeta\" id=\"panel-cmeta\"></div>',
      '      </div>',
      '    </div>',
      '    <div class=\"mapstr-panel-body\">',
      '      <div class=\"panel-city\" id=\"panel-city\"></div>',
      '      <div class=\"panel-loc\">',
      '        <svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\">',
      '          <path d=\"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z\"/>',
      '          <circle cx=\"12\" cy=\"9\" r=\"2.5\"/>',
      '        </svg>',
      '        <span id=\"panel-loc-text\"></span>',
      '      </div>',
      '      <div class=\"panel-units\" id=\"panel-units\"></div>',
      '      <a class=\"panel-cta\" id=\"panel-cta\" href=\"#\">',
      '        <span id=\"panel-cta-text\">Explore Course</span>',
      '        <svg width=\"13\" height=\"13\" viewBox=\"0 0 14 14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">',
      '          <path d=\"M1 7h12M7 1l6 6-6 6\"/>',
      '        </svg>',
      '      </a>',
      '    </div>',
      '  </div>',
      '</aside>',
      '<div class=\"mapstr-backdrop\" id=\"mapstr-backdrop\"></div>'
    ].join('\n');
  }

  function buildPopover() {
    return '<div class=\"mapstr-popover\" id=\"mapstr-popover\" role=\"tooltip\">' +
      '<div class=\"mapstr-popover-inner\">' +
      '<div class=\"pop-city\" id=\"pop-city\"></div>' +
      '<ul class=\"pop-units\" id=\"pop-units\"></ul>' +
      '<div class=\"pop-hint\">Click to explore →</div>' +
      '</div></div>';
  }

  function buildJourneyBar(course) {
    if (!course) return '';
    return '<div class=\"mapstr-journey-bar\">' +
      '<div class=\"journey-label\">Journey stops · ' + course.name + '</div>' +
      '<div class=\"journey-chips\">' +
      (course.routeOrder || course.pins.map(function(p){return p.id;})).map(function(pinId, i) {
        var pin = course.pins.find(function(p){return p.id===pinId;});
        if (!pin) return '';
        var label = (pin.city.split('—')[1] || pin.city).trim();
        return '<button class=\"journey-chip\" data-pin-id=\"' + pin.id + '\">' +
          '<span class=\"chip-n\">' + (i+1) + '</span>' + label + '</button>';
      }).join('') + '</div></div>';
  }

  function buildMobileCards(course) {
    if (!course) return '';
    var ordered = (course.routeOrder || course.pins.map(function(p){return p.id;})).map(function(pinId, i) {
      var pin = course.pins.find(function(p){return p.id===pinId;});
      if (!pin) return '';
      return '<div class=\"mobile-pin-card\" data-pin-id=\"' + pin.id + '\">' +
        '<div class=\"mpc-num\">Stop ' + (i+1) + '</div>' +
        '<div class=\"mpc-city\">' + pin.city + '</div>' +
        '<div class=\"mpc-loc\">' + pin.location + '</div>' +
        '<div class=\"mpc-units\">' +
        pin.units.map(function(u){
          return '<span class=\"mpc-tag\">Unit ' + u.num + ' · ' + u.fr + '</span>';
        }).join('') +
        '</div></div>';
    });
    return '<div class=\"mapstr-mobile-cards\">' + ordered.join('') + '</div>';
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
        buildEyebrow(course),
        buildTabs(_data, activeCourseId),
        '<div class=\"mapstr-stage\">',
        '  <div class=\"mapstr-svg-wrap\" id=\"mapstr-svg-wrap\">',
        buildSVG(_data, activeCourseId),
        buildPopover(),
        '  </div>',
        buildPanel(),
        '</div>',
        '<div class=\"mapstr-divider\"></div>',
        buildJourneyBar(course),
        buildMobileCards(course)
      ].join('\n');

      // Animate after next paint
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          // Route animation - use actual path length
          var rl = root.querySelector('#mapstr-route-line');
          if (rl) {
            try {
              var len = rl.getTotalLength();
              rl.style.strokeDasharray = len + ' ' + len;
              rl.style.strokeDashoffset = len;
              // Trigger animation
              requestAnimationFrame(function() {
                rl.style.strokeDashoffset = '0';
              });
            } catch(e) {
              rl.style.strokeDashoffset = '0';
            }
          }

          // Stagger pins — fast initial batch, then remaining
          var pgs = root.querySelectorAll('.mapstr-pin-group');
          pgs.forEach(function(pg, i) {
            // First 3 pins appear immediately, rest stagger
            var delay = i < 3 ? 0 : (i - 2) * 60;
            setTimeout(function() { pg.classList.add('visible'); }, delay);
          });
        });
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

      var course = getCourse();
      var routeIdx = course && course.routeOrder ? course.routeOrder.indexOf(pin.id) : -1;
      var pinNum = routeIdx >= 0 ? routeIdx + 1 : 1;

      city.innerHTML = '<span class=\"pop-stop\">Stop ' + pinNum + '</span> ' + pin.city;
      units.innerHTML = pin.units.map(function(u) {
        return '<li><span class=\"pu-num\">Unit ' + u.num + '</span><em class=\"pu-fr\"> ' + u.fr + '</em>' +
          '<div class=\"pu-en\">' + u.en + '</div></li>';
      }).join('');

      // Position
      var svgEl = root.querySelector('#mapstr-france-svg');
      var wrap = root.querySelector('#mapstr-svg-wrap');
      if (svgEl && wrap) {
        try {
          var svgPt = svgEl.createSVGPoint();
          var xy = getPinXY(pin, course ? course.id : '');
          svgPt.x = xy[0]; svgPt.y = xy[1];
          var ctm = svgEl.getScreenCTM();
          if (ctm) {
            var s = svgPt.matrixTransform(ctm);
            var wr = wrap.getBoundingClientRect();
            var rx = s.x - wr.left + 18;
            var ry = s.y - wr.top - 110;
            if (rx + 270 > wrap.offsetWidth) rx = s.x - wr.left - 280;
            if (ry < 8) ry = s.y - wr.top + 22;
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

      var routeIdx = course.routeOrder ? course.routeOrder.indexOf(pin.id) : -1;
      var pinNum = routeIdx >= 0 ? routeIdx + 1 : 1;

      var qs = function(id) { return root.querySelector('#'+id); };
      if (qs('panel-cname')) qs('panel-cname').textContent = course.name;
      if (qs('panel-cmeta')) qs('panel-cmeta').textContent = course.level + ' · ' + course.region;
      if (qs('panel-city')) qs('panel-city').innerHTML =
        '<span class=\"panel-city-stop\">Stop ' + pinNum + '</span> ' + pin.city;
      if (qs('panel-loc-text')) qs('panel-loc-text').textContent = pin.location;

      var headBg = qs('panel-head-bg');
      if (headBg) {
        var img = COURSE_IMAGES[course.id];
        headBg.style.backgroundImage = img ? 'url('+img+')' : 'none';
      }

      if (qs('panel-units')) {
        qs('panel-units').innerHTML = pin.units.map(function(u) {
          return '<div class=\"pul-card\">' +
            '<div class=\"pul-header\"><span class=\"pul-num\">Unit ' + u.num + '</span></div>' +
            '<div class=\"pul-fr\">' + u.fr + '</div>' +
            '<div class=\"pul-en\">' + u.en + '</div>' +
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
      var scripts = document.querySelectorAll('script[src*=\"mapstr\"]');
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
          root.innerHTML='<p style=\"color:#F3D3D9;padding:3rem;text-align:center;font-family:Georgia,serif\">Map unavailable. <a href=\"courses.html\" style=\"color:#C8A96B\">Browse courses →</a></p>';
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
