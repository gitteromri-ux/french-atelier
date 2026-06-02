import os, glob
from PIL import Image

src = "/home/user/workspace/fa-site/assets/courses"
out = "/home/user/workspace/fa-site/assets/courses_webp"
os.makedirs(out, exist_ok=True)

for f in sorted(glob.glob(os.path.join(src, "*.png"))):
    base = os.path.splitext(os.path.basename(f))[0]
    im = Image.open(f).convert("RGB")
    # Resize to max 1600px wide
    if im.width > 1600:
        h = int(im.height * 1600 / im.width)
        im = im.resize((1600, h), Image.LANCZOS)
    dest = os.path.join(out, base + ".webp")
    q = 82
    im.save(dest, "WEBP", quality=q, method=6)
    # Step quality down until <300KB
    while os.path.getsize(dest) > 300*1024 and q > 50:
        q -= 6
        im.save(dest, "WEBP", quality=q, method=6)
    print(f"{base}.webp  {os.path.getsize(dest)//1024}KB  q={q}")

total = sum(os.path.getsize(p) for p in glob.glob(os.path.join(out, "*.webp")))
print(f"TOTAL WebP: {total//1024//1024}MB across {len(glob.glob(os.path.join(out,'*.webp')))} files")
