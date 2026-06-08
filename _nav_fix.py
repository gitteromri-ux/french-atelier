"""
Fix the duplicate/misplaced Culture Capsules nav entry from the previous transform.

1. In the desktop Courses dropdown (nav-dropdown-wide), remove the stray
   drawer-comingsoon line that landed between "All Courses" and the
   Interactive Map of France line.

2. Remove the .nav-dd-comingsoon "Culture Capsules" line that landed in
   the LSF column (we want it only once, in the FA column right under
   "FA Intermediate", at the END of the structured courses list, before
   the column boundary).

3. Ensure mobile drawer has a "Culture Capsules · Coming Soon" entry
   inside the Courses drawer-sub (before Interactive Map).
"""
import re
from pathlib import Path

ROOT = Path("/tmp/french-atelier")
PAGES = sorted([*ROOT.glob("*.html"), *(ROOT / "courses").glob("*.html")])


def fix_file(p: Path) -> bool:
    src = p.read_text(encoding="utf-8")
    original = src
    is_sub = p.parent.name == "courses"
    prefix = "../" if is_sub else ""

    # 1. Strip the stray drawer-comingsoon line that landed in desktop dropdown
    src = re.sub(
        r'\n\s*<a href="(?:\.\./)?capsules\.html" class="drawer-comingsoon">Culture Capsules <span class="cs-tag">Coming Soon</span></a>',
        "",
        src,
    )

    # 2. Remove all existing nav-dd-comingsoon Culture Capsules from any column (we'll re-add cleanly)
    src = re.sub(
        r'\n?\s*<a href="(?:\.\./)?capsules\.html" class="nav-dd-comingsoon">Culture Capsules <span class="cs-tag">Coming Soon</span></a>\n?',
        "\n",
        src,
    )

    # 3. Re-insert ONE nav-dd-comingsoon line right after the FA Intermediate row in the structured FA column
    insertion_desktop = f'            <a href="{prefix}capsules.html" class="nav-dd-comingsoon">Culture Capsules <span class="cs-tag">Coming Soon</span></a>\n'
    src, n = re.subn(
        r'(<a href="(?:\.\./)?courses/fa-intermediate\.html">FA Intermediate <em>[^<]+</em></a>\n)',
        lambda m: m.group(1) + insertion_desktop,
        src,
        count=1,
    )

    # 4. Mobile drawer Courses sub: add Culture Capsules Coming Soon if not present in drawer
    # Find Courses drawer-sub block and add line before </div> if not already there
    def add_to_drawer(match):
        block = match.group(0)
        if 'class="drawer-comingsoon"' in block:
            return block  # already has it
        # Insert before the closing </div>
        insertion = f'    <a href="{prefix}capsules.html" class="drawer-comingsoon">Culture Capsules <span class="cs-tag">Coming Soon</span></a>\n  '
        return block.replace('</div>', insertion + '</div>', 1)

    src = re.sub(
        r'<span class="drawer-group-label">Courses</span>\s*<div class="drawer-sub">.*?</div>',
        add_to_drawer,
        src,
        count=1,
        flags=re.DOTALL,
    )

    if src != original:
        p.write_text(src, encoding="utf-8")
        return True
    return False


changed = [str(p.relative_to(ROOT)) for p in PAGES if fix_file(p)]
print(f"Fixed {len(changed)} files")
for c in changed:
    print(f"  {c}")
