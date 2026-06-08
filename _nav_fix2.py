"""
Nav transform v2 - handles remaining 14 pages with old nav.
Handles nav-link AND nav-link.active variants, and blog/ subdirectory paths.
"""
import re
from pathlib import Path

ROOT = Path("/tmp/french-atelier")
PAGES = list(ROOT.glob("*.html")) + list((ROOT / "blog").glob("*.html"))

# Match nav-item containing Cultural Resources link with optional `active` class
DESKTOP_CR_RE = re.compile(
    r'<div class="nav-item">\s*'
    r'<a class="nav-link(?: active)?" href="(?:\.\./)?culture\.html">Cultural Resources[^<]*'
    r'<svg class="nav-caret"[^>]*>.*?</svg>\s*</a>\s*'
    r'<div class="nav-dropdown">.*?</div>\s*'
    r'</div>',
    re.DOTALL,
)

DRAWER_CR_RE = re.compile(
    r'<span class="drawer-group-label">Cultural Resources</span>\s*'
    r'<div class="drawer-sub">.*?</div>',
    re.DOTALL,
)


def transform(path: Path) -> bool:
    src = path.read_text(encoding="utf-8")
    original = src
    is_blog = path.parent.name == "blog"
    prefix = "../" if is_blog else ""

    # Decide if "French Culture" link should be active
    active = ' active' if path.name == 'culture.html' else ''
    replacement = (
        f'<div class="nav-item"><a class="nav-link{active}" href="{prefix}culture.html">French Culture</a></div>'
    )

    src, n1 = DESKTOP_CR_RE.subn(replacement, src)
    
    # Add Culture Capsules in Courses dropdown (before All Courses)
    capsules_line = (
        f'            <a href="{prefix}capsules.html" class="nav-dd-comingsoon">Culture Capsules <span class="cs-tag">Coming Soon</span></a>\n'
    )
    # Only add if not already present
    if 'nav-dd-comingsoon' not in src:
        src, n2 = re.subn(
            r'(\s+<span class="nav-dd-divide"></span>\s+<a href="(?:\.\./)?courses\.html">All Courses</a>)',
            lambda m: '\n' + capsules_line + m.group(1),
            src,
            count=1,
        )
    else:
        n2 = 0

    # Drawer
    src, n3 = DRAWER_CR_RE.subn(
        f'<a href="{prefix}culture.html">French Culture</a>',
        src,
    )

    # Drawer Courses sub - add Culture Capsules
    if 'drawer-comingsoon' not in src:
        src, n4 = re.subn(
            r'(\s+<a href="(?:\.\./)?map\.html">Interactive Map of France</a>)',
            lambda m: f'\n    <a href="{prefix}capsules.html" class="drawer-comingsoon">Culture Capsules <span class="cs-tag">Coming Soon</span></a>' + m.group(1),
            src,
            count=1,
        )
    else:
        n4 = 0

    if src != original:
        path.write_text(src, encoding="utf-8")
        return (n1, n2, n3, n4)
    return None


for p in PAGES:
    res = transform(p)
    if res:
        print(f"{p.relative_to(ROOT)} => desktop_cr={res[0]} capsules_dd={res[1]} drawer_cr={res[2]} drawer_caps={res[3]}")
