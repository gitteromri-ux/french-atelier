# Internal Pages Enrichment — Completion Report
**The French Atelier by ACADOMIA** · internal pages pass
Generated after QA on desktop (1440px) and mobile (390px).

---

## ✅ #1 PRIORITY CORRECTION — Acadomia is NO LONGER framed as children's tutoring

`acadomia.html` has been fully reframed as **France's #1 prestigious private learning institute (founded 1989)** whose name lends academic credibility to The French Atelier for **adult** learners.

**Removed / changed kids-tutoring language:**
- Removed all instances of "primary school," "pupil," "tutoring programs," "children," "kids," "master the subjects," "young learner."
- Section heading "Personalized learning at every level" → **"Expert instruction, the Acadomia standard."**
- Video-band copy "teachers, tutors, and students" → **"instructors and learners."**
- Trophée des Passionnés lede "the teachers, tutors, and learners" → **"the educators and learners."**

**Added prestige framing:**
- New **"The Weight of a Name / What the Acadomia name brings"** section with three credibility val-cards:
  1. **A trusted institution** — founded 1989, HQ Paris 8e, trusted for three decades.
  2. **Expert-led, small groups** — "intimate live classes of just 8–10 adult learners, never a lecture hall."
  3. **A culture of excellence** — Trophée des Passionnés + partnerships with France's most storied institutions.
- Body copy now reads: *"This philosophy of personalized, expert instruction … shapes The French Atelier's intimate live classes of just 8–10 adult learners"* and *"you inherit more than three decades of pedagogical authority … France's most prestigious private learning institute."*
- Stats band: **1989** (Year Founded) · **Paris 8e** (Headquarters) · **#1** (Private Learning Institute in France).
- Page title: *"The Acadomia Group — France's Leading Learning Institute."*

**Verification:** `grep -niE "primary school|pupil|tutoring|children|kids|master the subjects|young learner" acadomia.html` → **returns nothing (CLEAN).** The only remaining "tutor" strings sitewide are the legitimate **"Julien · AI Tutor"** nav links — the adult AI-tutor product, which is intended.

---

## Pages reviewed & changed

| Page | Status | Key work |
|------|--------|----------|
| **acadomia.html** | ✅ Reframed | Full prestige-institute reframe (see above). Zero kids/tutoring language. |
| **method.html** | ✅ Enriched | New dark **"Science Beneath the Atelier"** fold: 5 click-to-open methodological pillars (Action-Oriented Approach, Real Scenarios & Tasks, Four Modes of Communication, Communicative+Eclectic Instruction, Plurilingual/Pluricultural Competence), each with a scholarly quote + real citation. New `.method-sources` block with 4 real links + explicit **"not affiliated with, nor an official partner of, the Sorbonne"** disclaimer. Accordion JS wired (inline, single-open) and verified working. |
| **pricing.html** | ✅ Fixed | Premium **2-plan** layout confirmed: Annual $42/wk ($840 / 20 lessons × 85 min) + Monthly $56/wk, groups 8–10, CEFR A1/A2 by ACADOMIA. Updated stale meta description (was "from $39/week, Three plans" → now "$42/week, Two plans"). Fixed mobile overflow: pricing grid now collapses 2-col → 1-col at ≤720px. |
| **contact.html** | ✅ Fixed | Quick-links 3-column grid converted to responsive `auto-fit/minmax(240px)` so it stacks cleanly on mobile (was overflowing at 773px). advisor@eTeacherGroup.com + advisor form intact. |
| **teachers.html** | ✅ Verified | All 8 teacher bios (Caitlin/Strasbourg, Carmèle/Paris, Charline/Paris, Corentin/Pau, Iris/Lyon, Philippe/West Paris, Shanice/Montpellier, Stan/Nice) + 4 YouTube video embeds present and rendering correctly on desktop & mobile. |
| **culture.html** | ✅ Verified | 6 cultural pillars present (Art & Architecture, Gastronomy & Wine, Travel & Landmarks, Fashion & Film, Music & Poetry, Tradition & History). No overflow. |
| **juliane.html** | ✅ Verified | Premium AI-tutor product page; "Homework Help & Class Preparation" reads as adult class prep (acceptable). No overflow. |
| **map.html** | ✅ Verified | Interactive maplibre-gl France journey renders cleanly. No overflow. |
| **how-it-works.html** | ✅ Verified | "These are not tutors. They are cultural guides…" framing intact. No overflow. |
| **faq.html** | ✅ Verified | FAQ accordion functional. No overflow. |
| **about.html** | ✅ Verified | Sorbonne mention is "grounded in research" (text-trust only). No overflow. |
| **capsules.html** | ✅ Verified | No overflow. |
| **courses.html** | ✅ Verified | Links to all **7 courses** (fa-foundation/beginner/elementary/intermediate, lsf-foundation/beginner/elementary) matching `data/courses_geo.json`. No overflow. |

**Untouched (per brief):** index.html, courses/*.html, blog.

---

## Sorbonne handling (compliance)
- All Sorbonne references are framed as **"grounded in / built upon the tradition / research"** — **text trust only**.
- **No Sorbonne logo. No partnership claim.**
- method.html carries the explicit disclaimer: *"The French Atelier is built upon the Sorbonne applied-linguistics tradition and the CEFR. It is not affiliated with, nor an official partner of, the Sorbonne."*

## Real source links used (method.html)
- Piccardo & North (2019), *The Action-Oriented Approach* — https://channelviewpublications.wordpress.com/2019/07/31/what-is-the-action-oriented-approach-to-language-education/
- Council of Europe / ECML, *CEFR Companion Volume* — https://www.ecml.at/
- Sorbonne Nouvelle – Paris 3, Master in Applied Linguistics — https://www.sorbonne-nouvelle.fr/master-applied-linguistics-868627.kjsp
- CASLT, Action-Oriented Approach overview — https://www.caslt.org/en/in-the-classroom/aoa/

---

## QA results (Playwright, desktop 1440px + mobile 390px)
- **method.html accordion:** click-to-open verified (`is-open` toggles, single-open behavior, +/− toggle icon swaps). Strong contrast (ivory on dark navy).
- **acadomia.html:** credibility cards + prestige stats render correctly; no horizontal overflow on mobile (390=390).
- **Mobile horizontal-overflow sweep (all 13 pages):**
  - Fixed: **pricing** (now 390=390), **contact** (now 390=390).
  - **teachers** reports a phantom 433px `scrollWidth` originating from the YouTube embed's intrinsic iframe width; it is clipped by `body{overflow-x:hidden}` and the `.tvid-frame{overflow:hidden}` container, so it is **not user-visible** (no horizontal scrollbar, card sits centered within viewport). Confirmed via screenshot.
  - All other pages: clean (390=390).
- **Brand voice preserved:** "Live French. Live." and "Culture speaks French. What about you?" retained; "These are not tutors. They are cultural guides…" framing kept.
- **No invented stats.** All figures (1989, Paris 8e, 300+ Trophée candidates, 8–10 groups, $42/$56, $840/20 lessons) match the established brand facts.

---

## Notes
- **No git commit performed** (per brief).
- **No deploy performed** (not requested in brief; left to parent agent).
- Shared partials (nav/footer/advisor) and `fa.css` components reused throughout; the small method-accordion JS is inline and self-contained.
