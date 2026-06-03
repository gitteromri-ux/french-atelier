#!/usr/bin/env python3
import re, os, sys

ROOT = "/home/user/workspace/fa-site-v3"

with open(os.path.join(ROOT, "_partials/canonical_nav.html")) as f:
    NAV = f.read().rstrip("\n")
with open(os.path.join(ROOT, "_partials/canonical_footer.html")) as f:
    FOOT = f.read().rstrip("\n")

# pages: (relpath, prefix)
pages = [
    ("how-it-works.html", ""),
    ("method.html", ""),
    ("about.html", ""),
    ("courses.html", ""),
    ("pricing.html", ""),
    ("faq.html", ""),
    ("contact.html", ""),
    ("terms.html", ""),
    ("privacy.html", ""),
    ("culture.html", ""),
    ("capsules.html", ""),
    ("courses/fa-foundation.html", "../"),
    ("courses/fa-beginner.html", "../"),
    ("courses/fa-elementary.html", "../"),
    ("courses/fa-intermediate.html", "../"),
    ("courses/lsf-foundation.html", "../"),
    ("courses/lsf-beginner.html", "../"),
    ("courses/lsf-elementary.html", "../"),
]

# regex to capture header..drawer block:
# <header class="site-header"> ... </header> [whitespace] <div class="nav-drawer" ...> ... </div>
header_re = re.compile(
    r'<header class="site-header">.*?</header>\s*<div class="nav-drawer"[^>]*>.*?</div>\s*</div>',
    re.DOTALL,
)
# Simpler: capture from <header class="site-header"> up to the close of the drawer.
# The drawer ends at the </div> that closes the nav-drawer. We rely on structure: drawer contains
# a final <a ...>Enroll Now</a> then </div>. Use that anchor.
drawer_re = re.compile(
    r'<header class="site-header">.*?class="btn btn-gold" style="margin-top:1\.6rem">Enroll Now</a>\s*</div>',
    re.DOTALL,
)

footer_re = re.compile(r'<footer class="site-footer">.*?</footer>', re.DOTALL)

for rel, prefix in pages:
    path = os.path.join(ROOT, rel)
    with open(path) as f:
        html = f.read()
    nav = NAV.replace("{P}", prefix)
    foot = FOOT.replace("{P}", prefix)

    new_html, n_nav = drawer_re.subn(lambda m: nav, html, count=1)
    if n_nav == 0:
        print(f"WARN: nav not replaced in {rel}")
    new_html, n_foot = footer_re.subn(lambda m: foot, new_html, count=1)
    if n_foot == 0:
        print(f"WARN: footer not replaced in {rel}")

    with open(path, "w") as f:
        f.write(new_html)
    print(f"{rel}: nav={n_nav} footer={n_foot}")

print("DONE")
