# French Atelier — Internal Pages Polish Report

Deployed: project_path `/home/user/workspace/fa-site`, entry `index.html`, site_name "The French Atelier by Acadomia". Validation passed.

## Pages touched & what changed

### Shared infrastructure (applied to ALL 28 owned pages)
- Injected the icon **sprite** (after `<body>`) and the **advisor modal** (before `js/fa.js`) on every owned page via idempotent `_partials/inject_shared.py`.
- Appended a polish CSS block to `css/fa.css` (uses existing corrected tokens — no duplication): nav-link/btn `white-space:nowrap` (fixes nav wrapping), narrow-desktop nav sizing, `.faq-list/.faq-q/.faq-a`, `.blog-feature/.blog-grid/.bcard`, `.article-body`, `.jul-chat/.jul-feat`, `.price-grid/.price-card/.price-feats`, `.val-grid/.val-card`, helper classes.

### Lead-gen / CTAs (every page)
- 12 content pages (how-it-works, method, juliane, teachers, culture, pricing, faq, blog, about, acadomia, capsules, map) received the inline **`.advisor-section`** lead form (page-unique field IDs) before the footer. Form uses native validation + mailto fallback to advisor@eTeacherGroup.com, bound by `.advisor-form` class in fa.js.
- contact.html keeps its own dedicated contact form (lead-gen present).
- terms.html / privacy.html received a "Talk to an Advisor" `btn-3d` with `data-advisor` in the legal footer strip.
- pricing.html advisor CTAs (`data-advisor` triggers + form).

### Page-specific
- **pricing.html**: rewrote hero subline to "$42/week on the annual plan"; replaced old 3-card grid ($39/$42/$59) with 2 premium cards — **Annual $42/wk featured = $840 full course (20 lessons, 85 min)** and **Pay Monthly from $56/wk**. Both list small groups 8–10, certificate by Acadomia, Juliane 24/7, $100 credits. Clear "Enroll Today" + "Talk to an Advisor" CTAs.
- **teachers.html**: added "Meet four of our teachers on screen" section with 4 lazy-loaded `youtube-nocookie` iframes (Charline G0lUXZKwg-8, Caitlin WbodfrXFjyg, Philippe z-l7f4qOmEo, Stan TqBegklrz-E) + "Watch more on YouTube" link. All 8 real teachers with portraits + regions already showcased in premium grid.
- **juliane.html**: confirmed premium 24/7 AI tutor page (hero, 6 capabilities, conversation demo, "While Paris sleeps", ecosystem, CTAs).
- **faq.html**: elegant self-contained accordion (8 Q&A) verified; navy advisor CTA + form.
- **blog.html**: editorial magazine layout — featured post (`.blog-feature` split) + 11-card `.blog-grid`, navy CTA, advisor form.
- **blog/*.html (11 posts)**: editorial article layout (hero, body, pull-quote, inline images), each links **back to the journal hub** + "Explore Courses" CTA + related-posts grid.

## QA performed (desktop 1440 + mobile 390)
Screenshots saved to `_partials/qa_internal_*.png` (+`_m` for mobile) for: pricing, teachers, faq, juliane, blog, and one blog post.
- No text wrapping/overflow, no low-contrast, no broken layout found.
- Mobile: cards/grids stack to single column correctly; advisor forms render; teacher video grid stacks.
- Reveal-on-scroll content confirmed present (initial fast-scroll screenshots showed reveals un-triggered; verified by forcing `.in` class — all content renders).
- Teacher YouTube iframes render as black in headless capture (lazy iframes) — correct behavior; they show thumbnails in a real browser.

## Notes for parent
- DO NOT TOUCH list respected: index.html, courses.html, courses/*.html, css/mapstr.css, js/mapstr.js left unchanged.
- Committed at milestone (git `d3d0b4f`).
- **Parent must call `deploy_website` itself** with the same args to surface the preview as a component in the main chat:
  - project_path: `/home/user/workspace/fa-site`
  - site_name: `The French Atelier by Acadomia`
  - entry_point: `index.html`
