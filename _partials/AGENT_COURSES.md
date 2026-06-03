# COURSE-PAGES AGENT — French Atelier (courses/*.html)

You rebuild ALL 7 course pages to "IIBS-level" — each must be its own rich, almost-homepage-quality page. LUXURY brand quality (LVMH/MasterClass/Harvard/Awwwards). Light ivory site. Brand: navy #0B1340, Parisian pink #E4A6B8, terracotta #C97A4E, gold #C8A560 (gold SPARINGLY). Fonts Cormorant Garamond + Inter. CSS: css/fa.css. JS: js/fa.js.

WORKING DIR: /home/user/workspace/fa-site
TARGET FILES (read each fully, plus read css/fa.css and one existing course page to learn the component vocabulary):
- courses/fa-foundation.html (477 lines), fa-beginner.html, fa-elementary.html, fa-intermediate.html, lsf-foundation.html, lsf-beginner.html, lsf-elementary.html

DATA SPINE: read /home/user/workspace/fa-site/data/courses_geo.json fully — it has per-course geo anchors, colors (navy/gold, sea-rose, Bordeaux vine, terracotta, Parisian pink, café rose), levels, units, signature units.

## IIBS BLUEPRINT (the structure each course page must follow)
Sticky nav w/ "Request Info" → Hero (2-col: left = course title + inline spec badges [Level | Accreditation] + 1-2 sentence pitch + primary CTA + trust line; right = intro image/video) → Info row (left = 6-item benefits checklist; right = scrollable upcoming-schedule panel showing duration/cadence) → auto-scroll testimonials (Name + Country + stars) → 5 benefit cards (incl. a Certificate card) → mid CTA banner → "Why study this course" 3-icon row → 2nd CTA → trust banner (Acadomia / eTeacher narrative — shown ~3x) → faculty carousel (real teacher headshots from assets/teachers/, with city) + Head-of-School card + advisor CTA → SYLLABUS summary (intro + horizontal lesson-card carousel; each lesson = number + title + 2–4 sentence substantive description + "View full syllabus" linking to downloads/{course-id}-syllabus.pdf) → bonus banner → FAQ accordion (price buried here) → footer.

KEY ADDITION the user explicitly wants: a TOP-RIGHT AT-A-GLANCE SPEC PANEL with checkbox/check-icon rows: Length · Level · Lessons · Group size · Certificate · Schedule · Price. Make it a clean sticky-ish card in the hero or just below.

PHILOSOPHY: price de-emphasized (buried in FAQ), CTA repeated ~5x, lesson descriptions substantive (not one-liners), trust/credibility anchored to Acadomia (France's #1 private learning institute, founded 1989) + eTeacher award-winning platform + CEFR certification. NOTE: Sorbonne is a TEXT trust element ONLY — never a logo or affiliation/partnership claim.

## PER-COURSE FACTS
- FA courses = 20 units, ~85-min live lessons, groups 8–10. LSF = "Let's Speak French", 10 units, speaking-focused evening classes.
- Levels (CEFR): FA Foundation A0→A1.1, FA Beginner A1.1→A1.2, FA Elementary A1.2→A2.1, FA Intermediate A2.1→A2.2 (NEW), LSF Foundation A0→A1.1, LSF Beginner A1.1→A1.2, LSF Elementary A1.2→A2.1.
- Pricing: $42/wk on annual ($840 total, 20 lessons), pay-monthly from $56/wk. (Adapt sensibly for LSF's 10-unit format — keep it credible, don't invent wild numbers; you can present "from $42/week" framing.)
- Per-course color via data-course attr → CSS vars --c-bg / --c-accent / --c-tint (already in fa.css). Set the right data-course on each page's <body> or wrapper so each course has its signature accent.
- Signature unit FA Foundation: FA0-01 "Se présenter à la Tour Eiffel" — link the deck https://gamma.app/docs/FA0-01-Se-presenter-a-la-Tour-Eiffel-7h2ggmgt8gh1pfd?mode=doc
- Teachers (real portraits in assets/teachers/): Caitlin (Strasbourg, French-American) caitlin.jpg; Carmèle (Paris, content creator) carmele.png; Charline (Paris) charline.jpg; Corentin (Pau, 3 decades) corentin.png; Iris Linza (Lyon) iris.png; Philippe (West Paris, 15+ yrs abroad) philippe.jpg; Shanice (Montpellier, Franco-Canadian) shanice.png; Stan (Nice) stan.png. Real teacher video IDs: Charline G0lUXZKwg-8, Caitlin WbodfrXFjyg, Philippe z-l7f4qOmEo, Stan TqBegklrz-E.
- Course images: reference assets/courses/{course-id}-{1,2,3}.png in your markup (main agent will swap to a cleaned set at the same filenames — keep these exact paths). Each course has 3 images per courses_geo.json anchors.
- Syllabus PDFs exist: downloads/{course-id}-syllabus.pdf (7 files).
- Juliane = 24/7 AI tutor (juliane.html). Advisor modal: use data-advisor buttons (main agent injects the modal site-wide). Form fallback mailto:advisor@eTeacherGroup.com.

## SYLLABUS / LESSON CONTENT
Write substantive, believable lesson breakdowns grounded in the course's CEFR level and geo journey (from courses_geo.json). Foundation: greetings, café, directions, Tour Eiffel scenario, etc. Each lesson card needs a real 2–4 sentence description tied to a can-do outcome and the French location/scenario. Do NOT leave lorem or one-liners.

## RULES
- Reuse existing fa.css components; add new course-page CSS to css/fa.css (namespaced e.g. .cp-*). Keep all 7 pages structurally consistent but each visually signed with its own accent color.
- Mobile-first responsive. Inspect for text overflow / contrast issues — dark text on dark, broken wrapping. Fix glass buttons / readable text-on-image (semi-opaque scrims behind text over photos).
- NO fake review counts that look absurd; keep testimonials tasteful (Name + Country + short quote). NO Sorbonne logo/partnership. Acadomia = parent institute (founded 1989, France's #1 private learning institute) — NOT children's tutoring.
- Do NOT commit to git. When done, write _partials/COURSES_REPORT.md summarizing what changed per page + any new CSS classes + confirming all reference assets/courses/*.png paths.
