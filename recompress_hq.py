#!/usr/bin/env python3
"""Re-encode course images at retina-sharp 2200px WebP (quality 86) to preserve
the 8K-ultra luxury look while staying lightweight. Replaces files in courses_webp/."""
import os, glob
from PIL import Image

SRC = "assets/courses"
OUT = "assets/courses_webp"
TARGET_W = 2200
Q = 86
os.makedirs(OUT, exist_ok=True)

rows = []
for src in sorted(glob.glob(f"{SRC}/*.png")):
    name = os.path.splitext(os.path.basename(src))[0]
    im = Image.open(src).convert("RGB")
    w, h = im.size
    if w > TARGET_W:
        nh = round(h * TARGET_W / w)
        im = im.resize((TARGET_W, nh), Image.LANCZOS)
    outp = f"{OUT}/{name}.webp"
    im.save(outp, "WEBP", quality=Q, method=6)
    kb = os.path.getsize(outp) // 1024
    rows.append((name, im.size, kb))

total = 0
for name, size, kb in rows:
    total += kb
    print(f"{name}: {size[0]}x{size[1]}  {kb}KB")
print(f"\nTOTAL: {total/1024:.1f} MB across {len(rows)} images  (avg {total//len(rows)}KB)")
