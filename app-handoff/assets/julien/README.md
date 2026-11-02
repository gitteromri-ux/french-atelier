# Julien curated media library

This library contains 59 media assets, including the original curated set, recovered historical scenes and motion, original uploaded videos, and exact-size full-body/avatar exports. Original files are preserved byte-for-byte; the original inventory is in `source-manifest.json`, additions are in `recovered-manifest.json`, and [recovery notes](RECOVERY-NOTES.md) explain the standing artwork and uploaded sources.

## Start here

- **Recommended head-and-shoulders avatar:** `stills/julien-avatar-640.png`, exact 640×640 RGBA native crop from the recovered standing original's transparent cutout.
- **Alternative square still:** `stills/julien-head-shoulders-900.png`, 900×900 RGBA, cropped from the older cleaned upper-body source.
- **Alternative close face crop:** `stills/julien-portrait-640-edge-clean.png`, 640×640 RGBA.
- **Upper body:** `stills/julien-upper-body-transparent-900x1224-edge-clean.png`, 900×1224 RGBA.
- **Transparent motion:** `originals/webm/julian-735.webm`, 900×1224 VP9 alpha, 3.066 seconds, no embedded sound.
- **Talking master:** `originals/mp4/julien-hero-master.mp4`, 800×1088 H.264 with embedded AAC, 3.095 seconds, opaque light backdrop.
- **Exact 735 first frame:** `stills/julien-alpha-first-frame.png`, 900×1224 RGBA, not edge-cleaned.
- **Exact master first frame:** `stills/julien-master-first-frame.png`, 800×1088 RGB, original backdrop unchanged.
- **Visual overview:** `review/library-overview.jpg` shows the seven included transparent motion sources plus the opaque hero master.

## Source size and transparency

| Original motion file | Encoded dimensions | Duration | Audio |
|---|---:|---:|---|
| `webm/julian-307.webm` | 720×980 | 2.533 s | None |
| `webm/julian-309.webm` | 720×980 | 2.166 s | None |
| `webm/julian-336.webm` | 720×970 | 2.292 s | None |
| `webm/julian-719.webm` | 720×980 | 2.666 s | None |
| `webm/julian-735.webm` | 900×1224 | 3.066 s | None |
| `webm/julian-base.webm` | 760×1022 | 3.366 s | None |
| `webm/julian-kling2.webm` | 720×966 | 5.042 s | None |
| `mp4/julien-hero-master.mp4` | 800×1088 | 3.095 s | Embedded AAC |
| `mp4/juliane-307.mp4` | 600×816 | 2.533 s | None |
| `mp4/juliane-309.mp4` | 600×816 | 2.167 s | None |
| `mp4/juliane-336.mp4` | 600×808 | 2.292 s | None |
| `mp4/juliane-719.mp4` | 600×816 | 2.667 s | None |
| `mp4/juliane-735.mp4` | 600×816 | 3.067 s | None |

Paths in the table are relative to `originals/`. The seven WebMs have actual alpha verified by explicit libvpx-vp9 decoding, while the six MP4 files are opaque.

The seven included alpha-poster WebPs are 720 pixels wide, except the opaque base poster at 760 pixels wide; exact dimensions are in the manifest. `originals/posters/julian-base-still.webp` and `julian-base-poster.webp` are opaque 760×1022 RGB despite the original folder being named `video-alpha`.

## Audio matches: verified integration only

`audio-mapping.json` distinguishes confirmed site-code mappings from unverified tracks. The matching numbers below are confirmed by actual `data-speak` references on the corresponding video element in repository `juliane.html`; this is not a claim of independently audited speech or lip synchronization.

| WebM | Verified site-linked original audio |
|---|---|
| `julian-307.webm` | `originals/audio/site/julien-307.mp3` |
| `julian-309.webm` | `originals/audio/site/julien-309.mp3` |
| `julian-719.webm` | `originals/audio/site/julien-719.mp3` |
| `julian-735.webm` | `originals/audio/site/julien-735.mp3` |

The hero master contains its own AAC track. No separate audio pairing has been verified for 336, base, kling2, the numbered opaque MP4 derivatives, or `julien_intro_fr.mp3`.

The files under `originals/audio/alternate/` came from `assets/juliane/audio/`, not `assets/julien/audio/`. Their names do not establish a verified audio-video match; retain them as source material, not automatically assigned playback tracks.

The longer spoken intro is `originals/audio/site/julien_intro_fr.mp3`, verified at 15.290958 seconds. Historical recovery also supplies `originals/recovered/julian-336-intro-loop.webm`, a 900×1212, 15.366-second video-only loop; it is not presented as a newly certified lip-synchronised take.

## Edge-clean derivatives and visibility

The original avatar and upper-body PNGs remain in `stills/` alongside separately named `-edge-clean.png` derivatives. Cleanup changes RGB only at semitransparent pixels by borrowing RGB from the nearest fully opaque interior pixel, with a two-pixel inward margin.

Dimensions and alpha values are unchanged. All fully opaque and fully transparent pixels are unchanged, and no image was enlarged, sharpened, regenerated, or synthesized.

- **Avatar comparison:** `review/julien-portrait-640-before-after.png`, white and navy backgrounds at native image size.
- **Upper-body comparison:** `review/julien-upper-body-transparent-900x1224-before-after.png`, white and navy backgrounds at native image size.
- **Pixel audit:** `source-manifest.json` records 14,540 changed RGB pixels for the avatar and 23,028 for the upper-body derivative, with alpha and opaque-pixel invariance checked.

The result reduces semitransparent edge contamination without smearing the face or clothing. Opaque light hair-edge pixels and existing video compression or motion softness are still source limitations, so these are not advertised as perfect new high-resolution mattes.

## Deliberate exclusions and missing material

- **Watermarked Kling clip:** `julian-kling.webm` has a visible Kling watermark at 2.5 seconds near the lower-right edge, so it and its paired poster are excluded. The unmodified files remain in the recovery source directory outside this curated library.
- **Kling2:** Included after reviewing start/middle/end and ten distributed frames; no watermark was visible in those checks. Its original motion softness is preserved rather than retouched.
- **Old/backups:** All `OLD` and `.bak` files are excluded.
- **Wrong-identity images:** Onboarding photographs and T-shirt artwork are excluded.
- **Full-body original and export:** `originals/recovered/julien_teaching.png` is the genuine 887×1774 standing source, with both feet visible. `stills/julien-full-body-1800x2400.png` is its exact-size transparent cutout derivative; `full-body-derivative.json` documents the modest resampling, extraction and placement, and the native-size cutout is preserved.
- **Room overlay:** Not generated or included.

## Verification

All included video files decoded end-to-end without an ffmpeg error. Original copies were verified byte-identical to recovered sources, all eight reviewed source WebM first frames had real alpha, and the curated overview plus white/navy comparisons were visually inspected.

The repository version is `gitteromri-ux/french-atelier` commit `028c12e1a695c81ee4ed0a666d09a449c1495c2c`, recovered on 2026-11-02. No source repository changes or external publishing were performed.

The final inventory rechecked `main` plus branch-tip trees `review/teachers-7-grid`, `staging-capsules-light`, `staging-checkout`, and `staging-checkout-ecom-dark`; these expose the same eight non-backup Julien WebMs, five numbered MP4s and single hero master. The longest recovered Julien motion source is 5.042 seconds; the master is 3.095 seconds.

This is the current Julien media inventory found in the inspected repository trees, with the watermarked clip deliberately excluded from the curated package. It is not an inventory of every historical upload: deleted commit history, previous chat attachments, Drive files, and external generation-storage objects were not exhaustively searched.
