#!/bin/bash
set -e
cd /home/user/workspace/fa-site/assets
mkdir -p courses_webp video_opt

echo "=== Converting 21 course PNGs to WebP <300KB ==="
for f in courses/*.png; do
  base=$(basename "$f" .png)
  # Resize to max 1600px wide, quality 82, target <300KB
  cwebp -quiet -q 82 -resize 1600 0 "$f" -o "courses_webp/$base.webp"
done
echo "WebP sizes:"; du -sh courses_webp/* | sort -h | tail -5
echo "Total WebP:"; du -sh courses_webp

echo "=== Compressing pillar videos (H.264, CRF 28, max 1280w) ==="
for f in video/pillar-*.mp4; do
  base=$(basename "$f" .mp4)
  ffmpeg -y -loglevel error -i "$f" -vf "scale='min(1280,iw)':-2" -c:v libx264 -crf 28 -preset slow -an -movflags +faststart "video_opt/$base.mp4"
done

echo "=== Compressing demo-class + real drive footage ==="
ffmpeg -y -loglevel error -i video/demo-class.mp4 -vf "scale='min(1280,iw)':-2" -c:v libx264 -crf 28 -preset slow -movflags +faststart video_opt/demo-class.mp4
ffmpeg -y -loglevel error -i drive/evening-classes-full.mp4 -vf "scale='min(1280,iw)':-2" -c:v libx264 -crf 26 -preset slow -movflags +faststart video_opt/evening-classes-full.mp4
ffmpeg -y -loglevel error -i drive/evening-classes-2.m4v -vf "scale='min(1280,iw)':-2" -c:v libx264 -crf 26 -preset slow -movflags +faststart video_opt/evening-classes-2.mp4

echo "=== DONE ==="
echo "Optimized video sizes:"; du -sh video_opt/* | sort -h
echo "TOTAL courses_webp:"; du -sh courses_webp
echo "TOTAL video_opt:"; du -sh video_opt
