#!/usr/bin/env python3
"""Inject icon sprite + advisor modal into every owned internal page.
Idempotent: skips if already present. Adjusts asset paths for blog/ subdir."""
import re, glob, os

ROOT = "/home/user/workspace/fa-site"

SPRITE = open(os.path.join(ROOT, "_partials/icons.html")).read().strip()
MODAL  = open(os.path.join(ROOT, "_partials/advisor-modal.html")).read().strip()

OWNED_ROOT = ["how-it-works","method","juliane","teachers","culture","pricing",
              "faq","blog","about","acadomia","contact","terms","privacy",
              "capsules","map"]
files = [os.path.join(ROOT, f+".html") for f in OWNED_ROOT]
files += glob.glob(os.path.join(ROOT, "blog", "*.html"))

def adjust_for_subdir(html):
    # blog/*.html live one level deeper -> sprite/modal use no asset paths,
    # but the modal uses #i-... fragment refs (no path change needed).
    return html

for path in files:
    html = open(path, encoding="utf-8").read()
    changed = False

    # 1) sprite right after <body ...>
    if "fa-icon-sprite" not in html:
        m = re.search(r"<body[^>]*>", html)
        if m:
            idx = m.end()
            html = html[:idx] + "\n\n" + SPRITE + "\n" + html[idx:]
            changed = True

    # 2) modal just before the fa.js script include
    if 'class="advisor-modal"' not in html:
        # insert before <script src=".../js/fa.js">
        m = re.search(r"<script[^>]*js/fa\.js[^>]*>\s*</script>", html)
        if m:
            idx = m.start()
            html = html[:idx] + MODAL + "\n\n" + html[idx:]
            changed = True
        else:
            # fallback: before </body>
            idx = html.rfind("</body>")
            if idx != -1:
                html = html[:idx] + MODAL + "\n\n" + html[idx:]
                changed = True

    if changed:
        open(path, "w", encoding="utf-8").write(html)
        print("injected:", os.path.relpath(path, ROOT))
    else:
        print("skip (already present):", os.path.relpath(path, ROOT))
