#!/usr/bin/env python3
import re, os
ROOT="/home/user/workspace/fa-site-v3"

# alt text per real image
A = {
 1:("a-lession-1.png","Learn French through landmarks \u2014 live from Saint-Germain"),
 2:("a-lession-2.png","Learn French through caf\u00e9s \u2014 live from Paris"),
 3:("a-lession-3.png","Learn French through fashion \u2014 live from Parisian galleries"),
 4:("a-lession-4.png","Learn French through wine \u2014 live from Bordeaux vineyards"),
 5:("a-lession-5.png","Learn French through music \u2014 live from Paris"),
}
B = {
 1:("b-lession-1.png","Learn French through landmarks \u2014 live from Parisian neighbourhoods"),
 2:("b-lession-2.png","Learn French through art \u2014 live from the Louvre"),
 3:("b-lession-3.png","Learn French through greetings \u2014 live from Parisian galas & tearooms"),
 4:("b-lession-4.png","Learn French through history \u2014 live from Notre-Dame"),
 5:("b-lession-5.png","Learn French through Bastille Day \u2014 live from the Champs-\u00c9lys\u00e9es"),
}

# FA pages: which 3 a-lession images to use
fa_map = {
 "fa-foundation":   [1,2,3],
 "fa-beginner":     [2,4,5],
 "fa-elementary":   [3,1,5],
 "fa-intermediate": [4,5,2],
}
# LSF pages: which 3 b-lession images
lsf_map = {
 "lsf-foundation":  [1,2,4],
 "lsf-beginner":    [2,3,5],
 "lsf-elementary":  [4,2,3],
}

def trio_html(items, src_dict, label):
    cells=[]
    for n in items:
        fn,alt=src_dict[n]
        cells.append(f'<div class="it"><img src="../assets/old_site/{fn}" alt="{alt}" loading="lazy"></div>')
    return ('<div class="img-trio" data-reveal style="margin-top:clamp(2.5rem,5vw,4rem)">'
            + "".join(cells) + "</div>")

# --- FA: replace the existing img-trio block (courses_clean) ---
for slug,items in fa_map.items():
    path=os.path.join(ROOT,"courses",slug+".html")
    s=open(path).read()
    new_trio=trio_html(items,A,slug)
    s2=re.sub(r'<div class="img-trio"[^>]*>.*?</div>\s*</div>\s*</section>',
              new_trio + "\n  </div>\n</section>", s, count=1, flags=re.DOTALL)
    if s2==s:
        # fallback: replace just the img-trio div
        s2=re.sub(r'<div class="img-trio"[^>]*>.*?</div></div></div>', new_trio, s, count=1, flags=re.DOTALL)
    open(path,"w").write(s2)
    print(f"{slug}: trio swapped -> {[A[n][0] for n in items]}")

# --- LSF: insert a branded real-image gallery section after the first content section ---
LSF_SECTION = '''
<section class="sec bg-paper">
  <div class="cw">
    <div class="sec-head" data-reveal>
      <span class="eyebrow eyebrow-line">Live from France</span>
      <h2>Real teachers, real places</h2>
      <p>Every lesson is broadcast live from France by a native Parisian teacher &mdash; real culture, in real time.</p>
      <hr class="gold-rule">
    </div>
    {TRIO}
  </div>
</section>
'''
for slug,items in lsf_map.items():
    path=os.path.join(ROOT,"courses",slug+".html")
    s=open(path).read()
    if "assets/old_site/b-lession" in s:
        print(f"{slug}: already has real images, skipping insert")
        continue
    trio=trio_html(items,B,slug)
    section=LSF_SECTION.replace("{TRIO}",trio)
    # insert before the syllabus section
    anchor='<section class="sec bg-navy-grad on-dark" id="syllabus">'
    if anchor in s:
        s=s.replace(anchor, section+"\n"+anchor, 1)
        open(path,"w").write(s)
        print(f"{slug}: inserted real-image gallery -> {[B[n][0] for n in items]}")
    else:
        print(f"WARN {slug}: syllabus anchor not found")
print("DONE")
