#!/usr/bin/env python3
"""Replace the primary nav-menu and nav-drawer blocks across all HTML files
with the new canonical navigation. Does NOT touch any map-specific code; only
the shared header/drawer block. Preserves active-state for top-level links."""
import re, glob, os, sys

ROOT_FILES = ["about.html","acadomia.html","blog.html","capsules.html",
    "contact.html","courses.html","culture.html","faq.html","how-it-works.html",
    "index.html","juliane.html","method.html","pricing.html","privacy.html",
    "teachers.html","terms.html","map.html"]
SUBDIR_FILES = glob.glob("courses/*.html") + glob.glob("blog/*.html")

CARET = '<svg class="nav-caret" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" fill="none" stroke-width="1.4"/></svg>'

def nav_menu(p):
    # p is prefix: "" for root, "../" for subdir
    return f'''<nav class="nav-menu" aria-label="Primary">
      <div class="nav-item">
        <a class="nav-link" href="{p}courses.html">Courses {CARET}</a>
        <div class="nav-dropdown nav-dropdown-wide">
          <div class="nav-dd-col">
            <span class="nav-dd-head">French Atelier &middot; Structured &middot; A0&rarr;A2.2</span>
            <a href="{p}courses/fa-foundation.html">FA Foundation <em>A0&rarr;A1.1</em></a>
            <a href="{p}courses/fa-beginner.html">FA Beginner <em>A1.1&rarr;A1.2</em></a>
            <a href="{p}courses/fa-elementary.html">FA Elementary <em>A1.2&rarr;A2.1</em></a>
            <a href="{p}courses/fa-intermediate.html">FA Intermediate <em>A2.1&rarr;A2.2</em></a>
          </div>
          <div class="nav-dd-col">
            <span class="nav-dd-head">Let&rsquo;s Speak French &middot; Spoken &middot; Conversation</span>
            <a href="{p}courses/lsf-foundation.html">LSF Foundation <em>Spoken</em></a>
            <a href="{p}courses/lsf-beginner.html">LSF Beginner <em>Spoken</em></a>
            <a href="{p}courses/lsf-elementary.html">LSF Elementary <em>Spoken</em></a>
            <span class="nav-dd-divide"></span>
            <a href="{p}courses.html">All Courses</a>
            <a href="{p}map.html">Interactive Map of France</a>
          </div>
        </div>
      </div>
      <div class="nav-item">
        <a class="nav-link" href="{p}about.html">About Us {CARET}</a>
        <div class="nav-dropdown">
          <a href="{p}about.html">About French Atelier</a>
          <a href="{p}acadomia.html">The Acadomia Group</a>
          <a href="{p}pricing.html">Pricing</a>
          <a href="{p}faq.html">FAQ</a>
          <a href="{p}contact.html">Contact</a>
        </div>
      </div>
      <div class="nav-item"><a class="nav-link" href="{p}method.html">Our Method</a></div>
      <div class="nav-item"><a class="nav-link" href="{p}pricing.html">Pricing</a></div>
      <div class="nav-item"><a class="nav-link" href="{p}how-it-works.html">How It Works</a></div>
      <div class="nav-item"><a class="nav-link" href="{p}juliane.html">Juliane AI Tutor</a></div>
      <div class="nav-item">
        <a class="nav-link" href="{p}culture.html">Cultural Resources {CARET}</a>
        <div class="nav-dropdown">
          <a href="{p}culture.html">French Culture</a>
          <a href="{p}teachers.html">Our Teachers</a>
          <a href="{p}blog.html">Cultural Journal</a>
          <a href="{p}capsules.html">Culture Capsules</a>
        </div>
      </div>
      <a class="btn btn-gold nav-cta" href="{p}pricing.html">Enroll Now</a>
    </nav>'''

def nav_drawer(p):
    return f'''<div class="nav-drawer" aria-hidden="true">
  <button class="nav-drawer-close" aria-label="Close menu">&times;</button>
  <span class="drawer-group-label">Courses</span>
  <div class="drawer-sub">
    <a href="{p}courses.html">All Courses</a>
    <a href="{p}courses/fa-foundation.html">FA Foundation</a>
    <a href="{p}courses/fa-beginner.html">FA Beginner</a>
    <a href="{p}courses/fa-elementary.html">FA Elementary</a>
    <a href="{p}courses/fa-intermediate.html">FA Intermediate</a>
    <a href="{p}courses/lsf-foundation.html">LSF Foundation</a>
    <a href="{p}courses/lsf-beginner.html">LSF Beginner</a>
    <a href="{p}courses/lsf-elementary.html">LSF Elementary</a>
    <a href="{p}map.html">Interactive Map of France</a>
  </div>
  <span class="drawer-group-label">About Us</span>
  <div class="drawer-sub">
    <a href="{p}about.html">About French Atelier</a>
    <a href="{p}acadomia.html">The Acadomia Group</a>
    <a href="{p}pricing.html">Pricing</a>
    <a href="{p}faq.html">FAQ</a>
    <a href="{p}contact.html">Contact</a>
  </div>
  <a href="{p}method.html">Our Method</a>
  <a href="{p}pricing.html">Pricing</a>
  <a href="{p}how-it-works.html">How It Works</a>
  <a href="{p}juliane.html">Juliane AI Tutor</a>
  <span class="drawer-group-label">Cultural Resources</span>
  <div class="drawer-sub">
    <a href="{p}culture.html">French Culture</a>
    <a href="{p}teachers.html">Our Teachers</a>
    <a href="{p}blog.html">Cultural Journal</a>
    <a href="{p}capsules.html">Culture Capsules</a>
  </div>
  <a href="{p}pricing.html" class="btn btn-gold" style="margin-top:1.6rem">Enroll Now</a>
</div>'''

# regex: nav-menu block
NAV_RE = re.compile(r'<nav class="nav-menu" aria-label="Primary">.*?</nav>', re.DOTALL)
# drawer block: from <div class="nav-drawer" ... up to the Enroll Now anchor closing </div>
DRAWER_RE = re.compile(r'<div class="nav-drawer"[^>]*>.*?Enroll Now</a>\s*</div>', re.DOTALL)

def active_target(fname):
    base = os.path.basename(fname)
    d = os.path.dirname(fname)
    if base == "index.html": return None
    if base in ("courses.html",) or d.endswith("courses"): return "courses.html"
    if base in ("about.html","acadomia.html"): return "about.html"
    if base in ("blog.html","teachers.html","capsules.html","culture.html") or d.endswith("blog"): return "culture.html"
    if base == "method.html": return "method.html"
    if base == "pricing.html": return "pricing.html"
    if base == "how-it-works.html": return "how-it-works.html"
    if base == "juliane.html": return "juliane.html"
    return None

def apply_active(menu, target):
    if not target: return menu
    # add active class to the matching top-level nav-link href
    pat = re.compile(r'(<a class="nav-link)(" href="(?:\.\./)?' + re.escape(target) + '")')
    return pat.sub(r'\1 active\2', menu, count=1)

def process(files, prefix):
    changed=[]; skipped=[]
    for f in files:
        txt=open(f,encoding="utf-8").read()
        if '<nav class="nav-menu" aria-label="Primary">' not in txt:
            skipped.append((f,"no nav-menu")); continue
        menu = apply_active(nav_menu(prefix), active_target(f))
        new = NAV_RE.sub(lambda m: menu, txt, count=1)
        if not DRAWER_RE.search(new):
            skipped.append((f,"no drawer match")); 
            # still write nav change
            open(f,"w",encoding="utf-8").write(new); changed.append(f+"(nav only)"); continue
        new = DRAWER_RE.sub(lambda m: nav_drawer(prefix), new, count=1)
        open(f,"w",encoding="utf-8").write(new)
        changed.append(f)
    return changed, skipped

c1,s1 = process(ROOT_FILES, "")
c2,s2 = process(SUBDIR_FILES, "../")
print("CHANGED:")
for f in c1+c2: print("  ",f)
print("SKIPPED:")
for f in s1+s2: print("  ",f)
