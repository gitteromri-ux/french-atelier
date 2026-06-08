#!/usr/bin/env python3
"""Append a cache-buster query (?v=BUILD) to every local css/js asset reference
   in every HTML file, and insert no-store meta tags into <head> so the browser
   never serves a stale version. Re-running replaces any existing ?v= value."""
import glob, os, re, time

BUILD = str(int(time.time()))

PAT_CSS = re.compile(r'(<link[^>]+href=")(?!https?://)([^"?]+\.css)(?:\?v=[^"]*)?(")', re.I)
PAT_JS  = re.compile(r'(<script[^>]+src=")(?!https?://)([^"?]+\.js)(?:\?v=[^"]*)?(")', re.I)

META_BLOCK = (
    '<meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate, max-age=0">\n'
    '<meta http-equiv="Pragma" content="no-cache">\n'
    '<meta http-equiv="Expires" content="0">\n'
)

def process(path):
    with open(path, 'r', encoding='utf-8') as f:
        s = f.read()
    orig = s
    s = PAT_CSS.sub(lambda m: m.group(1) + m.group(2) + '?v=' + BUILD + m.group(3), s)
    s = PAT_JS.sub(lambda m: m.group(1) + m.group(2) + '?v=' + BUILD + m.group(3), s)
    # Remove any previous no-cache block, then reinsert fresh
    s = re.sub(r'<meta http-equiv="Cache-Control"[^>]*>\s*<meta http-equiv="Pragma"[^>]*>\s*<meta http-equiv="Expires"[^>]*>\s*', '', s, flags=re.I)
    # Insert right after the first <head ...> tag
    s = re.sub(r'(<head[^>]*>)', r'\1\n' + META_BLOCK, s, count=1, flags=re.I)
    if s != orig:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(s)
        return True
    return False

paths = []
paths += glob.glob('*.html')
paths += glob.glob('courses/*.html')
paths += glob.glob('blog/*.html')
n = 0
for p in paths:
    if process(p): n += 1
print(f'Updated {n}/{len(paths)} files. BUILD={BUILD}')
