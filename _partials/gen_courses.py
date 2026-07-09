# -*- coding: utf-8 -*-
"""Generate the 7 IIBS-level course pages into courses/*.html."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from course_data import COURSES, TEACHERS, TESTIMONIALS

ROOT = "/home/user/workspace/fa-site"
OUT = os.path.join(ROOT, "courses")

# ---- SVG icon snippets ----
ICN = {
"check":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
"clock":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
"level":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 21V8l6-4 6 4v13"/><path d="M3 21h18"/><path d="M15 21V11l4-2.5"/></svg>',
"book":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
"users":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
"award":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="6"/><path d="M15.5 13.5L17 22l-5-3-5 3 1.5-8.5"/></svg>',
"cal":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
"tag":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
"globe":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
"mic":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>',
"pin":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
"play":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/></svg>',
"chat":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
"heart":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>',
"spark":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3"/></svg>',
"film":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"/></svg>',
"arrowL":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
"arrowR":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
"star":'<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
}

LOGO_SVG = '''<svg class="logo-mark" viewBox="0 0 100 100" fill="none" aria-label="The French Atelier">
        <circle cx="50" cy="50" r="47" stroke="#C8A560" stroke-width="1" opacity="0.9"/>
        <text x="50" y="63" text-anchor="middle" font-family="Cormorant Garamond, serif" font-size="38" font-weight="600" font-style="italic" fill="#C8A560">FA</text>
      </svg>'''

def header_html(active_id):
    return f'''<header class="site-header">
  <div class="wrap nav">
    <a class="nav-logo" href="../index.html">
      {LOGO_SVG}
      <span class="logo-text">
        <span class="lt-main">The French Atelier</span>
        <span class="lt-sub">by Acadomia</span>
      </span>
    </a>
    <nav class="nav-menu" aria-label="Primary">
      <div class="nav-item"><a class="nav-link" href="../index.html">Home</a></div>
      <div class="nav-item">
        <a class="nav-link active" href="../courses.html">Courses <svg class="nav-caret" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" fill="none" stroke-width="1.4"/></svg></a>
        <div class="nav-dropdown">
          <a href="../courses.html">All Courses</a>
          <a href="fa-foundation.html">FA Foundation · A0→A1.1</a>
          <a href="fa-beginner.html">FA Beginner · A1.1→A1.2</a>
          <a href="fa-elementary.html">FA Elementary · A1.2→A2.1</a>
          <a href="fa-intermediate.html">FA Intermediate · A2.1→A2.2</a>
          <a href="lsf-foundation.html">LSF · Let's Speak French</a>
          <a href="../map.html">Interactive Map of France</a>
        </div>
      </div>
      <div class="nav-item"><a class="nav-link" href="../method.html">Our Method</a></div>
      <div class="nav-item"><a class="nav-link" href="../how-it-works.html">How It Works</a></div>
      <div class="nav-item"><a class="nav-link" href="../juliane.html">Juliane AI</a></div>
      <div class="nav-item">
        <a class="nav-link" href="../culture.html">Culture <svg class="nav-caret" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" fill="none" stroke-width="1.4"/></svg></a>
        <div class="nav-dropdown">
          <a href="../culture.html">French Culture</a>
          <a href="../teachers.html">Our Teachers</a>
          <a href="../blog.html">Cultural Journal</a>
          <a href="../capsules.html">Culture Capsules</a>
        </div>
      </div>
      <div class="nav-item">
        <a class="nav-link" href="../about.html">About <svg class="nav-caret" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" fill="none" stroke-width="1.4"/></svg></a>
        <div class="nav-dropdown">
          <a href="../about.html">About French Atelier</a>
          <a href="../acadomia.html">The Acadomia Group</a>
          <a href="../pricing.html">Pricing</a>
          <a href="../faq.html">FAQ</a>
          <a href="../contact.html">Contact</a>
        </div>
      </div>
      <a class="btn btn-gold nav-cta" data-advisor href="../contact.html">Request Info</a>
    </nav>
    <button class="nav-toggle" aria-label="Open menu"><span></span><span></span><span></span></button>
  </div>
</header>

<div class="nav-drawer" aria-hidden="true">
  <button class="nav-drawer-close" aria-label="Close menu">&times;</button>
  <a href="../index.html">Home</a>
  <span class="drawer-group-label">Courses</span>
  <div class="drawer-sub">
    <a href="../courses.html">All Courses</a>
    <a href="fa-foundation.html">FA Foundation</a>
    <a href="fa-beginner.html">FA Beginner</a>
    <a href="fa-elementary.html">FA Elementary</a>
    <a href="fa-intermediate.html">FA Intermediate</a>
    <a href="lsf-foundation.html">LSF Foundation</a>
    <a href="lsf-beginner.html">LSF Beginner</a>
    <a href="lsf-elementary.html">LSF Elementary</a>
    <a href="../map.html">Interactive Map of France</a>
  </div>
  <a href="../method.html">Our Method</a>
  <a href="../how-it-works.html">How It Works</a>
  <a href="../juliane.html">Juliane · AI Tutor</a>
  <span class="drawer-group-label">Culture</span>
  <div class="drawer-sub">
    <a href="../culture.html">French Culture</a>
    <a href="../teachers.html">Our Teachers</a>
    <a href="../blog.html">Cultural Journal</a>
    <a href="../capsules.html">Culture Capsules</a>
  </div>
  <span class="drawer-group-label">About</span>
  <div class="drawer-sub">
    <a href="../about.html">About French Atelier</a>
    <a href="../acadomia.html">The Acadomia Group</a>
    <a href="../pricing.html">Pricing</a>
    <a href="../faq.html">FAQ</a>
    <a href="../contact.html">Contact</a>
  </div>
  <a href="../contact.html" data-advisor class="btn btn-gold" style="margin-top:1.6rem">Request Info</a>
</div>'''

FOOTER = '''<footer class="site-footer">
  <div class="wrap">
    <div class="footer-top">
      <div class="footer-brand">
        ''' + LOGO_SVG.replace('width="42"','') + '''
        <p style="font-family:var(--serif);font-size:1.25rem;color:var(--on-dark);margin-bottom:.4rem">The French Atelier</p>
        <p>Culture speaks French. What about you? An exclusive, culturally immersive, certified, live French language program — presented by France's #1 private learning institute.</p>
      </div>
      <div class="footer-col">
        <h4>Courses</h4>
        <a href="fa-foundation.html">FA Foundation</a>
        <a href="fa-beginner.html">FA Beginner</a>
        <a href="fa-elementary.html">FA Elementary</a>
        <a href="fa-intermediate.html">FA Intermediate</a>
        <a href="lsf-foundation.html">LSF Foundation</a>
        <a href="../map.html">Map of France</a>
      </div>
      <div class="footer-col">
        <h4>Explore</h4>
        <a href="../method.html">Our Method</a>
        <a href="../how-it-works.html">How It Works</a>
        <a href="../juliane.html">Juliane · AI Tutor</a>
        <a href="../teachers.html">Our Teachers</a>
        <a href="../culture.html">French Culture</a>
        <a href="../blog.html">Cultural Journal</a>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <a href="../about.html">About</a>
        <a href="../acadomia.html">Acadomia Group</a>
        <a href="../pricing.html">Pricing</a>
        <a href="../faq.html">FAQ</a>
        <a href="../contact.html">Contact</a>
        <a href="../terms.html">Terms &amp; Conditions</a>
        <a href="../privacy.html">Privacy Policy</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>7 rue de la Baume, 75008 Paris, France &nbsp;·&nbsp; +1-888-230-5110 &nbsp;·&nbsp; advisor@eTeacherGroup.com</p>
      <div class="footer-social">
        <a href="https://www.facebook.com/profile.php?id=61577106456673" aria-label="Facebook" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3l.5-3H14V4.5c0-.8.3-1.5 1.5-1.5H18V.2C17.5.1 16.3 0 15 0c-2.7 0-4.5 1.6-4.5 4.6V6H8v3h2.5v9H14V9z"/></svg></a>
        <a href="https://www.instagram.com/livefrenchatelier" aria-label="Instagram" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>
        <a href="https://www.youtube.com/@FrenchbyAtelier" aria-label="YouTube" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.5s-.2-1.6-.9-2.3c-.8-.9-1.8-.9-2.2-1C16.8 4 12 4 12 4s-4.8 0-7.9.2c-.4.1-1.4.1-2.2 1C1.2 5.9 1 7.5 1 7.5S.8 9.4.8 11.3v1.4c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.8.9 1.9.9 2.4 1 1.7.1 7.7.2 7.7.2s4.8 0 7.9-.2c.4-.1 1.4-.1 2.2-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8v-1.4c0-1.9-.2-3.8-.2-3.8zM9.7 15V9l5.2 3-5.2 3z"/></svg></a>
      </div>
    </div>
    <p style="color:var(--on-dark-faint);font-size:.78rem;text-align:center;margin-top:1.6rem">Copyright ACADOMIA © 2025. All Rights Reserved.</p>
  </div>
</footer>
<script src="../js/fa.js"></script>
</body>
</html>'''


def spec_panel(c):
    rows = [
        ("Length", f"{c['units']} live lessons · {c['lesson_min']} each"),
        ("Level", f"CEFR {c['level']}"),
        ("Lessons", f"{c['units']} units" + (" · speaking-focused" if c['track']=="Let's Speak French" else " · communicative tasks")),
        ("Group size", c['group']),
        ("Certificate", "CEFR completion certificate by Acadomia"),
        ("Schedule", c['spec_schedule']),
        ("Price", "See plans below"),
    ]
    rh = "\n".join(
        f'''      <div class="cp-spec-row">
        <span class="cp-spec-check">{ICN['check']}</span>
        <div><span class="k">{k}</span><span class="v">{v}</span></div>
      </div>''' for k,v in rows)
    return f'''<aside class="cp-spec reveal reveal-d2" aria-label="Course at a glance">
      <div class="cp-spec-h">At a glance</div>
{rh}
      <button class="btn-accent" data-advisor type="button">Request Info {ICN['arrowR']}</button>
    </aside>'''


def badges(c):
    items = [f'<span class="cp-badge"><span class="bdot"></span>CEFR {c["level"]}</span>',
             '<span class="cp-badge"><span class="bdot"></span>Certified by Acadomia</span>',
             f'<span class="cp-badge"><span class="bdot"></span>{c["units"]} live lessons</span>']
    if c['new']:
        items.insert(0,'<span class="cp-badge is-new"><span class="bdot"></span>New course</span>')
    return '\n        '.join(items)


def testimonials_html(cid):
    cards = []
    for nm,flag,country,quote in TESTIMONIALS[cid]:
        cards.append(f'''      <figure class="cp-quote">
        <div class="cp-stars">{ICN['star']*5}</div>
        <p>&ldquo;{quote}&rdquo;</p>
        <figcaption class="cp-quote-who"><span class="flag">{flag}</span><strong>{nm}</strong> · {country}</figcaption>
      </figure>''')
    block = "\n".join(cards)
    # duplicate for seamless loop
    return f'''<div class="cp-testi">
    <div class="cp-testi-track">
{block}
{block}
    </div>
  </div>'''


def faculty_html(c):
    cards = []
    for tk in c['teachers']:
        nm, city, bio, img = TEACHERS[tk]
        cards.append(f'''      <article class="cp-faculty">
        <div class="cp-faculty-img"><img src="../assets/teachers/{img}" alt="{nm}, French teacher in {city}" loading="lazy"></div>
        <div class="cp-faculty-body">
          <div class="fn">{nm}</div>
          <div class="fc">{ICN['pin']}{city}</div>
          <p class="fb">{bio}</p>
        </div>
      </article>''')
    return "\n".join(cards)


def lessons_html(c):
    cards = []
    for i,(title,desc,loc) in enumerate(c['lessons'],1):
        cards.append(f'''      <article class="cp-lesson">
        <div class="ln">{i:02d}</div>
        <div class="lt">{title}</div>
        <p class="lp">{desc}</p>
        <div class="lloc">{ICN['pin']}{loc}</div>
      </article>''')
    return "\n".join(cards)


def schedule_html(c):
    # generic upcoming cohorts — credible, no absurd numbers
    months = [("September","2025","Open"),("October","2025","Open"),
              ("November","2025","Few seats"),("January","2026","Open"),
              ("February","2026","Open"),("March","2026","Open")]
    rows = []
    for m,y,st in months:
        cls = " few" if st=="Few seats" else ""
        rows.append(f'''        <div class="cp-sched-item">
          <div class="cp-sched-date">{m} {y}<small>{c['spec_schedule']}</small></div>
          <span class="cp-sched-status{cls}">{st}</span>
        </div>''')
    return "\n".join(rows)


def faq_html(c):
    price_line = (f"FA courses run from <strong>{c['price_week']} a week</strong> on the annual plan — "
                  f"<strong>{c['price_total']}</strong> in total for all {c['units']} live lessons — "
                  f"or pay monthly from $56 a week.") if c['track']=="French Atelier" else \
                 (f"{c['name']} is a {c['units']}-session speaking course offered <strong>{c['price_total']}</strong> "
                  f"on the annual plan, with flexible monthly options. Your advisor will tailor a plan to your goals.")
    qa = [
        ("Who is "+c['name']+" for?",
         f"<p>{c['name']} is built for learners at CEFR {c['entry']} entering at {c['entry']} and finishing around {c['exit']}. "
         + ("It welcomes complete beginners with no prior French." if c['entry']=="A0" else "It assumes you've reached the level just below and want to consolidate and grow.")
         + " Lessons are live, in small groups, and led by native certified teachers broadcasting from France.</p>"),
        ("How are the lessons structured?",
         f"<p>You attend {c['units']} live {c['lesson_min']} sessions in groups of {c['group']}. "
         + ("Every unit is a real communicative task anchored in a real French location, so the language attaches to a place and a purpose." if c['track']=="French Atelier"
            else "Every session is a live small-group speaking room — you spend the hour talking, not reading, building spoken reflexes from the first minute.")
         + " Recordings are available so you never miss a step.</p>"),
        ("Do I receive a certificate?",
         "<p>Yes. On completion you receive a CEFR-aligned certificate of achievement issued by Acadomia, France's #1 private learning institute. "
         "Our framework follows the same Common European levels recognised across French academia and employers — the standard of reference used by institutions including the Sorbonne.</p>"),
        ("Who is behind The French Atelier?",
         "<p>The French Atelier is presented by <strong>Acadomia</strong> — founded in 1989 and France's #1 private learning institute — in partnership with the <strong>eTeacher</strong> award-winning live online learning platform. "
         "You learn from native, certified French teachers, supported around the clock by Juliane, our 24/7 AI tutor.</p>"),
        ("Can I get help choosing the right level?",
         "<p>Absolutely. An education advisor will help you place into the right course and build a plan around your schedule and goals. "
         "<button class=\"link-arrow\" data-advisor type=\"button\" style=\"font:inherit;letter-spacing:.14em;text-transform:uppercase;font-size:.78rem;font-weight:600;color:var(--c-accent)\">Request information &rarr;</button></p>"),
        ("How much does it cost?",
         f"<p>{price_line} Pricing is always discussed with your advisor so it fits your situation — there are no hidden fees, and a "
         "$100 learning credit is available on completion. <button class=\"link-arrow\" data-advisor type=\"button\" style=\"font:inherit;letter-spacing:.14em;text-transform:uppercase;font-size:.78rem;font-weight:600;color:var(--c-accent)\">Talk to an advisor &rarr;</button></p>"),
    ]
    items = []
    for q,a in qa:
        items.append(f'''      <div class="faq-item">
        <button class="faq-q" type="button">{q}<span class="faq-icon"></span></button>
        <div class="faq-a"><div class="faq-a-inner"><div>{a}</div></div></div>
      </div>''')
    return "\n".join(items)


def benefit_cards(c):
    speaking = c['track']=="Let's Speak French"
    cards = [
        (ICN['users'], "Live small groups", f"Just {c['group']}, so every learner speaks every lesson. No hiding, no passive video — a real, social classroom led live from France."),
        (ICN['pin'] if not speaking else ICN['mic'],
         "French where it is lived" if not speaking else "Speaking from minute one",
         (f"Each unit is anchored in a real French place along the {c['region']} journey, so language attaches to a scene you can picture." if not speaking
          else "Every session is pure spoken practice — role-plays, speed-dating, real situations — building the reflexes that reading never can.")),
        (ICN['globe'], "Native certified teachers", "Learn from native French teachers, certified and broadcasting live from cities across France — Paris, Lyon, Nice, Strasbourg and beyond."),
        (ICN['chat'], "Juliane, your 24/7 tutor", "Between live lessons, Juliane — our AI French tutor — is always on to practise, answer questions and keep you moving."),
        (ICN['award'], "CEFR certificate by Acadomia", f"Finish at CEFR {c['exit']} with a certificate of achievement issued by Acadomia, France's #1 private learning institute — recognised against the standards used across French academia."),
    ]
    out = []
    for i,(ic,h,p) in enumerate(cards):
        cls = " is-cert" if "certificate" in h.lower() else ""
        d = f" reveal-d{(i%3)+1}" if i%3 else ""
        out.append(f'''      <article class="cp-card{cls} reveal{d}">
        <div class="cp-card-ic">{ic}</div>
        <h3>{h}</h3>
        <p>{p}</p>
      </article>''')
    return "\n".join(out)


def benefits_checklist(c):
    speaking = c['track']=="Let's Speak French"
    items = [
        f"Reach CEFR {c['exit']}: you'll be able to {c['outcome']}.",
        f"{c['units']} live {c['lesson_min']} lessons in small groups of {c['group']}.",
        ("Every unit anchored in a real French location along the "+c['region']+" journey." if not speaking
         else "Pure spoken practice every session — role-plays, speed-dating and real situations."),
        "Native, certified teachers broadcasting live from France.",
        "Lifetime access to lesson recordings — revisit any class, anytime.",
        "CEFR completion certificate by Acadomia, plus a $100 learning credit.",
    ]
    return "\n".join(f'''        <li>{ICN['check']}<span>{t}</span></li>''' for t in items)


def why_row(c):
    speaking = c['track']=="Let's Speak French"
    cells = [
        (ICN['pin'] if not speaking else ICN['mic'],
         "Context, not flashcards" if not speaking else "Mouth, not page",
         ("You learn French in the street, at the counter, on the quay — anchored to real places, so it stays." if not speaking
          else "You spend every minute speaking, not reading — the fastest route to real conversation.")),
        (ICN['users'], "A real live classroom", f"Small groups of {c['group']} with a native teacher — social, accountable, and genuinely human."),
        (ICN['heart'], "Culture woven in", "Every lesson carries the gestures, codes and stories of French life — you don't just speak French, you understand it."),
    ]
    return "\n".join(f'''      <div class="cp-why-item reveal">
        <div class="cp-why-ic">{ic}</div>
        <h3>{h}</h3>
        <p>{p}</p>
      </div>''' for ic,h,p in cells)


def trust_banner(c, variant=1):
    if variant==1:
        return f'''  <div class="wrap">
    <div class="cp-trust-grid">
      <div class="cp-trust-item reveal">
        <div class="tnum">1989</div>
        <div class="tlabel"><strong>Acadomia</strong> — founded in 1989, France's #1 private learning institute, now teaching the world French.</div>
      </div>
      <div class="cp-trust-item reveal reveal-d1">
        <div class="tnum">100%</div>
        <div class="tlabel"><strong>Native, certified teachers</strong> broadcasting live from France on the award-winning eTeacher platform.</div>
      </div>
      <div class="cp-trust-item reveal reveal-d2">
        <div class="tnum">CEFR</div>
        <div class="tlabel"><strong>Internationally recognised</strong> levels — the standards used across French academia, including the Sorbonne.</div>
      </div>
    </div>
  </div>'''
    else:
        return f'''  <div class="wrap">
    <div class="cp-trust-grid">
      <div class="cp-trust-item reveal">
        <div class="tnum">24/7</div>
        <div class="tlabel"><strong>Juliane</strong>, your AI French tutor, practises with you between every live lesson.</div>
      </div>
      <div class="cp-trust-item reveal reveal-d1">
        <div class="tnum">{c['group'].split('–')[0] if '–' in c['group'] else c['group'].split()[0]}–{c['group'].split('–')[-1].split()[0] if '–' in c['group'] else ''}</div>
        <div class="tlabel"><strong>Small live groups</strong> on the award-winning eTeacher platform — everyone speaks, every lesson.</div>
      </div>
      <div class="cp-trust-item reveal reveal-d2">
        <div class="tnum">$100</div>
        <div class="tlabel"><strong>Learning credit</strong> on completion, plus a CEFR certificate issued by Acadomia.</div>
      </div>
    </div>
  </div>'''


def signature_block(c):
    if not c.get('signature'): return ""
    s = c['signature']
    return f'''<section class="section-pad bg-paper">
  <div class="wrap-narrow" style="text-align:center">
    <p class="eyebrow eyebrow-line reveal" style="justify-content:center">Signature Lesson</p>
    <h2 class="display-sm reveal reveal-d1" style="margin:1rem 0">{s['code']} — <span class="gold-ital">{s['title']}</span></h2>
    <p class="lede reveal reveal-d2" style="max-width:54ch;margin:0 auto 1.6rem">Take a look inside our most beloved opening lesson — your first French, learned at the foot of the Eiffel Tower.</p>
    <a href="{s['deck']}" class="btn btn-outline" target="_blank" rel="noopener">Open the lesson deck {ICN['arrowR']}</a>
  </div>
</section>
'''


def page(cid):
    c = COURSES[cid]
    fac_id = f"fac-{cid}"
    syl_id = f"syl-{cid}"
    head_nm, head_city, head_bio, head_img = TEACHERS[c['head']]
    speaking = c['track']=="Let's Speak French"
    # sibling nav
    def sib(d):
        tup = c[d]
        if not tup:
            label = "Previous" if d=='prev' else "Next"
            return f'''      <div class="sib-card" style="opacity:.5;pointer-events:none">
        <div class="sib-dir">{'← Previous' if d=='prev' else 'Next →'}</div>
        <div class="sib-title">{'This is the first course' if d=='prev' else 'This is the final course'}</div>
        <div class="sib-cefr">{'in the track' if d=='prev' else 'in the track'}</div>
      </div>'''
        sid,nm,sub = tup
        return f'''      <a href="{sid}.html" class="sib-card">
        <div class="sib-dir">{'← Previous' if d=='prev' else 'Next →'}</div>
        <div class="sib-title">{nm}</div>
        <div class="sib-cefr">{sub}</div>
      </a>'''

    title = f"{c['name']} — {c['level']} | The French Atelier by Acadomia"
    desc = f"{c['name']}: a {c['units']}-{'session' if speaking else 'unit'} live French course ({c['level']}, CEFR). {c['journey']} Native certified teachers, small groups, certificate by Acadomia."

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="../css/fa.css">
<link rel="icon" type="image/svg+xml" href="../assets/logo/favicon.svg">
<style>
.sibling-nav{{display:grid;grid-template-columns:1fr 1fr;gap:1.2rem}}
.sib-card{{border:1px solid var(--gold-line-soft);padding:1.4rem 1.6rem;display:flex;flex-direction:column;gap:.3rem;background:var(--paper);transition:background .2s;border-radius:12px}}
.sib-card:hover{{background:var(--ivory)}}
.sib-dir{{font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;color:var(--c-bg)}}
.sib-title{{font-family:var(--serif);font-size:1.3rem;color:var(--on-light)}}
.sib-cefr{{font-size:.82rem;color:var(--on-light-soft)}}
@media(max-width:600px){{.sibling-nav{{grid-template-columns:1fr}}}}
</style>
</head>
<body data-course="{cid}" class="light-hero">

{header_html(cid)}

<!-- ===== STICKY COURSE SUB-NAV ===== -->
<div class="cp-subnav">
  <div class="wrap cp-subnav-inner">
    <div class="cp-subnav-title">
      <span class="cp-dot"></span>
      <strong>{c['name']}</strong>
      <span>{c['level']}</span>
    </div>
    <div class="cp-subnav-links">
      <a href="#overview">Overview</a>
      <a href="#syllabus">Syllabus</a>
      <a href="#faculty">Teachers</a>
      <a href="#faq">FAQ</a>
    </div>
    <button class="btn-accent" data-advisor type="button">Request Info</button>
  </div>
</div>

<!-- ===== HERO ===== -->
<section class="cp-hero" id="overview">
  <div class="cp-hero-bg"><img src="../assets/courses/{cid}-1.png" alt="{c['region']} — the setting of {c['name']}"></div>
  <div class="wrap">
    <nav class="cp-breadcrumb" aria-label="Breadcrumb"><a href="../index.html">Home</a> › <a href="../courses.html">Courses</a> › {c['name']}</nav>
    <div class="cp-hero-grid">
      <div class="reveal">
        <p class="cp-eyebrow">{c['track']} · {c['track_no']}</p>
        <h1>{c['name'].split()[0]} <em>{' '.join(c['name'].split()[1:])}</em></h1>
        <div class="cp-badges">
        {badges(c)}
        </div>
        <p class="cp-hero-pitch">{c['pitch']}</p>
        <div class="cp-hero-cta">
          <button class="btn-accent" data-advisor type="button">Request Info {ICN['arrowR']}</button>
          <a class="btn-glass" href="../downloads/{cid}-syllabus.pdf" download>Download Syllabus (PDF)</a>
        </div>
        <p class="cp-trustline">{ICN['check']} Presented by Acadomia · France's #1 private learning institute, founded 1989</p>
      </div>
      {spec_panel(c)}
    </div>
  </div>
</section>

<!-- ===== INFO ROW: benefits + schedule ===== -->
<section class="section-pad bg-ivory">
  <div class="wrap cp-inforow">
    <div class="reveal">
      <p class="eyebrow eyebrow-line">What you'll gain</p>
      <h2 class="display-sm" style="margin:1.1rem 0 .4rem">From {c['entry']} to <span class="gold-ital">{c['exit']}</span></h2>
      <p class="muted" style="margin-bottom:.4rem">{c['journey']}</p>
      <ul class="cp-bene-list">
{benefits_checklist(c)}
      </ul>
    </div>
    <div class="reveal reveal-d1">
      <div class="cp-sched">
        <div class="cp-sched-h"><strong>Upcoming cohorts</strong><span>Live · {c['lesson_min']}</span></div>
        <div class="cp-sched-scroll">
{schedule_html(c)}
        </div>
        <div class="cp-sched-foot"><button class="btn-accent" data-advisor type="button" style="width:100%">Reserve your seat {ICN['arrowR']}</button></div>
      </div>
    </div>
  </div>
</section>

<!-- ===== TESTIMONIALS ===== -->
<section class="section-pad-sm bg-paper">
  <div class="wrap" style="text-align:center;margin-bottom:2rem">
    <p class="eyebrow eyebrow-line reveal" style="justify-content:center">Loved by learners worldwide</p>
    <h2 class="display-sm reveal reveal-d1" style="margin-top:.8rem">Real voices, real <span class="gold-ital">progress</span></h2>
  </div>
  {testimonials_html(cid)}
</section>

<!-- ===== BENEFIT CARDS ===== -->
<section class="section-pad bg-ivory neon-splash">
  <div class="wrap">
    <div style="text-align:center;max-width:60ch;margin:0 auto">
      <p class="eyebrow eyebrow-line reveal" style="justify-content:center">Why {c['name']}</p>
      <h2 class="display-sm reveal reveal-d1" style="margin-top:.8rem">Everything a beginner could <span class="gold-ital">want</span></h2>
    </div>
    <div class="cp-cards">
{benefit_cards(c)}
    </div>
  </div>
</section>

<!-- ===== MID CTA BANNER ===== -->
<section class="cp-ctaband neon-splash">
  <div class="wrap-narrow">
    <h2 class="reveal">Your first lesson begins <em>{c['region'].split('→')[0].split('(')[0].strip()}</em></h2>
    <p class="reveal reveal-d1">{c['units']} live lessons · CEFR {c['level']} · certificate by Acadomia · a $100 learning credit on completion.</p>
    <div class="cp-cta-actions reveal reveal-d2">
      <button class="btn-accent" data-advisor type="button">Request Info {ICN['arrowR']}</button>
      <a class="btn-glass" href="../downloads/{cid}-syllabus.pdf" download>Download Syllabus</a>
    </div>
  </div>
</section>

<!-- ===== WHY 3-ICON ROW ===== -->
<section class="section-pad bg-paper">
  <div class="wrap">
    <div style="text-align:center;max-width:60ch;margin:0 auto">
      <p class="eyebrow eyebrow-line reveal" style="justify-content:center">The French Atelier difference</p>
      <h2 class="display-sm reveal reveal-d1" style="margin-top:.8rem">French learned where it is <span class="gold-ital">lived</span></h2>
    </div>
    <div class="cp-why">
{why_row(c)}
    </div>
  </div>
</section>

<!-- ===== JOURNEY IMAGE BAND (-2 / -3 course images) ===== -->
<section class="cp-journey reveal">
  <figure class="cp-journey-img"><img src="../assets/courses/{cid}-2.png" alt="{c['region']} — a scene from the {c['name']} journey" loading="lazy"><figcaption>{c['region']}</figcaption></figure>
  <figure class="cp-journey-img"><img src="../assets/courses/{cid}-3.png" alt="{c['region']} — a scene from the {c['name']} journey" loading="lazy"><figcaption>French learned where it is lived.</figcaption></figure>
</section>

<!-- ===== TRUST BANNER #1 ===== -->
<section class="cp-trust">
{trust_banner(c,1)}
</section>

<!-- ===== 2nd CTA ===== -->
<section class="section-pad-sm bg-ivory">
  <div class="wrap-narrow" style="text-align:center">
    <h2 class="display-sm reveal" style="margin-bottom:1rem">Not sure if it's the right <span class="gold-ital">level</span>?</h2>
    <p class="lede reveal reveal-d1" style="max-width:52ch;margin:0 auto 1.6rem">An education advisor will place you precisely and build a plan around your schedule — in minutes, with no pressure.</p>
    <button class="btn-accent reveal reveal-d2" data-advisor type="button">Talk to an advisor {ICN['arrowR']}</button>
  </div>
</section>

<!-- ===== FACULTY CAROUSEL ===== -->
<section class="section-pad bg-navy" id="faculty">
  <div class="wrap">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:1rem;margin-bottom:1.4rem">
      <div>
        <p class="eyebrow eyebrow-line reveal" style="color:var(--c-accent)">Meet your teachers</p>
        <h2 class="display-sm reveal reveal-d1" style="margin-top:.7rem;color:var(--on-dark)">Native, certified, <span style="font-style:italic;color:var(--c-accent);font-weight:500">live from France</span></h2>
      </div>
      <div class="cp-carousel-nav reveal reveal-d1">
        <button class="cp-cbtn" data-carousel-prev="{fac_id}" aria-label="Previous teachers" type="button">{ICN['arrowL']}</button>
        <button class="cp-cbtn" data-carousel-next="{fac_id}" aria-label="More teachers" type="button">{ICN['arrowR']}</button>
      </div>
    </div>
    <div class="cp-carousel">
      <div class="cp-carousel-track" id="{fac_id}">
{faculty_html(c)}
      </div>
    </div>
    <div class="grid g2" style="margin-top:2rem;align-items:stretch">
      <div class="cp-head reveal">
        <span class="eyebrow-c">Head of School</span>
        <h3>{head_nm} · {head_city}</h3>
        <p>{head_bio} As Head of School for {c['name']}, {head_nm.split()[0]} sets the tone for every cohort and personally reviews each learner's progress.</p>
      </div>
      <div class="cp-head reveal reveal-d1" style="background:linear-gradient(170deg,#080A14,#05060D)">
        <span class="eyebrow-c">Speak to a human first</span>
        <h3>Book a free placement chat</h3>
        <p>Meet an advisor before you enrol. We'll confirm your level, walk you through the schedule, and answer every question — no commitment.</p>
        <div><button class="btn-accent" data-advisor type="button" style="margin-top:.4rem">Request Info {ICN['arrowR']}</button></div>
      </div>
    </div>
  </div>
</section>

{signature_block(c)}

<!-- ===== SYLLABUS CAROUSEL ===== -->
<section class="cp-ctaband neon-splash" id="syllabus" style="text-align:left;padding-top:5rem;padding-bottom:5rem">
  <div class="wrap">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:1rem;margin-bottom:1.6rem">
      <div style="max-width:62ch">
        <p class="eyebrow eyebrow-line reveal" style="color:var(--c-accent)">The full syllabus</p>
        <h2 class="reveal reveal-d1" style="font-size:clamp(1.9rem,3.6vw,3rem);margin:.7rem 0 .9rem">{c['units']} lessons. One <em style="font-style:italic;color:var(--c-accent)">journey</em>.</h2>
        <p class="reveal reveal-d2" style="color:var(--on-dark-soft);font-weight:300;margin:0">{c['geo_intro']}</p>
      </div>
      <div class="cp-carousel-nav reveal reveal-d1">
        <button class="cp-cbtn" data-carousel-prev="{syl_id}" aria-label="Previous lessons" type="button">{ICN['arrowL']}</button>
        <button class="cp-cbtn" data-carousel-next="{syl_id}" aria-label="More lessons" type="button">{ICN['arrowR']}</button>
      </div>
    </div>
    <div class="cp-carousel">
      <div class="cp-carousel-track" id="{syl_id}">
{lessons_html(c)}
      </div>
    </div>
    <div class="cp-syllabus-foot">
      <a class="btn-accent" href="../downloads/{cid}-syllabus.pdf" download>View full syllabus (PDF) {ICN['arrowR']}</a>
      <button class="btn-glass" data-advisor type="button">Ask about this course</button>
    </div>
  </div>
</section>

<!-- ===== BONUS / TRUST BANNER #2 ===== -->
<section class="cp-trust">
{trust_banner(c,2)}
</section>

<!-- ===== FAQ ===== -->
<section class="section-pad bg-ivory" id="faq">
  <div class="wrap">
    <div style="text-align:center;max-width:58ch;margin:0 auto 2.6rem">
      <p class="eyebrow eyebrow-line reveal" style="justify-content:center">Questions &amp; answers</p>
      <h2 class="display-sm reveal reveal-d1" style="margin-top:.8rem">Everything you need to <span class="gold-ital">know</span></h2>
      <p class="cp-faq-note reveal reveal-d2">Including how it works, the certificate, and what it costs.</p>
    </div>
    <div class="faq-list">
{faq_html(c)}
    </div>
  </div>
</section>

<!-- ===== FINAL CTA ===== -->
<section class="cp-ctaband neon-splash">
  <div class="wrap-narrow">
    <h2 class="reveal">Ready to begin <em>{c['name']}</em>?</h2>
    <p class="reveal reveal-d1">Speak to an advisor today and reserve your seat in the next live cohort.</p>
    <div class="cp-cta-actions reveal reveal-d2">
      <button class="btn-accent" data-advisor type="button">Request Info {ICN['arrowR']}</button>
      <a class="btn-glass" href="../downloads/{cid}-syllabus.pdf" download>Download Syllabus</a>
    </div>
  </div>
</section>

<!-- ===== SIBLING NAV ===== -->
<section class="section-pad-sm bg-paper">
  <div class="wrap">
    <p class="eyebrow eyebrow-line reveal" style="margin-bottom:1.6rem">Continue the journey</p>
    <div class="sibling-nav">
{sib('prev')}
{sib('next')}
    </div>
  </div>
</section>

{FOOTER}'''
    return html


def main():
    for cid in COURSES:
        html = page(cid)
        with open(os.path.join(OUT, cid+".html"),"w") as f:
            f.write(html)
        print("wrote", cid+".html", len(html),"bytes")

if __name__=="__main__":
    main()
