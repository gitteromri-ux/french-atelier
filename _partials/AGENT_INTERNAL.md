# INTERNAL-PAGES AGENT — French Atelier (all non-homepage, non-course pages)

Redo ALL internal pages to be far richer and dramatically more impressive. LUXURY brand (LVMH/MasterClass/Harvard/Awwwards). Current internal pages are "awful/unimpressive." Light ivory site. Brand: navy #0B1340, Parisian pink #E4A6B8, terracotta #C97A4E, gold #C8A560 (gold SPARINGLY). Cormorant Garamond + Inter. CSS css/fa.css, JS js/fa.js.

WORKING DIR: /home/user/workspace/fa-site
TARGET FILES (read each; read css/fa.css first):
how-it-works.html, method.html, juliane.html, teachers.html, culture.html, pricing.html, faq.html, about.html, **acadomia.html (482 lines — SPECIAL, see below)**, contact.html, capsules.html, map.html, courses.html. (Do NOT touch index.html or courses/*.html — other agents own those. Do NOT touch blog.html/blog/*.html.)

## CRITICAL CORRECTION — ACADOMIA PAGE
The user EXPLICITLY corrected: acadomia.html must **NOT** be framed as children's French tutoring. REMOVE/avoid ANY kids-tutoring framing. Currently it says things like "from the primary school pupil" and "from its tutoring programs" — soften/reframe these. Frame Acadomia as **France's #1 private learning institute / the prestigious parent brand** that lends academic credibility to The French Atelier. Emphasize: founded 1989, decades of educational excellence, trusted name in private education in France, the Trophée des Passionnés awards, expertise in personalized expert instruction — applied here to adult French learners in intimate live classes of 8–10. Keep it about prestige, heritage, and institutional credibility — NOT about tutoring schoolchildren. Make this page powerful and impressive.

## OLD-SITE BRAND STORY (keep this core text/voice, enrich around it)
Hero voice: "Master the Art of French" / "Live French. Live." / "Culture speaks French. What about you?" Subhead: "French Atelier by ACADOMIA is an exclusive, culturally immersive, certified, live French language program, tailored for adult lifelong learners."
6 culture pillars (each with ~5 bullets): Art & Architecture, Gastronomy & Wine, Travel & Landmarks, Fashion & Film, Music & Poetry, Tradition & History. → use richly on culture.html.
"Watch a Real 30-Minute Class." "YOUR LESSONS, BROADCAST FROM THE HEART OF FRANCE" (Paris, Bordeaux, Provence, Alps, Côte d'Azur). LMS: Course & Content Library, Lesson Recordings, Live Sessions Q&A, Discussion Groups, Progress Tracking, 24/7 Learners Community. "Powered by eTeacher's award-winning learning platform."

## RICH CONTENT TO WEAVE IN (make every page reflect the FULL offering)
- 7 COURSES (data/courses_geo.json has the spine): FA Foundation (A0→A1.1, 20u, Paris), FA Beginner (A1.1→A1.2, 20u, Normandy→Paris), FA Elementary (A1.2→A2.1, 20u, Loire→Bordeaux→Basque), FA Intermediate (A2.1→A2.2, 20u NEW, Marseille→Chamonix→Alsace), LSF Foundation/Beginner/Elementary (10u each, evening speaking-focused, "Let's Speak French"). Link to courses/*.html.
- 8 TEACHERS with bios (portraits in assets/teachers/): Caitlin–Strasbourg (French-American) caitlin.jpg; Carmèle–Paris (content creator) carmele.png; Charline–Paris charline.jpg; Corentin–Pau (3 decades) corentin.png; Iris Linza–Lyon (FFL Australia) iris.png; Philippe–West Paris (15+ yrs abroad) philippe.jpg; Shanice–Montpellier (Franco-Canadian) shanice.png; Stan–Nice stan.png. Real teacher video IDs: Charline G0lUXZKwg-8, Caitlin WbodfrXFjyg, Philippe z-l7f4qOmEo, Stan TqBegklrz-E. → teachers.html must be a beautiful faculty showcase with all 8 + the 4 video embeds.
- PRICING: $42/wk on annual ($840, 20 lessons × 85 min); pay-monthly from $56/wk; groups 8–10. → pricing.html: premium 2-plan cards (annual vs monthly), de-emphasize but present clearly, FAQ.
- METHOD: method.html should summarize the action-oriented / communicative / CEFR methodology (read data/method_research.md for the 5 real pillars + real sources/links). NEVER claim Sorbonne partnership/logo — text trust element only.
- JULIANE: juliane.html = the 24/7 AI French tutor companion — make it feel like a premium product page.
- CULTURE: culture.html = the 6 pillars richly expanded with the bullets.
- MAP: map.html — there's a France journey map (data/map_geo.json, _partials/build_map.py, map_preview.png/svg). Make sure it presents the learning-journey-across-France concept cleanly and links to courses. Fix anything broken/unimpressive.
- HOW-IT-WORKS: the live online format, small groups, broadcast from France, LMS features, certification path A0→A2.2.
- CONTACT: elegant advisor contact (advisor@eTeacherGroup.com), advisor form. FAQ: rich accordion.

## SHARED COMPONENTS (reuse — do not reinvent)
- _partials/nav.html, _partials/footer.html (consistent across pages), _partials/advisor-section.html, _partials/advisor-modal.html (data-advisor buttons open it), _partials/power-strip.html.
- Classes: .btn-3d / .btn-3d-primary / .btn-3d-secondary, .advisor-form (mailto fallback), .neon-splash, .reveal.

## RULES
- Keep nav/footer consistent site-wide. Reuse fa.css tokens; add namespaced CSS if needed.
- Mobile-first responsive. Hunt for and FIX: text overflow, broken wrapping, low-contrast text-on-image (add scrims), dark-on-dark. Add clear glass buttons where buttons sit on imagery.
- Brand facts: "The French Atelier by ACADOMIA", France's #1 private learning institute, founded 1989, tagline "Live French. Live.", brand line "Culture speaks French. What about you?", YouTube @FrenchbyAtelier.
- NO invented statistics. NO Sorbonne logo/partnership claim. ACADOMIA = prestigious parent institute, NOT children's tutoring (this is the user's #1 correction).
- Do NOT commit to git. When done, write _partials/INTERNAL_REPORT.md listing every page changed + key additions + confirming the Acadomia page no longer reads as kids tutoring.
