#!/usr/bin/env python3
"""Restructure index.html sections per user spec:
   1) Move Acadomia power strip to right after Culture-dark pillars
   2) Replace 'Live from France' fold with new Julien (image-3 bg)
   3) Insert Testimonials fold after the new Julien
   4) Keep eTeacher in its current relative position (it follows the old Julien spot)
   5) Move Placement fold to right after eTeacher
   The original Julien block is removed (replaced by the new one).
"""
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Helper: extract a section by its opening anchor and stop before the next anchor.
def cut(start_marker, stop_markers):
    s = html.find(start_marker)
    if s < 0: raise SystemExit(f'missing: {start_marker[:60]}')
    e = -1
    for m in stop_markers:
        i = html.find(m, s + len(start_marker))
        if i >= 0 and (e < 0 or i < e):
            e = i
    if e < 0: raise SystemExit(f'no stop after: {start_marker[:60]}')
    return s, e, html[s:e]

# Find all anchor positions
ANCHORS = [
    "<!-- ===== HERO",
    '<section class="section-pad bg-ivory" id="courses">',
    '<section class="method method-v4" id="method-fold"',
    '<section class="section-pad culture-dark" id="culture">',
    '<!-- ===== HOW IT WORKS',
    '<!-- ===== MEET OUR TEACHERS',
    '<!-- ===== WATCH A REAL CLASS',
    '<!-- ===== SIX-PILLAR CULTURE',  # actually the mapstr block marker
    '<!-- ===== LIVE FROM FRANCE',
    '<!-- ===== JULIEN AI',
    '<!-- ===== eTEACHER GROUP PLATFORM',
    '<!-- ============================================================\n     METHOD METHODOLOGY FOLD',
    '<!-- ===== ACADOMIA BLACK POWER STRIP',
    '<!-- ===== PLACEMENT-TEST LEAD MAGNET STRIP',
    '<!-- ===== FAQ (homepage condensed)',
    '<!-- ===== CTA BAND',
    '<!-- ===== SVG ICON SPRITE',
]

# Sanity: each anchor must be present exactly once
for a in ANCHORS:
    if html.count(a) != 1:
        raise SystemExit(f'anchor not unique: {a!r} count={html.count(a)}')

# Snip sections (preserve trailing whitespace before next anchor)
def section_between(a, b):
    s = html.find(a); e = html.find(b)
    return html[s:e]

acadomia_block = section_between('<!-- ===== ACADOMIA BLACK POWER STRIP', '<!-- ===== PLACEMENT-TEST LEAD MAGNET STRIP')
live_from_block = section_between('<!-- ===== LIVE FROM FRANCE', '<!-- ===== JULIEN AI')
julien_block_old = section_between('<!-- ===== JULIEN AI', '<!-- ===== eTEACHER GROUP PLATFORM')
placement_block = section_between('<!-- ===== PLACEMENT-TEST LEAD MAGNET STRIP', '<!-- ===== FAQ (homepage condensed)')

# Build the NEW julien block with image-3 (paris-cityscape) as cinematic backdrop
new_julien_block = '''<!-- ===== JULIEN AI \u2014 cinematic Paris-cityscape backdrop (replaces "Live from France") ===== -->
<style>
/* Julien hero \u2014 cinematic backdrop (Paris cityscape video, audio-only Julien voice) */
.jul-hero{position:relative;overflow:hidden;min-height:680px;color:#F3EEE3;isolation:isolate;background:#00001F;}
.jul-hero-bg{position:absolute;inset:0;z-index:0;overflow:hidden;}
.jul-hero-bg video, .jul-hero-bg img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.85) brightness(.55);}
.jul-hero-bg::after{content:'';position:absolute;inset:0;background:
  linear-gradient(120deg,rgba(0,0,20,.88) 0%,rgba(0,0,20,.55) 45%,rgba(0,0,20,.25) 75%,rgba(0,0,20,.6) 100%),
  radial-gradient(60% 80% at 18% 50%,rgba(0,0,20,.7) 0%,rgba(0,0,20,0) 60%);}
.jul-hero-inner{position:relative;z-index:1;display:grid;grid-template-columns:1.05fr 1fr;gap:3.5rem;align-items:center;padding:6.5rem 0;}
.jul-hero-text .jul-eyebrow{display:inline-flex;align-items:center;gap:.6rem;font-size:.72rem;letter-spacing:.22em;text-transform:uppercase;color:#D8BC85;}
.jul-hero-text .jul-eyebrow::before{content:'';width:34px;height:1px;background:#D8BC85;display:inline-block;}
.jul-hero-text h2{font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(2.6rem,5vw,4.6rem);line-height:1.05;margin:1.2rem 0 1.4rem;color:#F3EEE3;}
.jul-hero-text h2 .gold-ital{color:#D8BC85;font-style:italic;}
.jul-hero-text p.lede{font-size:1.06rem;line-height:1.65;color:rgba(243,238,227,.82);max-width:52ch;}
.jul-hero-pts{list-style:none;margin:1.6rem 0 0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:.8rem 1.6rem;}
.jul-hero-pts li{display:flex;align-items:center;gap:.7rem;font-size:.95rem;color:rgba(243,238,227,.85);}
.jul-hero-pts li svg{width:18px;height:18px;color:#D8BC85;flex:0 0 18px;}
.jul-hero-cta{margin-top:2rem;display:flex;align-items:center;gap:1.4rem;flex-wrap:wrap;}
.jul-hero-cta .btn-gold{background:linear-gradient(135deg,#D8BC85,#B7965D);color:#00001F;font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:.78rem;padding:1rem 1.8rem;border-radius:999px;border:1px solid rgba(255,255,255,.25);text-decoration:none;display:inline-flex;align-items:center;gap:.5rem;box-shadow:0 10px 30px rgba(216,188,133,.25);}
.jul-hero-cta .btn-gold:hover{filter:brightness(1.08);}
/* The Julien character card with audio-only playback */
.jul-hero-card{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;border-radius:32px;overflow:hidden;
  background:radial-gradient(80% 80% at 50% 35%,rgba(28,34,56,.85) 0%,rgba(0,0,20,.6) 65%);
  border:1px solid rgba(216,188,133,.35);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);min-height:560px;
  box-shadow:0 30px 70px rgba(0,0,16,.55), inset 0 1px 0 rgba(255,255,255,.06);}
.jul-hero-card-badge{position:absolute;top:1.2rem;left:1.2rem;display:inline-flex;align-items:center;gap:.55rem;background:rgba(0,0,31,.6);backdrop-filter:blur(8px);border:1px solid rgba(216,188,133,.45);padding:.5rem 1rem;font-size:.66rem;letter-spacing:.2em;text-transform:uppercase;color:#D8BC85;border-radius:999px;z-index:3;}
.jul-hero-card-badge .dot{width:7px;height:7px;background:#D8BC85;border-radius:50%;animation:julDot 1.6s ease-in-out infinite;}
@keyframes julDot{0%,100%{opacity:.45}50%{opacity:1}}
.jul-hero-card-video{position:relative;width:100%;height:100%;display:flex;align-items:flex-end;justify-content:center;z-index:1;}
.jul-hero-card-video video{width:auto;height:100%;max-height:600px;object-fit:contain;filter:drop-shadow(0 22px 30px rgba(0,0,16,.45));}
.jul-hero-sound{position:absolute;bottom:1.2rem;right:1.2rem;z-index:3;display:inline-flex;align-items:center;gap:.5rem;background:rgba(0,0,31,.7);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.25);color:#F3EEE3;padding:.55rem 1.1rem;border-radius:999px;font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;cursor:pointer;}
.jul-hero-sound:hover{background:rgba(216,188,133,.18);border-color:rgba(216,188,133,.6);}
.jul-hero-sound .si-on{display:none;}
.jul-hero-sound[aria-pressed="true"] .si-off{display:none;}
.jul-hero-sound[aria-pressed="true"] .si-on{display:inline;}
@media (max-width:1000px){
  .jul-hero-inner{grid-template-columns:1fr;gap:2.4rem;padding:5rem 0;}
  .jul-hero-card{min-height:440px;}
  .jul-hero-pts{grid-template-columns:1fr;}
}
</style>
<section class="jul-hero" id="julien-fold" aria-label="Meet Julien \u2014 your 24/7 AI French tutor">
  <div class="jul-hero-bg" aria-hidden="true">
    <video poster="assets/video/paris-cityscape-poster.jpg" autoplay loop muted playsinline preload="metadata">
      <source src="assets/video/paris-cityscape.mp4" type="video/mp4">
    </video>
  </div>
  <div class="wrap jul-hero-inner">
    <div class="reveal jul-hero-text">
      <span class="jul-eyebrow">Practice Between Classes</span>
      <h2>Meet <span class="gold-ital">Julien</span><br>your 24/7 French coach.</h2>
      <p class="lede">Between live classes, Julien is your always-on AI French tutor inside the platform \u2014 ready the moment inspiration, or insomnia, strikes. In any timezone. In any mood. Always in French.</p>
      <ul class="jul-hero-pts">
        <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Pronunciation, sound by sound</li>
        <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Instant, kind corrections</li>
        <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Real conversation on demand</li>
        <li><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Available 24/7, always in French</li>
      </ul>
      <div class="jul-hero-cta">
        <a href="juliane.html" class="btn-gold">Discover Julien <span aria-hidden="true">\u2192</span></a>
        <a href="map.html" class="link-arrow" style="color:#D8BC85">Explore the map of France
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </div>
    </div>
    <div class="reveal jul-hero-card">
      <span class="jul-hero-card-badge"><span class="dot"></span> Julien \u00b7 Live AI Tutor</span>
      <div class="jul-hero-card-video">
        <video id="julien-hero-video" autoplay loop playsinline muted preload="auto" poster="assets/juliane/video-alpha/julian-336-poster.png" aria-label="Julien, the 24/7 AI French tutor">
          <source src="assets/juliane/video-alpha/julian-336.webm" type="video/webm">
          <img src="assets/juliane/video-alpha/julian-336-poster.png" alt="Julien, the 24/7 AI French tutor">
        </video>
      </div>
      <button type="button" class="jul-hero-sound" aria-pressed="false" aria-label="Toggle Julien voice on/off" onclick="(function(b){var v=document.getElementById('julien-hero-video');if(!v)return;v.muted=!v.muted;b.setAttribute('aria-pressed',!v.muted);})(this)">
        <span class="si-off">\u25b6 Hear Julien</span><span class="si-on">\u275a\u275a Mute</span>
      </button>
    </div>
  </div>
</section>

'''

# Build the NEW testimonials fold (black background, 3D card carousel)
testimonials_block = '''<!-- ===== TESTIMONIALS \u2014 black background, 3D Apple-sleek student stories ===== -->
<style>
.tst-fold{position:relative;background:#000;color:#F3EEE3;padding:7rem 0 8rem;overflow:hidden;isolation:isolate;}
.tst-fold::before{content:'';position:absolute;inset:0;z-index:0;pointer-events:none;
  background:
    radial-gradient(40% 50% at 12% 30%,rgba(216,188,133,.18) 0%,rgba(0,0,0,0) 65%),
    radial-gradient(45% 55% at 88% 75%,rgba(108,160,255,.15) 0%,rgba(0,0,0,0) 65%),
    radial-gradient(60% 50% at 50% 100%,rgba(216,188,133,.08) 0%,rgba(0,0,0,0) 70%);}
.tst-fold .wrap{position:relative;z-index:1;}
.tst-head{text-align:center;margin-bottom:3.6rem;}
.tst-head .tst-trust{display:inline-flex;align-items:center;gap:.55rem;background:rgba(255,255,255,.04);border:1px solid rgba(216,188,133,.35);padding:.55rem 1.1rem;border-radius:999px;font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:#D8BC85;margin-bottom:1.6rem;}
.tst-head .tst-trust .stars{color:#D8BC85;letter-spacing:.1em;}
.tst-head h2{font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(2.4rem,4.6vw,4.2rem);line-height:1.05;margin:0 0 1.2rem;color:#F3EEE3;}
.tst-head h2 .gold-ital{color:#D8BC85;font-style:italic;}
.tst-head p{font-size:1.05rem;color:rgba(243,238,227,.78);max-width:58ch;margin:0 auto;line-height:1.6;}
/* 3D scroller */
.tst-stage{position:relative;perspective:1800px;}
.tst-track{display:grid;grid-template-columns:repeat(5,minmax(280px,1fr));gap:1.6rem;padding:1rem 0;perspective:2000px;}
.tst-card{position:relative;background:linear-gradient(180deg,#0B0F1C 0%,#000 100%);border:1px solid rgba(255,255,255,.08);border-radius:24px;overflow:hidden;
  box-shadow:
    0 30px 60px rgba(0,0,0,.55),
    0 0 0 1px rgba(216,188,133,.08),
    inset 0 1px 0 rgba(255,255,255,.05);
  transform:translateZ(0) rotateX(0) rotateY(0);transition:transform .55s cubic-bezier(.2,.7,.25,1), box-shadow .55s;
  will-change:transform;}
.tst-card::before{content:'';position:absolute;inset:0;border-radius:24px;pointer-events:none;
  background:linear-gradient(160deg,rgba(216,188,133,.22) 0%,rgba(216,188,133,0) 28%,rgba(255,255,255,0) 70%,rgba(108,160,255,.12) 100%);
  mix-blend-mode:screen;opacity:.55;}
.tst-card:hover{transform:translateY(-6px) rotateX(2deg) rotateY(-2deg);box-shadow:0 40px 80px rgba(0,0,0,.7),0 0 0 1px rgba(216,188,133,.25),inset 0 1px 0 rgba(255,255,255,.08);}
.tst-card img{width:100%;height:auto;display:block;border-radius:24px 24px 0 0;}
.tst-card-foot{padding:0;}
/* Marquee on narrower viewports */
@media (max-width:1180px){
  .tst-track{grid-template-columns:repeat(3,minmax(260px,1fr));}
  .tst-card:nth-child(n+4){display:none;}
}
@media (max-width:760px){
  .tst-track{display:flex;gap:1rem;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding-bottom:1rem;}
  .tst-card{flex:0 0 78%;scroll-snap-align:center;}
  .tst-card:nth-child(n+4){display:block;}
}
.tst-source{display:flex;align-items:center;justify-content:center;gap:.6rem;margin-top:2.6rem;color:rgba(243,238,227,.55);font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;}
.tst-source::before,.tst-source::after{content:'';flex:1;max-width:80px;height:1px;background:rgba(216,188,133,.25);}
</style>
<section class="tst-fold" id="testimonials" aria-label="Student stories">
  <div class="wrap">
    <div class="tst-head reveal">
      <span class="tst-trust"><span class="stars">\u2605\u2605\u2605\u2605\u2605</span> Excellent on Trustpilot</span>
      <h2>Student Stories, <span class="gold-ital">Real Results.</span></h2>
      <p>Real learners. Real progress. Real classrooms broadcast live from France. Here\u2019s what they say about French Atelier by Acadomia.</p>
    </div>
    <div class="tst-stage">
      <div class="tst-track reveal reveal-d1">
        <article class="tst-card"><img src="assets/testimonials/testimonial-1.png" alt="Chaffee Kurt \u2014 It has been fun, good materials, an excellent teacher, and a learning environment." loading="lazy" width="380" height="500"></article>
        <article class="tst-card"><img src="assets/testimonials/testimonial-2.png" alt="Freddie Deckow \u2014 I have received teaching over and above what I expected." loading="lazy" width="380" height="500"></article>
        <article class="tst-card"><img src="assets/testimonials/testimonial-3.png" alt="McCollin John \u2014 A well structured and systematic course delivering high value content." loading="lazy" width="380" height="500"></article>
        <article class="tst-card"><img src="assets/testimonials/testimonial-4.png" alt="Nieuwenhuize Yaacov \u2014 I never would have thought it would be so good." loading="lazy" width="380" height="500"></article>
        <article class="tst-card"><img src="assets/testimonials/testimonial-5.png" alt="Glumac Biljana \u2014 Our teacher is really great. Looking forward to the next lessons." loading="lazy" width="380" height="500"></article>
      </div>
    </div>
    <p class="tst-source">From learners of French Atelier by Acadomia</p>
  </div>
</section>

'''

# ---- STEP A: Remove old "Live from France" fold entirely ----
html = html.replace(live_from_block, '', 1)

# ---- STEP B: Remove old Julien fold ----
html = html.replace(julien_block_old, '', 1)

# ---- STEP C: Insert new Julien fold + Testimonials fold AFTER the mapstr section ----
# Mapstr section ends with </section> and is immediately followed (after our removals)
# by the eTeacher fold. Insert new blocks just before the eTeacher anchor.
ET_ANCHOR = '<!-- ===== eTEACHER GROUP PLATFORM'
i = html.find(ET_ANCHOR)
if i < 0: raise SystemExit('eteacher anchor missing')
html = html[:i] + new_julien_block + testimonials_block + html[i:]

# ---- STEP D: Move Acadomia block to right after Culture (six-pillar) section ----
html = html.replace(acadomia_block, '', 1)
# Insert before the How-It-Works/Learning Journey anchor
HIW_ANCHOR = '<!-- ===== HOW IT WORKS'
i = html.find(HIW_ANCHOR)
if i < 0: raise SystemExit('how-it-works anchor missing')
html = html[:i] + acadomia_block + html[i:]

# ---- STEP E: Move Placement block to right after the (new) eTeacher fold ----
# Remove the existing placement block from its current location, then re-insert
# just before the FAQ anchor.
html = html.replace(placement_block, '', 1)
FAQ_ANCHOR = '<!-- ===== FAQ (homepage condensed)'
i = html.find(FAQ_ANCHOR)
if i < 0: raise SystemExit('faq anchor missing')
html = html[:i] + placement_block + html[i:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('OK')
