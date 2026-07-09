# Homepage Power Folds — Implementation Report

**Scope:** Homepage only. Files edited: `index.html`, `css/fa.css`, `js/fa.js`.
**Untouched (per brief):** `courses/*.html` and all other internal pages, the existing hero, courses showcase, and Mapstr fold. **No git commit. No deploy.** (Subagent role — parent integrates.)

---

## File size changes

| File | Before | After |
|------|--------|-------|
| `index.html` | 1619 | **1901** |
| `css/fa.css` | 1093 | **1507** |
| `js/fa.js` | 182 | **246** |

---

## Deliverables — exact locations

### 1. Acadomia power-numbers credibility strip (TRUE facts only)
- **HTML:** `index.html` lines **244–262** — `<section class="ac-cred bg-ivory">`, placed **after the proof row, before the `#courses` showcase** (which begins at line 265).
- **Facts used (no invented numbers — old site's `0K` placeholders avoided):**
  - "Since **1989**" / Founded in Paris
  - "France's **#1**" / Private Learning Institute
  - "Just **8–10**" / Students per Live Group
- Eyebrow: "Presented by Acadomia".

### 2. BLACK Sorbonne methodology fold (5 click-to-open pillars)
- **HTML:** `index.html` lines **715–828** — `<section class="sorb" id="method-fold" aria-labelledby="sorb-title">`, inserted **between the courses showcase `</section>` and the Mapstr fold** (Mapstr preserved).
- Background `#0A0A0C` (the required black). Headline + eyebrow "THE SCIENCE OF OUR METHOD".
- **5 `.sorb-pillar` accordion cards** (each a `<button class="sorb-ph">` head with `aria-expanded` + `aria-controls=sorb-p1..p5`, body `.sorb-pbody > .sorb-pcard`, per-card accent via inline `--pcard-accent`):
  1. The Action-Oriented Approach — *l'approche actionnelle*
  2. Real Scenarios & Tasks — *situated learning*
  3. Four Modes of Communication — *Reception · Production · Interaction · Mediation*
  4. Communicative + Eclectic Instruction — *with explicit, guided structure*
  5. Plurilingual & Pluricultural Competence — *culture at the core*
- Each card grounded in `data/method_research.md` with a pull-quote + real source link.
- **Credibility row** `.sorb-cred` with 4 real source links:
  - Piccardo & North (2019), *The Action-Oriented Approach*
  - Council of Europe (2020), *CEFR Companion Volume* (ecml.at)
  - Sorbonne Nouvelle — Applied Linguistics / Didactique des langues
  - CASLT — Action-Oriented Approach
- **Disclaimer note** (`.sorb-cred-note`): "Our method draws on the Sorbonne tradition of applied linguistics and the CEFR. The French Atelier is independent and **not affiliated with, nor endorsed by, the Sorbonne**."

### 3. Placement-test lead magnet strip (lower-middle)
- **HTML:** `index.html` lines **1658–1686** — `<section class="lead-magnet bg-ivory" id="placement">`, placed in the lower-middle (before the pricing teaser).
- `.lm-card` with `.lm-cover` containing the cover image and `.lm-body`.
- **Image referenced:** `assets/leadmagnet/placement-test.png` (exists, ~5.4 MB Paris-café cover). `<img>` has `onerror` to hide and reveal a **CSS gradient fallback** on `.lm-cover`.
- Badge "FREE · 5 MINUTES"; meta bullets "CEFR-aligned · Instant result · No commitment".
- Two CTAs: primary "Find My French Level" and a **`data-advisor`** "Talk to an advisor instead" link (opens advisor modal).

### 4. eTeacher Group platform / LMS-features block (adapted for French Atelier)
- **HTML:** `index.html` lines **1598–1639** — `<section class="etg bg-paper" id="platform">` (NOT black, per brief), placed before the Julien AI section.
- Eyebrow "POWERED BY ETEACHER GROUP"; headline "One award-winning learning platform".
- **6 `.etg-feat` cards** with inline-SVG icons: Course & Content Library, Lesson Recordings, Live Sessions Q&A, Discussion Groups, Progress Tracking, 24/7 Learners' Community.
- Footer link "SEE HOW IT WORKS".

### 5. Advisor modal + icon sprite injection
- **Icon sprite:** `index.html` lines **1834–1839** — `<svg class="fa-icon-sprite">` defining symbols `#i-arrow-right`, `#i-close`, `#i-check` (index.html previously had no sprite; only the Mapstr `<defs>` existed). Used by the modal and the lead-magnet/eTeacher CTAs.
- **Advisor modal:** `index.html` lines **1843–1898** — `<div class="advisor-modal" ...>` markup copied from `_partials/advisor-modal.html`, injected **before `</body>`** (line 1900).
- **Wiring:** the open/close/ESC/backdrop/form-validation/`mailto:advisor@eTeacherGroup.com` JS **already existed** in `js/fa.js` (~lines 91–181) and binds to all `[data-advisor]` triggers automatically. Verified open (`advisor-modal open`, display:flex) and close (ESC → display:none) in Playwright.
- **`[data-advisor]` triggers on page:** Mapstr finale CTA + lead-magnet CTA.

---

## New CSS (css/fa.css)

New block appended at **lines 1311–1507** (header comment at 1311–1318; rules from 1319). All classes have responsive `@media` breakpoints (≤900 / ≤820 / ≤760 / ≤600px) — grids collapse to single column on mobile.

- **Acadomia:** `.ac-cred`, `.ac-cred-eyebrow`, `.ac-cred-inner`, `.ac-cell`, `.ac-fig`, `.ac-lab`
- **Sorbonne fold:** `.sorb`, `.sorb-head`, `.sorb-title`, `.sorb-sub`, `.sorb-pillars`, `.sorb-pillar`, `.sorb-ph`, `.sorb-ph-idx`, `.sorb-ph-name`, `.sorb-ph-fr`, `.sorb-ph-ico`, `.sorb-pbody`, `.sorb-pcard`, `.sorb-pull`, `.sorb-src`, `.sorb-cred`, `.sorb-cred-links`, `.sorb-cred-note` (open state via `.sorb-pillar.is-open`)
- **Lead magnet:** `.lead-magnet`, `.lm-card`, `.lm-cover`, `.lm-cover-badge`, `.lm-body`, `.lm-eyebrow`, `.lm-meta`, `.lm-actions`
- **eTeacher:** `.etg`, `.etg-head`, `.etg-grid`, `.etg-feat`, `.etg-ic`, `.etg-foot`

All colors use existing brand vars (`--navy`, `--pink`, `--terra`, `--gold`/`--gold-soft`/`--gold-deep`, `--on-dark`/`--on-dark-soft`/`--on-dark-faint`, `--ivory`, `--paper`), fonts `--serif` (Cormorant Garamond) / `--sans` (Inter). Gold used sparingly (eyebrows, accents, one CTA).

---

## New JS (js/fa.js)

- **Sorbonne pillar accordion** added at **lines 44–61** (inside the first IIFE, after the worlds accordion, before pillar videos). Single-open behavior: opening one pillar closes siblings; toggles `.is-open` and `aria-expanded`; keyboard-accessible because heads are real `<button>` elements.
- No changes to the existing advisor-modal logic (already present).

---

## Image paths referenced (new)

- `assets/leadmagnet/placement-test.png` — the only new image path referenced (lead-magnet cover). File present and loads. Gradient fallback applied via `onerror` if missing.

---

## QA summary (Playwright)

**Desktop (1280×900):**
- No console or page errors on load.
- Acadomia strip, eTeacher grid, lead-magnet (real cover image), Sorbonne fold all render correctly.
- Pillar accordion: 5 heads detected; click sets `aria-expanded=true`, opens card with pull-quote + source link.
- Advisor modal: `[data-advisor]` click → `advisor-modal open` (display:flex, card 560px, arrow icon visible); ESC → display:none, `open` removed.

**Mobile (375×800, DPR 2):**
- No horizontal overflow (`scrollWidth == clientWidth == 375`); no elements wider than viewport; no page errors.
- Acadomia: 3 cells stack vertically with dividers — true facts, no fake numbers.
- eTeacher: 6 feature cards single-column, icons render.
- Lead magnet: cover image, navy body, stacked meta, both CTAs render cleanly.
- Sorbonne fold: black bg, 5 pillars stack, first pillar opens (body ~605px) showing card + source citation; credibility row + disclaimer render. No wrapping/contrast issues.

**Screenshots** saved in `_qa/` (QA scratch): `acadomia.png`, `sorbonne_open.png`, `pillar1_open.png`, `leadmagnet.png`, `eteacher.png`, `advisor_modal.png`, `m_leadmagnet.png`, `m2_acadomia.png`, `m2_eteacher.png`, `m3_sorbonne.png`.

---

## HTML integrity
- `<section>` open/close balanced: **19 / 19**.
- Hero, courses showcase, and Mapstr fold preserved (not modified).
