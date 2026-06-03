#!/usr/bin/env python3
import os
ROOT="/home/user/workspace/fa-site-v3"
# page -> nav-link href (relative within nav, as written in canonical_nav with prefix)
mapping = {
 "how-it-works.html": "how-it-works.html",
 "method.html": "method.html",
 "courses.html": "courses.html",
 "culture.html": "culture.html",
 "capsules.html": "culture.html",   # capsules sits under Culture
 "about.html": "about.html",
 "faq.html": "about.html",
 "contact.html": "about.html",
 "pricing.html": "about.html",
 "terms.html": None,
 "privacy.html": None,
 "courses/fa-foundation.html": "courses.html",
 "courses/fa-beginner.html": "courses.html",
 "courses/fa-elementary.html": "courses.html",
 "courses/fa-intermediate.html": "courses.html",
 "courses/lsf-foundation.html": "courses.html",
 "courses/lsf-beginner.html": "courses.html",
 "courses/lsf-elementary.html": "courses.html",
}
for rel,target in mapping.items():
    if not target: continue
    path=os.path.join(ROOT,rel)
    prefix="../" if rel.startswith("courses/") else ""
    href=prefix+target
    s=open(path).read()
    needle=f'<a class="nav-link" href="{href}">'
    repl=f'<a class="nav-link active" href="{href}">'
    if needle in s:
        s=s.replace(needle, repl, 1)
        open(path,"w").write(s)
        print(f"{rel}: active set on {href}")
    else:
        print(f"WARN {rel}: needle not found ({href})")
print("DONE")
