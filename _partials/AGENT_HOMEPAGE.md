# HOMEPAGE AGENT — French Atelier (index.html)

You are building premium homepage folds for "The French Atelier by Acadomia", a LUXURY French language education brand (LVMH/MasterClass/Harvard/Awwwards-level quality). Light ivory site (--ivory #F7F2E9, --paper #FCF8F1) with ONE intentional dark fold. Brand: navy #0B1340, Parisian pink #E4A6B8, terracotta #C97A4E, gold #C8A560 (gold SPARINGLY). Fonts: Cormorant Garamond (serif) + Inter. Existing CSS: css/fa.css, css/mapstr.css. JS: js/fa.js (handles .reveal scroll animations).

WORKING DIR: /home/user/workspace/fa-site
TARGET FILE: index.html (1619 lines). Read it fully first. Also read css/fa.css for existing component classes (.btn-3d, .btn-3d-primary, .btn-3d-secondary [data-advisor opens modal], .power-strip, .marquee, .advisor-form, .neon-splash, .reveal).

## YOUR 5 DELIVERABLES (all into index.html + css/fa.css as needed)

### 1. BLACK SORBONNE METHODOLOGY FOLD (highest priority — "enormously important")
Read /home/user/workspace/fa-site/data/method_research.md FULLY. Build a large, premium, cinematic BLACK-background fold (deep near-black #0A0A0C). This is the ONE intentional dark fold on the whole site. Place it in the upper-middle area of the page (after the hero/courses showcase, before the Mapstr fold — find a logical spot; do NOT remove the existing Mapstr fold which lives in _partials/mapstr-fold.html wired in).
- Headline using approved framing: method built on the action-oriented, communicative tradition advanced by applied linguists at the Sorbonne and codified in the CEFR. Sub ties to "Live French. Live." / "Culture speaks French."
- 5 elegant CLICKABLE items = the 5 real pillars from method_research.md. Clicking an item OPENS a refined graphic card (accordion or modal-card) revealing that pillar's explanation + the real author/source citation. Fresh execution — do NOT copy Longevity's protocol layout.
- Gold/pink/terracotta accents on black, used sparingly. Glass/translucent surfaces welcome.
- Discreet credibility row at bottom: "Grounded in peer-reviewed applied-linguistics research" + real source names as links (URLs in method_research.md). Use markdown-style? No — these are HTML <a> links with the real URLs.
- NEVER claim Sorbonne partnership/logo. Text trust element only.
- Write the JS for click-open interaction inline or into js/fa.js. Keyboard accessible (button elements, aria-expanded).

### 2. PLACEMENT-TEST LEAD MAGNET STRIP (lower-middle of page, NOT last)
A beautiful, eye-catching, clickable strip: "Which French course is right for you?" — a free French placement test / level finder lead magnet. Inspired by Longevity's "bio age" lead magnet (a striking cover image + bold invitation + CTA). Place in the LOWER-MIDDLE of the homepage (not the final fold).
- Needs a cover image. Use placeholder src "assets/leadmagnet/placement-test.png" (the main agent will generate it). Add a tasteful CSS gradient fallback so it looks good even before the image lands.
- CTA button (use .btn-3d-primary style or data-advisor). Link to a sensible target (e.g. contact.html or #placement). Make it feel premium and irresistible.

### 3. ACADOMIA POWER-NUMBERS STRIP (restore from old site)
A small, elegant stat strip presenting Acadomia academic credibility. The OLD SITE had: STUDENTS ENROLLED ANNUALLY / ACCLAIMED FRENCH TEACHERS / HOURS OF FRENCH TEACHING. **CRITICAL: the live old site shows all as "0K" placeholders — DO NOT invent fake numbers.** Render as elegant labels. You MAY instead use the genuinely true facts: "Founded 1989", "France's #1 private learning institute", "Groups of just 8–10". Frame around Acadomia parent-brand credibility. NEVER frame as children's tutoring. A reusable partial exists at _partials/power-strip.html — you may adapt it. Place near top-third for credibility.

### 4. eTEACHER GROUP BLOCK (port + adapt from Longevity Life Academy)
The Longevity Life Academy homepage has an "eTeacher Group" block with partner logos + live-format features. Re-capture/design a fresh equivalent for French Atelier: "Powered by eTeacher's award-winning learning platform" + LMS feature highlights from old site (Course & Content Library, Lesson Recordings, Live Sessions Q&A, Discussion Groups, Progress Tracking, 24/7 Learners Community). Present as an elegant logos/features block. There is an existing .power-strip black logo marquee — keep it consistent with brand. Do NOT make this a second black fold (only the Sorbonne fold is black).

### 5. INJECT ADVISOR-MODAL (bug fix)
index.html has data-advisor buttons but NO advisor-modal markup. Inject the contents of _partials/advisor-modal.html right before </body>. Verify js/fa.js wires data-advisor clicks to open it (if not, add the handler). The form uses mailto:advisor@eTeacherGroup.com fallback.

## RULES
- Match existing brand exactly. Read css/fa.css before adding styles; reuse tokens/vars. Do not break the existing hero, courses showcase, or Mapstr fold.
- Mobile-first responsive — test mentally at 375px.
- NO baked-in fake numbers anywhere. NO Sorbonne logo/partnership claims. Acadomia = parent institute credibility, NOT kids tutoring.
- Commit nothing to git (main agent integrates). Just edit files.
- When done, write a short report to _partials/HOMEPAGE_REPORT.md listing exactly what you changed (line ranges, new CSS classes, new image paths referenced) so the main agent can integrate/QA.
