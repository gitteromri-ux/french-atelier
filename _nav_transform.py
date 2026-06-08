"""
Nav transform for all HTML pages.

Goals:
1. Remove the "Cultural Resources" desktop nav dropdown entirely.
   Replace with a single nav link: "French Culture" → culture.html
2. In the desktop "Courses" dropdown, add "Culture Capsules · Coming Soon"
   as a new entry in the second column near "All Courses".
3. In the mobile drawer:
   - Remove the "Cultural Resources" drawer-group-label + its drawer-sub block.
   - Add a single drawer link "French Culture" → culture.html (after Julien).
   - In the Courses drawer-sub, add "Culture Capsules · Coming Soon".

Works for both root-level pages (href="culture.html") and courses/ subpages
(href="../culture.html"). Prefix is detected per file.
"""

import re
import sys
from pathlib import Path

ROOT = Path("/tmp/french-atelier")

# Files to transform
ROOT_PAGES = sorted([p for p in ROOT.glob("*.html")])
SUB_PAGES = sorted([p for p in (ROOT / "courses").glob("*.html")])
ALL_PAGES = ROOT_PAGES + SUB_PAGES

DESKTOP_CULTURAL_RE = re.compile(
    r'<div class="nav-item">\s*'
    r'<a class="nav-link" href="(?P<prefix>(?:\.\./)?)culture\.html">Cultural Resources[^<]*'
    r'<svg class="nav-caret"[^>]*>.*?</svg>\s*</a>\s*'
    r'<div class="nav-dropdown">.*?</div>\s*'
    r'</div>',
    re.DOTALL,
)

DRAWER_CULTURAL_RE = re.compile(
    r'<span class="drawer-group-label">Cultural Resources</span>\s*'
    r'<div class="drawer-sub">.*?</div>',
    re.DOTALL,
)


def transform_file(path: Path) -> bool:
    src = path.read_text(encoding="utf-8")
    original = src
    is_sub = path.parent.name == "courses"
    prefix = "../" if is_sub else ""

    # ---------- 1. Desktop nav: Cultural Resources → French Culture (single link) ----------
    desktop_replacement = (
        f'<div class="nav-item"><a class="nav-link" href="{prefix}culture.html">French Culture</a></div>'
    )

    new_src, n = DESKTOP_CULTURAL_RE.subn(desktop_replacement, src)
    if n == 0:
        # fallback regex - try simpler match
        simpler = re.compile(
            r'<div class="nav-item">\s*<a class="nav-link" href="(?:\.\./)?culture\.html">Cultural Resources.*?</div>\s*</div>',
            re.DOTALL,
        )
        new_src, n = simpler.subn(desktop_replacement, src)
    src = new_src

    # ---------- 2. Desktop "Courses" dropdown: add "Culture Capsules · Coming Soon" ----------
    # Insert into the second nav-dd-col before "All Courses"
    capsules_line_desktop = (
        f'            <a href="{prefix}capsules.html" class="nav-dd-comingsoon">Culture Capsules <span class="cs-tag">Coming Soon</span></a>\n'
    )
    src = re.sub(
        r'(\s+<span class="nav-dd-divide"></span>\s+<a href="(?:\.\./)?courses\.html">All Courses</a>)',
        lambda m: '\n' + capsules_line_desktop + m.group(1),
        src,
        count=1,
    )

    # ---------- 3. Mobile drawer: remove Cultural Resources block, add French Culture link ----------
    src, n_drawer = DRAWER_CULTURAL_RE.subn(
        f'<a href="{prefix}culture.html">French Culture</a>',
        src,
    )

    # ---------- 4. Mobile drawer Courses sub: add Culture Capsules · Coming Soon ----------
    # Add into the drawer-sub block right before the Interactive Map line
    src = re.sub(
        r'(\s+<a href="(?:\.\./)?map\.html">Interactive Map of France</a>)',
        lambda m: f'\n    <a href="{prefix}capsules.html" class="drawer-comingsoon">Culture Capsules <span class="cs-tag">Coming Soon</span></a>' + m.group(1),
        src,
        count=1,
    )

    if src != original:
        path.write_text(src, encoding="utf-8")
        return True
    return False


def main():
    changed = []
    for p in ALL_PAGES:
        try:
            if transform_file(p):
                changed.append(p.relative_to(ROOT))
        except Exception as e:
            print(f"ERR {p}: {e}", file=sys.stderr)
    print(f"Transformed {len(changed)} files:")
    for c in changed:
        print(f"  {c}")


if __name__ == "__main__":
    main()
