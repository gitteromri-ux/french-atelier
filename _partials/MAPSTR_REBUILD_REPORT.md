# Mapstr Experience Rebuild — Completion Report

## Status: COMPLETE

Rebuilt the signature interactive "Mapstr" fold for The French Atelier homepage. The old decorative teacher-cities map was discarded; the new fold embodies the brand pedagogy: every COURSE is a real geographic JOURNEY across French places, every UNIT anchors to a real landmark.

## Files (in /home/user/workspace/fa-site/)
- `_partials/mapstr-fold.html` — generated fold markup (~48KB)
- `css/mapstr.css` — fold styles (~363 lines), per-course color via --c-bg/--c-accent/--c-tint vars
- `js/mapstr.js` — vanilla IIFE (~222 lines): IntersectionObserver chapters, rAF eased camera/route/comet, keyboard rail nav, prefers-reduced-motion support
- `index.html` — fold embedded; `<link href="css/mapstr.css">` at line 11, `<script src="js/mapstr.js" defer>` at line 1617. Single real ref each (line 692 is a comment).
- Generators: `data/_build_fold.py` then `data/_reembed.py` to regenerate.

## Requirements met
1. Stylized France map stage; scroll travels camera along route (Paris→Normandy→Loire/Bordeaux/Basque→Marseille/Chamonix→Alsace) with animated route line + glowing traveling marker.
2. Each course = chapter: map zooms to region, route segment draws, anchor pins light up, story card slides in styled in THAT course's color (data-course + CSS vars). Card shows name, level badge, units, journey line, outcome, real anchor stops.
3. Loop text "language → culture → real places → back to language"; fa-foundation surfaces signature unit FA0-01 "Se présenter à la Tour Eiffel" linking the Gamma deck.
4. CTAs: each chapter "Explore this journey"→courses/<id>.html + "Download syllabus"→downloads/<id>-syllabus.pdf; finale "Talk to an Advisor" via [data-advisor] + Mapstr profile link.
5. Mobile: tap-driven accordion (no scroll-pinning), color-coded cards, collapse fixed (closed body = 0px).

## Brand fidelity
Light ivory/paper backgrounds, navy/pink/terracotta/gold palette (gold sparing), Cormorant Garamond headings + Inter body, neon-splash drifting glow on intro/finale. Accessible (aria-expanded, keyboard), performant (IO/rAF, reduced-motion).

## Screenshots (in _partials/)
- mapstr-desktop-ch1.png (FA Foundation, gold, Paris, signature unit + both CTAs)
- mapstr-desktop-ch3.png (FA Elementary, Bordeaux wine color, route drawn)
- mapstr-desktop-ch7.png (LSF Elementary, terracotta, full route)
- mapstr-mobile.png (accordion list, FA Foundation open, gold theme, map + pins + stops + signature unit + CTAs)
- mapstr-mobile-open.png (FA Elementary expanded, Bordeaux color, accordion collapse verified)

## Deploy (preview)
deploy_website args used — parent must re-call to surface in main chat:
- project_path: /home/user/workspace/fa-site
- site_name: The French Atelier
- entry_point: index.html
