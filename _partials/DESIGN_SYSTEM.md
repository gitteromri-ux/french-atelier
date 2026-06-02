# French Atelier — Global Design System (Agent 5)

**Owner:** Agent 5. **Consumers:** Agents 1, 3, 4 (use these classes/markup verbatim).
Everything lives in `css/fa.css` + `js/fa.js`. Copy-paste blocks live in `_partials/`.
Color LOCK: navy `#0B1340`, gold `#C8A560`, ivory `#F5EFE5`. **Never a gold background.**
Fonts: Cormorant Garamond (display) + Inter (UI/body), loaded inside `css/fa.css`.

## How to wire a page
Every page must include in `<head>`:
```html
<link rel="stylesheet" href="css/fa.css">
```
And just before `</body>`:
```html
<script src="js/fa.js"></script>
```
`fa.js` auto-initializes: header scroll state, scroll reveals, mobile drawer, ambient/pillar
videos, course accordion, sound-video, **marquee pause-on-hover, advisor modal, form validation**.

### Required includes (paste verbatim from the partials)
1. **Icon sprite** — paste `_partials/icons.html` ONCE near the top of `<body>` (needed for any `<use href="#i-...">`).
2. **Nav** — paste `_partials/nav.html` at the top of `<body>` (after icons).
3. **Footer** — paste `_partials/footer.html` at the bottom of `<body>`.
4. **Advisor modal** — paste `_partials/advisor-modal.html` ONCE just before `<script src="js/fa.js">`.
   Any element with `data-advisor` opens it (the nav CTA already has it).

Adjust relative `href`/`src` paths if a page lives in a subfolder.

---

## 1) 3D Tactile Buttons — `.btn-3d`
Layered depth shadow, gold sheen sweep on hover, real pressed state on `:active`.
Base class `.btn-3d` + a variant. Optional `.btn-lg` for larger. Works on light and dark bands.

```html
<!-- Primary: gold face on navy text -->
<button class="btn btn-3d btn-3d-primary" type="button">
  Talk to an Advisor
  <svg class="fa-icon" style="font-size:17px"><use href="#i-arrow-right"/></svg>
</button>

<!-- Secondary: outline / glassy -->
<button class="btn btn-3d btn-3d-secondary" type="button">Explore Courses</button>

<!-- Large -->
<button class="btn btn-3d btn-3d-primary btn-lg" type="button">Enroll Today</button>

<!-- As a link -->
<a class="btn btn-3d btn-3d-primary" href="pricing.html">View Pricing</a>
```
- On a dark band (`.bg-navy`, `.on-dark`), `.btn-3d-secondary` auto-switches to a glassy gold-on-dark look.
- To open the advisor modal from ANY button, add `data-advisor`.
- The legacy `.btn .btn-gold` / `.btn-outline` classes still exist (back-compat) but **prefer `.btn-3d`** for new work.

---

## 2) Black Power-Strip (infinite logo marquee) — `.power-strip`
Full-bleed near-black band; logos auto-scroll in a seamless loop, pause on hover.
Logos are pre-tinted ivory in `assets/partners/white/` (grandprix, capital, fft, ffgolf, tonyparker).
**The marquee track must contain the `.marquee-group` TWICE** (second one `aria-hidden`) for a seamless loop.

```html
<!-- Variant A: simple logo strip -->
<section class="power-strip">
  <div class="power-strip-eyebrow">Recognised &amp; trusted across France</div>
  <div class="marquee">
    <div class="marquee-track">
      <div class="marquee-group">
        <img src="assets/partners/white/grandprix.png" alt="Grand Prix" loading="lazy">
        <img src="assets/partners/white/capital.png" alt="Capital" loading="lazy">
        <img src="assets/partners/white/fft.png" alt="Fédération Française de Tennis" loading="lazy">
        <img src="assets/partners/white/ffgolf.png" alt="Fédération Française de Golf" loading="lazy">
        <img src="assets/partners/white/tonyparker.png" alt="Tony Parker Academy" loading="lazy">
      </div>
      <div class="marquee-group" aria-hidden="true"><!-- IDENTICAL copy of the 5 imgs, alt="" --></div>
    </div>
  </div>
</section>
```
```html
<!-- Variant B: power-claim headline beside the marquee -->
<section class="power-strip power-strip-claim">
  <div class="wrap">
    <div class="power-claim-inner">
      <div class="power-claim-text">
        <span class="pc-eyebrow">Presented by</span>
        <h2>France&rsquo;s <em>#1</em> private learning institute</h2>
      </div>
      <div class="marquee"><div class="marquee-track">
        <div class="marquee-group"><!-- 5 imgs --></div>
        <div class="marquee-group" aria-hidden="true"><!-- 5 imgs duplicate --></div>
      </div></div>
    </div>
  </div>
</section>
```
Full ready-made copy of both variants: `_partials/power-strip.html`.

---

## 3) Lead-Gen Form — "Talk to an Advisor" (`.advisor-form`)
Fields: name, email, French level dropdown (Beginner/Intermediate/Advanced), preferred time.
Client-side validation + success state are wired automatically by `fa.js`.
**Submission:** mailto fallback `advisor@eTeacherGroup.com`. To wire a real endpoint, edit `js/fa.js`
(search comment `TO WIRE A REAL ENDPOINT`).

### Modal variant (recommended global)
Paste `_partials/advisor-modal.html` once per page. Open with any trigger:
```html
<button class="btn btn-3d btn-3d-primary" data-advisor type="button">Talk to an Advisor</button>
<a href="#" data-advisor>Talk to an Advisor</a>
```

### Inline section variant
Drop `_partials/advisor-section.html` anywhere you want the form embedded in the page
(`<section class="advisor-section" id="talk-to-advisor">`, editorial copy + `.advisor-card`).

### Minimal form markup (if hand-building)
```html
<form class="advisor-form" novalidate>
  <div class="field"><label for="x-name">Name</label>
    <input id="x-name" name="name" type="text" placeholder="Your full name">
    <span class="err-msg" aria-live="polite"></span></div>
  <div class="field"><label for="x-email">Email</label>
    <input id="x-email" name="email" type="email" placeholder="you@example.com">
    <span class="err-msg" aria-live="polite"></span></div>
  <div class="field"><label for="x-level">French level</label>
    <select id="x-level" name="level">
      <option value="" disabled selected>Select your level</option>
      <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
    </select><span class="err-msg" aria-live="polite"></span></div>
  <div class="field"><label for="x-time">Preferred time</label>
    <input id="x-time" name="time" type="text" placeholder="e.g. Weekday evenings (CET)">
    <span class="err-msg" aria-live="polite"></span></div>
  <div class="form-submit"><button class="btn btn-3d btn-3d-primary" type="submit">Request a Call</button></div>
</form>
<!-- success block (sibling inside the same .advisor-card) -->
<div class="advisor-success" role="status">
  <div class="success-mark"><svg class="fa-icon" style="font-size:28px"><use href="#i-check"/></svg></div>
  <h3>Merci&nbsp;!</h3><p>Your request is on its way to our advisor.</p>
</div>
```
Note: `name`, `email`, `level`, `time` field names are required for validation to attach.
Wrap the form + success block in `.advisor-card` so the success state can swap them.

---

## 4) Shared Nav & Footer
- **Nav:** `_partials/nav.html` — logo + links (Courses, How It Works, Method, Teachers, Culture,
  Pricing, Blog, Contact) + gold `.btn-3d` "Talk to an Advisor" (`data-advisor`) + mobile drawer (`#navDrawer`).
- **Footer:** `_partials/footer.html` — verbatim: 7 rue de la Baume, 75008 Paris · +1-888-230-5110 ·
  advisor@eTeacherGroup.com · Copyright ACADOMIA © 2025 · FB/IG/YT links.
- For pages with a light hero, add `class="light-hero"` to `<body>` so nav text stays legible.

---

## 5) Bespoke SVG Icons
Paste `_partials/icons.html` once. Use anywhere; size via `font-size`, color via `color`:
```html
<svg class="fa-icon" style="font-size:24px;color:var(--gold-deep)"><use href="#i-globe"/></svg>
```
Available ids: `i-arrow`, `i-arrow-right`, `i-chevron-down`, `i-close`, `i-menu`, `i-check`,
`i-calendar`, `i-clock`, `i-chat`, `i-play`, `i-globe`, `i-certificate`, `i-sparkle`, `i-user`,
`i-mail`, `i-phone`, `i-pin`, `i-facebook`, `i-instagram`, `i-youtube`.

---

## 6) Motion, reveals & accessibility (already global)
- **Scroll reveal:** add `.reveal` (+ optional `.reveal-d1..d4` stagger). `fa.js` adds `.in` on view.
- **Easing tokens:** `--ease-out`, `--ease-in-out`, `--ease-spring`, `--ease-press`.
- **Shadows:** `--shadow-sm/md/lg`. **Near-black band:** `--near-black`.
- `prefers-reduced-motion` is respected (marquee + reveals + button motion disable). `:focus-visible`
  gold outlines on all interactive elements.

## Do NOT touch
Agent 5 owns only `css/fa.css`, `js/fa.js`, and `_partials/`. Do not edit `index.html` or course/internal
pages. Existing components (`.world` accordion, `.pillar` video grid, `.tvid`, video system) are preserved.
