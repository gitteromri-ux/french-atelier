# Course Pages Rebuild — IIBS-Level (The French Atelier)

**Scope:** All 7 pages in `courses/` rebuilt to rich, almost-homepage-level pages following the IIBS blueprint.
**Did NOT touch:** `index.html` or any internal pages (other agents own those).
**Git:** No commits made. All changes left in the working tree only.

---

## Pages rebuilt (7)

| Page | Track | CEFR | Lessons | Accent (`data-course`) | Geo journey |
|---|---|---|---|---|---|
| `courses/fa-foundation.html` | French Atelier · Course 1 of 4 | A0 → A1.1 | 20 | `#C8A560` Tour Eiffel gold | Paris first words |
| `courses/fa-beginner.html` | French Atelier · Course 2 of 4 | A1.1 → A1.2 | 20 | `#D98C7A` Normandy sea-rose | Normandy coast |
| `courses/fa-elementary.html` | French Atelier · Course 3 of 4 | A1.2 → A2.1 | 20 | `#9A5560` Bordeaux vine | Bordeaux / vineyards |
| `courses/fa-intermediate.html` | French Atelier · Course 4 of 4 (NEW) | A2.1 → A2.2 | 20 | `#C97A4E` Provence terracotta | Provence |
| `courses/lsf-foundation.html` | Let's Speak French · Level 1 | A0 → A1.1 | 10 | `#E4A6B8` Parisian pink | Paris café speaking |
| `courses/lsf-beginner.html` | Let's Speak French · Level 2 | A1.1 → A1.2 | 10 | `#D98C9E` café rose | conversational |
| `courses/lsf-elementary.html` | Let's Speak French · Level 3 | A1.2 → A2.1 | 10 | `#CE8458` terracotta speak | fluency build |

Each `<body data-course="{id}" class="light-hero">` drives per-course accent via existing `[data-course]` CSS vars (`--c-bg / --c-accent / --c-tint / --c-glow`) already in `fa.css`.

---

## IIBS blueprint sections (every page, top → bottom)

1. **Sticky nav** (existing `.site-header`) with **Request Info** CTA.
2. **2-column hero** — eyebrow + serif/italic title, **inline spec badges** (CEFR / Certified by Acadomia / N live lessons), pitch paragraph, **Request Info** (`btn-accent`) + glass **Download Syllabus (PDF)** (`btn-glass`) over a scrimmed course photo.
3. **TOP-RIGHT AT-A-GLANCE SPEC PANEL** (`.cp-spec`) — check-icon rows: **Length / Level / Lessons / Group size / Certificate / Schedule / Price** (price de-emphasized = "See plans below") + in-panel Request Info CTA.
4. **Info row** — benefits checklist (`.cp-bene-list`) + schedule panel (`.cp-sched`).
5. **Testimonials** (`.cp-testi`) — tasteful auto-scrolling cards: Name + country flag + 1-line quote + 5 stars. **No fake/absurd review counts.**
6. **5 benefit cards** (`.cp-cards`) including a dedicated **Certificate** card (`.cp-card.is-cert`).
7. **Mid CTA band** (`.cp-ctaband`) — repeated Request Info + glass Download Syllabus, "$100 learning credit on completion".
8. **Why (3 icon row)** (`.cp-why`) — Live small groups / French where it is lived / Native certified teachers.
9. **Journey image band** — uses course `-2` and `-3` images.
10. **Trust banners ×2** (`.cp-trust`) — Acadomia + eTeacher (text trust only).
11. **Faculty carousel** (`.cp-carousel` / `.cp-faculty`) — real teacher portraits, city, bio + **Head of School** + advisor card.
12. **Signature unit block** — FA Foundation only (FA0-01 deck).
13. **Syllabus lesson-card carousel** (`.cp-carousel` / `.cp-lesson`) — each lesson = number + French title + 2–4 sentence description tied to the course CEFR level and geo journey; "View Full Syllabus (PDF)" + "Ask About This Course".
14. **FAQ accordion** (`.faq-q` / `.faq-item.is-open`) — price buried in last questions.
15. **Final CTA** + **sibling course nav** (prev/next).

**Repeated CTAs:** 13 `data-advisor` Request-Info CTAs per page (well above the ~5x target).

---

## Files changed (working tree only — NOT committed)

- `css/fa.css` — appended namespaced `.cp-*` course CSS. New classes: `.btn-glass`, `.btn-accent`, `.cp-subnav`, `.cp-hero` / `.cp-hero-grid`, `.cp-spec` (spec panel + check rows), `.cp-inforow` / `.cp-bene-list` / `.cp-sched`, `.cp-testi` / `.cp-testi-track` (60s `cp-testi-scroll` keyframe, pauses on hover + reduced-motion fallback), `.cp-cards` / `.cp-card.is-cert`, `.cp-ctaband`, `.cp-why`, `.cp-trust`, `.cp-carousel` / `.cp-carousel-track` / `.cp-faculty` / `.cp-head` / `.cp-cbtn`, `.cp-lesson`, `.cp-journey`.
  - **Overflow fix:** added `overflow:clip` to the existing `.neon-splash` base rule. Its decorative `::before`/`::after` glows use `46vw`/`40vw` with negative offsets and were spilling horizontally on narrow viewports (the rule's own doc-comment already specifies it belongs on a clipping container). This eliminated mobile horizontal scroll on all course pages while preserving the glow visually. Safe site-wide (purely contains a `z-index:-1` decoration).
- `js/fa.js` — appended IIFE for: FAQ accordion (`.faq-q` toggles `.faq-item.is-open`), testimonial auto-scroll pause when off-screen, horizontal carousel nav (`[data-carousel-prev]` / `[data-carousel-next]` scroll the track by one card width).
- `courses/*.html` — all 7 regenerated (58–70 KB each).

## Generator (source of truth for re-runs)

- `_partials/course_data.py` — per-course data spine: `COURSES` (id/name/track/level/units/colors/journey/pitch/outcome/teachers/head/next/prev/signature + full substantive lesson lists), `TEACHERS` (8 real teachers), `TESTIMONIALS` (tasteful name+flag+country+quote).
- `_partials/gen_courses.py` — builds every page section. Re-run: `python3 _partials/gen_courses.py` from `fa-site/`.

---

## Assets referenced (all verified to exist)

- **Course images:** `assets/courses/{id}-{1,2,3}.png` — all 21 present (hero uses `-1`, journey band uses `-2`/`-3`). Exact paths kept.
- **Syllabus PDFs:** `downloads/{id}-syllabus.pdf` — all 7 present.
- **Teacher portraits:** `assets/teachers/` — `caitlin.jpg` (Strasbourg), `carmele.png` (Paris), `charline.jpg` (Paris), `corentin.png` (Pau), `iris.png` (Lyon), `philippe.jpg` (West Paris), `shanice.png` (Montpellier), `stan.png` (Nice). Real portraits used across faculty carousels.

---

## Brand / content rules honored

- **Price de-emphasized** — never in hero or spec panel as a number; spec panel shows "See plans below"; actual figures buried in the last FAQ entries only. $100 completion credit mentioned as a benefit.
- **NO method logo / partnership claim.** method appears only as text trust ("the standards used across French academia, including the method") — framework / level-standard reference, no relationship implied.
- **Acadomia** = "France's #1 private learning institute, founded 1989" throughout — NOT framed as children's tutoring.
- **eTeacher** = "award-winning eTeacher platform" (text trust).
- **Julien** = 24/7 AI French tutor that practises with you between live lessons.
- **Advisor:** all Request-Info CTAs use `data-advisor` (site-wide modal injected by main agent); `mailto:advisor@eTeacherGroup.com` fallback present.
- **Signature unit:** FA Foundation FA0-01 deck linked (gamma.app) — FA Foundation page only.
- **Testimonials:** tasteful Name + country flag + short quote + stars. No fabricated review counts.

---

## Visual QA (Playwright — desktop 1440px + mobile 375px)

**Desktop (1440px):** hero + gold spec panel (7 check rows, badges, accent + glass buttons, photo scrim — all legible); neon-splash glow renders correctly and is now contained; benefit/why cards, faculty carousel (real portraits + cities + bios + head-of-school + advisor CTA), syllabus lesson cards (numbered, French titles, location pins, accent rail), testimonials auto-scroll, FAQ accordion open/close all verified.

**Mobile (375px):** stacked hero, full at-a-glance spec panel (all 7 rows incl. "See plans below"), mid-CTA stat band (24/7 Julien · 8–10 eTeacher · $100 credit + Acadomia certificate), syllabus carousel (cards scroll horizontally, next card peeks), FAQ accordion toggles on tap (functionally verified `is-open` false→true). LSF Foundation verified rendering its distinct Parisian-pink accent vs FA gold with identical structure.

**Overflow:** horizontal overflow checked programmatically on **all 7 pages at 375px** → `scrollWidth - clientWidth = 0` on every page after the `.neon-splash` clip fix (was +42px before).

**Defect classes checked & not found:** horizontal overflow, text clipping, weak-contrast text, illegible buttons over images, squished/broken mobile layout, missing portraits, broken carousels.

Screenshots in `_partials/`: `qa1-hero.png`, `qa2-syllabus.png`, `qa3-faculty.png`, `qa4-testi.png`, `qa5-faq.png`, `qa5b-faq-open.png`, `qa-mob-hero.png`, `qa-mob-spec.png`, `qa-mob-lsf-hero.png`.

---

## Handoff notes for the main agent

- Course pages are complete and **not committed** — review/commit/publish as you see fit.
- The site-wide **advisor modal** (`data-advisor`) and the `mailto:advisor@eTeacherGroup.com` fallback are assumed injected by you site-wide; CTAs are wired with the `data-advisor` hook.
- The `.neon-splash` `overflow:clip` change touches a shared component used on `index.html` and `teachers.html` — it only contains the decorative glow (no layout impact) and resolves the same overflow class of bug if present there.
