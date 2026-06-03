#!/usr/bin/env python3
import os, re, glob

ROOT = "/home/user/workspace/fa-site-v3"
pages = []
pages += glob.glob(os.path.join(ROOT, "*.html"))
pages += glob.glob(os.path.join(ROOT, "courses", "*.html"))
pages += glob.glob(os.path.join(ROOT, "blog", "*.html"))

# Exclude index.html (handled separately)
pages = [p for p in pages if os.path.basename(p) != "index.html"]

# regex for src, href (assets), data-src, srcset, url() in inline style, poster
attr_re = re.compile(r'(?:src|href|poster|data-src|data-bg)\s*=\s*["\']([^"\']+)["\']', re.I)
srcset_re = re.compile(r'srcset\s*=\s*["\']([^"\']+)["\']', re.I)
url_re = re.compile(r'url\(\s*["\']?([^"\')]+)["\']?\s*\)', re.I)

missing = {}
checked_ext = re.compile(r'\.(png|jpg|jpeg|webp|gif|svg|mp4|webm|mov|avif|woff2?|ttf|otf)$', re.I)

def resolve(page, ref):
    ref = ref.split('#')[0].split('?')[0]
    if not ref: return None
    if ref.startswith(('http://','https://','data:','mailto:','tel:','//','javascript:')):
        return None
    base = os.path.dirname(page)
    if ref.startswith('/'):
        return os.path.join(ROOT, ref.lstrip('/'))
    return os.path.normpath(os.path.join(base, ref))

for page in pages:
    with open(page, encoding='utf-8') as f:
        html = f.read()
    refs = set()
    for m in attr_re.finditer(html):
        refs.add(m.group(1))
    for m in srcset_re.finditer(html):
        for part in m.group(1).split(','):
            u = part.strip().split(' ')[0]
            if u: refs.add(u)
    for m in url_re.finditer(html):
        refs.add(m.group(1))
    for ref in refs:
        if not checked_ext.search(ref.split('#')[0].split('?')[0]):
            continue
        path = resolve(page, ref)
        if path is None: continue
        if not os.path.exists(path):
            missing.setdefault(os.path.relpath(page, ROOT), []).append(ref)

if not missing:
    print("NO MISSING ASSETS FOUND")
else:
    total = 0
    for page in sorted(missing):
        print(f"\n{page}:")
        for ref in sorted(set(missing[page])):
            print(f"   MISSING: {ref}")
            total += 1
    print(f"\nTOTAL MISSING REFS: {total}")
