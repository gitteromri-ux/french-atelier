#!/usr/bin/env python3
"""Insert the inline advisor-section before the footer on content pages that
lack an inline lead-gen form. Skips legal pages (terms/privacy) which get the
modal CTA only. Idempotent. Fixes duplicate-id risk by giving each page unique
field ids."""
import re, glob, os

ROOT = "/home/user/workspace/fa-site"
SECTION = open(os.path.join(ROOT, "_partials/advisor-section.html")).read().strip()

# pages that should receive the inline advisor section (lead-gen near page end)
TARGETS = ["how-it-works","method","juliane","teachers","culture","pricing",
           "faq","blog","about","acadomia","capsules","map"]
# terms, privacy, contact handled separately (contact already has its own form area)

def unique_section(slug):
    s = SECTION
    for fid in ["inl-name","inl-email","inl-level","inl-time"]:
        s = s.replace(fid, slug+"-"+fid)
    return s

for slug in TARGETS:
    path = os.path.join(ROOT, slug+".html")
    html = open(path, encoding="utf-8").read()
    if 'class="section-pad bg-ivory advisor-section"' in html or 'id="talk-to-advisor"' in html:
        print("skip (has section):", slug); continue
    idx = html.find('<footer class="site-footer">')
    if idx == -1:
        print("NO FOOTER:", slug); continue
    html = html[:idx] + unique_section(slug) + "\n\n" + html[idx:]
    open(path, "w", encoding="utf-8").write(html)
    print("section added:", slug)
