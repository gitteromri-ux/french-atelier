# French Atelier — Culture Capsules: 10-Day Meta Launch Plan

**Version:** v2 · refreshed Mon 19 Oct 2026 · GiTA Agency
**Period:** Wed 21 Oct – Fri 30 Oct 2026 (10 days) · **Budget:** $500/day → **$5,000 total** · **Objective:** Sales / Purchase (pixel, 7-day click / 1-day view, lowest cost)
**Landing page:** https://fa-capsules-d.pplx.app/capsules.html (pricing redesign in progress on branch `staging-capsules-light`)
**Offer:** 1 capsule $297 (3 × $99) · 2 capsules $534 (3 × $178, $89/capsule) · All 3 $567 (3 × $189, $63/capsule, best seller) · code **CAPSULE20** = extra 20% off any package.
**Price status:** the prices above are **not yet approved by eTeacher**. The plan does not go live until eTeacher confirms them; if they change, only the AOV and revenue columns move.

This is a **signal test, not a scale phase**. ROAS is not expected to be positive by Day 10. The goal is to exit learning fast, find the 2–3 ads and the audience that convert, and land **5–10 purchases by Day 10** with a readable trend, then scale what works. The model below lands on **8.2 purchases at $606 CPA, ROAS 0.7**.

---

## 1. Creative inventory — go-to-market set (15 assets)

Rule: 3 hero videos + 4 UGC + 8 banners / stories / reels, so every ad set carries 5 ads from day one and learning exits fast.

| # | Asset | Type | Format | Placement | Hook (first 2 s / headline) | Ad set |
|---|---|---|---|---|---|---|
| H1 | Hero — "Three doors to France" (3 capsules montage) | Hero video 30–45 s | 9:16 + 4:5 | Reels, Stories, Feed | "Paris, live, from your sofa — 3 French experts, 30 evenings" | 01, 02, 03 |
| H2 | Hero — Gastronomy & Wine (Champagne cellar, chef) | Hero video 30 s | 9:16 + 4:5 | Reels, Feed | "Why French butter tastes different — a chef explains, live" | 01, 02 |
| H3 | Hero — Cinema & Music / Fashion & Art (Garnier, couture) | Hero video 30 s | 9:16 + 4:5 | Reels, Feed | "From Méliès to Amélie: 10 films that made France" | 02, 03 |
| U1 | UGC — "I don't speak French and I loved it" | UGC 15–20 s | 9:16 | Reels, Stories | "No French needed. Here's what a live capsule is actually like" | 01, 02, 03 |
| U2 | UGC — "Ask the expert live" (Q&A moment) | UGC 15 s | 9:16 | Reels, Stories | "I asked a Parisian sommelier one question…" | 01, 03 |
| U3 | UGC — "Three capsules, $63 a month" (value / price) | UGC 15 s | 9:16 | Reels, Stories | "$6.30 per live session with a French expert. Here's the math" | 02, 03 |
| U4 | UGC — "My Thursday evening in Paris" (lifestyle) | UGC 20 s | 9:16 | Reels | "Every Thursday at 7 pm I'm in Paris. Sort of." | 01, 02 |
| B1 | Banner — Pricing card "All 3 capsules · $63/mo" | Static | 1:1 + 4:5 | Feed | "All three capsules. $63 a month per capsule. Live from France." | 01, 02, 03 |
| B2 | Banner — Fashion & Art (Chanel / Dior / YSL triptych) | Static | 1:1 + 4:5 | Feed | "10 live sessions on French fashion & art. Taught in English." | 01, 02 |
| B3 | Banner — Gastronomy & Wine (Camembert / Champagne / Macaron) | Static | 1:1 + 4:5 | Feed | "Eat, drink and understand France. 10 live evenings." | 01, 02 |
| B4 | Banner — Cinema & Music (Piaf / Bardot / Amélie) | Static | 1:1 + 4:5 | Feed | "The French films and songs everyone references. Explained live." | 02, 03 |
| S1 | Story — CAPSULE20 countdown | Story / static | 9:16 | Stories | "20% off any capsule · code CAPSULE20 · 7 days" | 03 |
| S2 | Story — "Choose your capsule" tap poll | Story / static | 9:16 | Stories | "Fashion, Food or Film — which France are you?" | 01, 02 |
| R1 | Reel — 10 session titles scroll (Gastronomy) | Reel 12 s, text-on-video | 9:16 | Reels | "10 evenings. 10 French obsessions." | 01, 03 |
| R2 | Reel — "What you get" card hierarchy (sessions, Q&A, experts) | Reel 12 s | 9:16 | Reels | "Live · in English · from France · 3 payments" | 02, 03 |

Every ad links to `capsules.html#offers` with UTM `utm_source=meta&utm_medium=paid&utm_campaign=capsules_launch&utm_content={{ad.name}}`. All 15 assets must be in the ad account, approved, by Tue 20 Oct 18:00 Israel time so the campaign can go live at 00:00 on Wed 21 Oct (account time zone).

---

## 2. Campaign architecture — 3 ad sets, $500/day

Campaign: **FA_Capsules_Launch** · Sales objective · Purchase optimization · French Atelier pixel · 7d click / 1d view · lowest cost · ad-set budgets (no CBO) · US + CA + UK + AU, English, age 40–65, all genders · manual placements: Facebook Feed, Instagram Feed, Reels (FB + IG), Stories (FB + IG).

| Ad set | Daily budget | Audience | Exclusions | 5 ads (1–2 hero · 1 UGC · 2 reels/banners/stories) |
|---|---|---|---|---|
| **01 — Prospecting · Interests** | **$200** | Interests: France travel, French cuisine, French wine, Paris, Louvre, French cinema, Chanel / Dior / YSL, Alliance Française, Francophile media (France 24, Le Monde), Duolingo / Babbel | FA purchasers all time, site visitors 90d | H1 · H2 · U1 · B1 · R1 |
| **02 — Prospecting · Lookalikes** | **$200** | LAL 1–3% of **all French Atelier purchasers (all time)** + LAL 1% of checkout starters 180d, stacked | FA purchasers all time, site visitors 90d | H1 · H3 · U3 · B1 · R2 |
| **03 — Retargeting** | **$100** | All FA purchasers (all time) · 90-day site visitors · checkout abandoners 90d · form starters who did not complete 90d · engaged page actions (video 50%+, IG/FB engagers) 90d | Capsules purchasers 30d | H1 · U1 · U2 · S1 · B4 |

Frequency watch: Retargeting ≤ 4 per 7 days; if higher, rotate S1 → S2 and B4 → B2. Prospecting sets exclude each other's 90-day visitors so the retargeting set is the only one buying warm traffic.

---

## 3. Assumptions — labelled VERIFIED / ASSUMED

Benchmarks pulled this session from the Meta Marketing API (meta CLI, `ads insights get`), Mon 19 Oct 2026:

| Source | Window | Spend | CPM | CPC (link) | Link CTR | Label |
|---|---|---|---|---|---|---|
| **French Atelier v2** — `act_1358975119724184` | Last 30 days | $68,581 | **$47.8** | **$3.25** | 1.47% | **VERIFIED** (Meta API) |
| French Atelier v2 — `act_1358975119724184` | Last 90 days | $103,662 | $44.8 | $3.29 | 1.36% | **VERIFIED** (Meta API) |
| French Atelier — `act_1188017096669618` | Last 90 days (no spend last 30d) | $74,238 | $42.3 | $2.96 | 1.43% | **VERIFIED** (Meta API) |

Caveat (VERIFIED): both French Atelier accounts currently optimise for **Leads** (2,397 leads in 30 days on v2), not Purchases, and the landing-page-view event is under-reported there (1,686 LPV vs 25,098 link clicks on the older account), so LPV rate and every funnel rate below the click are **ASSUMED**. No Purchase-optimised history exists for this brand; the checkout benchmarks come from the Julie masterclass funnel (LLA account).

| Metric | Day 1 | Day 10 | Basis | Label |
|---|---|---|---|---|
| CPM (blended) | $45 | $38 | Anchored to FA v2 last-30d CPM $47.8; Purchase objective on 40–65 US/CA/UK/AU; retargeting (20% of spend) pulls the blend down; manual Reels/Stories placements cheaper than Feed | VERIFIED anchor · ASSUMED ramp |
| Link CTR | 1.40% | 1.70% | FA v2 last-30d 1.47%; video-led, Reels-heavy set should climb as losers are cut from Day 3 | VERIFIED anchor · ASSUMED ramp |
| CPC (link) | $3.2 | $2.2 | = CPM ÷ (CTR × 10); FA v2 last-30d $3.25 | VERIFIED anchor · ASSUMED ramp |
| Landing page view rate | 75% | 75% | Standard mobile LPV rate on a fast static page; FA account LPV event not reliable | ASSUMED |
| LPV → Checkout started | 0.45% | 1.40% | $297–567 ticket, cold traffic; climbs as the retargeting pool fills and losers are cut | ASSUMED |
| Checkout → Purchase | 40% | 65% | Julie masterclass checkout ran 67–81% (92 checkouts → 69 purchases, 13 Oct 2026); 3-step checkout, new offer, higher ticket → start lower | VERIFIED reference · ASSUMED ramp |
| AOV | $430 | $430 | Mix 40% × $297 · 20% × $534 · 40% × $567 = $471, minus CAPSULE20 usage ≈ $430; prices pending eTeacher approval | ASSUMED |

---

## 4. Day-by-day plan (what we spend, what we must see)

| Day | Date | Spend 01 / 02 / 03 | Spend | Cum spend | CPM | Impressions | CPC | Link clicks | LPV (75%) | Checkouts started | LPV→Checkout | Checkout→Purchase | LPV→Purchase | Purchases | Cum purchases | Cum CPA | Revenue (AOV $430) | Cum ROAS |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Wed 21 Oct | $200 / $200 / $100 | $500 | $500 | $45 | 11,111 | $3.2 | 156 | 117 | 0.5 | 0.5% | 40% | 0.2% | 0.2 | 0.2 | $2,381 | $90 | 0.2 |
| 2 | Thu 22 Oct | $200 / $200 / $100 | $500 | $1,000 | $44 | 11,364 | $3.1 | 161 | 121 | 0.7 | 0.6% | 45% | 0.2% | 0.3 | 0.5 | $1,963 | $129 | 0.2 |
| 3 | Fri 23 Oct | $200 / $200 / $100 | $500 | $1,500 | $43 | 11,628 | $3.0 | 169 | 126 | 0.8 | 0.7% | 50% | 0.3% | 0.4 | 0.9 | $1,630 | $177 | 0.3 |
| 4 | Sat 24 Oct | $200 / $200 / $100 | $500 | $2,000 | $42 | 11,905 | $2.8 | 176 | 132 | 1.1 | 0.8% | 50% | 0.4% | 0.5 | 1.4 | $1,380 | $227 | 0.3 |
| 5 | Sun 25 Oct | $200 / $200 / $100 | $500 | $2,500 | $41 | 12,195 | $2.7 | 185 | 139 | 1.3 | 0.9% | 55% | 0.5% | 0.7 | 2.2 | $1,149 | $312 | 0.4 |
| 6 | Mon 26 Oct | $200 / $200 / $100 | $500 | $3,000 | $40 | 12,500 | $2.6 | 195 | 146 | 1.5 | 1.1% | 55% | 0.6% | 0.8 | 3.0 | $993 | $363 | 0.4 |
| 7 | Tue 27 Oct | $200 / $200 / $100 | $500 | $3,500 | $39 | 12,821 | $2.4 | 205 | 154 | 1.8 | 1.1% | 60% | 0.7% | 1.1 | 4.1 | $858 | $456 | 0.5 |
| 8 | Wed 28 Oct | $200 / $200 / $100 | $500 | $4,000 | $39 | 12,821 | $2.4 | 210 | 158 | 2.0 | 1.2% | 60% | 0.8% | 1.2 | 5.3 | $760 | $509 | 0.6 |
| 9 | Thu 29 Oct | $200 / $200 / $100 | $500 | $4,500 | $38 | 13,158 | $2.3 | 221 | 166 | 2.2 | 1.4% | 65% | 0.9% | 1.5 | 6.7 | $670 | $626 | 0.6 |
| 10 | Fri 30 Oct | $200 / $200 / $100 | $500 | $5,000 | $38 | 13,158 | $2.2 | 224 | 168 | 2.3 | 1.4% | 65% | 0.9% | 1.5 | 8.2 | $606 | $656 | 0.7 |
| **Total** | 21–30 Oct | $2,000 / $2,000 / $1,000 | **$5,000** | | **$40.8 avg** | **122,659** | **$2.6** | **1,902** | **1,427** | **14.3** | **1.0%** | **57.9%** | **0.6%** | **8.2** | **8.2** | **$606** | **$3,546** | **0.7** |

**Read:** by Day 10 we have spent $5,000, generated ~1,427 landing page views and ~14.3 checkouts, and landed **~8.2 purchases at ~$606 CPA** — cumulative ROAS 0.7 on $3,546 revenue. Floor for a "positive trend" = 5 purchases; this model = 8.2. Not profitable yet; that is expected at $5k on a new offer with a $45 CPM account history.

Per-ad-set view of the same model (ASSUMED split: Retargeting converts ~2.5× better per LPV than prospecting; Lookalikes ~20% better than Interests):

| Ad set | 10-day spend | CPM (ASSUMED) | CPC (ASSUMED) | LPV | LPV→Purchase | Purchases | CPA | Revenue | ROAS | Role |
|---|---|---|---|---|---|---|---|---|---|---|
| **01 — Prospecting · Interests** | $2,000 | $43 | $2.9 | 496 | 0.5% | 2.5 | $808 | $1,064 | 0.5 | Cold reach, hook testing; feeds the RT pool |
| **02 — Prospecting · Lookalikes (all-time FA purchasers)** | $2,000 | $41 | $2.6 | 553 | 0.5% | 2.9 | $693 | $1,241 | 0.6 | Highest-quality cold traffic; expected best prospecting CPA |
| **03 — Retargeting** | $1,000 | $32 | $1.9 | 378 | 0.8% | 2.9 | $346 | $1,241 | 1.2 | Closes warm traffic; CPA must be lowest, frequency ≤ 4 / 7 d |
| **Total** | **$5,000** | **$40.8** | **$2.6** | **1,427** | **0.6%** | **8.2** | **$606** | **$3,546** | **0.7** | |


---

## 5. Decision gates

| Gate | When | Green (keep / scale) | Yellow (fix) | Red (kill / swap) |
|---|---|---|---|---|
| **G1 — Delivery** | Day 3 · Fri 23 Oct | CPM ≤ $48, CPC ≤ $3.3, LPV rate ≥ 70%, every set out of "Learning limited" risk (≥ 5 ads delivering) | CPC $3.3–4.5 → swap thumbnail / hook on worst 2 ads per set | CPC > $4.5 on an ad → pause it; ad set with 0 checkouts and ≥ $400 spent → replace 2 ads |
| **G2 — Intent** | Day 5 · Sun 25 Oct | ≥ 4 checkouts started cumulative, ≥ 1 purchase | 2–3 checkouts → move $50/day from worst set to best set | < 2 checkouts → re-check pixel + checkout events on the live page, replace creatives in that set |
| **G3 — Trend** | Day 7 · Tue 27 Oct | ≥ 4 purchases cumulative, cum CPA falling three days in a row | 2–3 purchases → hold budgets, kill bottom 40% of ads | 0–1 purchases → stop the prospecting set with 0 sales, keep RT + best set |
| **G4 — Verdict** | Day 10 · Fri 30 Oct | ≥ 5 purchases, LPV→purchase ≥ 0.5%, cum CPA ≤ $650 → scale | 3–4 purchases → extend 4 days at same spend, new creatives only | < 3 purchases → stop, fix offer / page, do not add budget |

Ad-level rules (checked daily from Day 3): kill any ad with ≥ $120 spend and 0 checkouts; kill any ad with link CTR < 0.7% after 8,000 impressions; never edit a winning ad (duplicate instead). Daily read to Omri at 09:00 Israel time: spend, CPM, CPC, LPV, checkouts, purchases per set with entity names and IDs.

**What a positive trend looks like by Day 10:** CPC falling week-over-week, LPV→checkout ≥ 1%, checkout→purchase ≥ 60%, 5–10 purchases, at least 2 ads with CPA under $500, retargeting CPA under $350.

**Week 3–4 if green:** raise the best prospecting set +20% every 48 h (never more), duplicate the top 3 ads into a new LAL 3–5% set at $150/day, keep retargeting at 20% of total spend. Target: 25–40 purchases on $10k, CPA ≤ $350, ROAS ≥ 1.2 gross.

---

## 6. Phase 2 (days 11–14)

**Green:** continue at $500–600/day with the same 3 sets, add 4 new creatives (2 UGC, 2 reels) built from the winning hooks, and raise the top set by 20%. **Red:** pause prospecting, keep retargeting at $100/day for 4 days to close the warm pool, and fix the page or the offer before any new money. The plan never exceeds $5,000 in the first 10 days.

---
*Sources: Meta Marketing API insights for ad accounts French Atelier v2 (act_1358975119724184) and French Atelier (act_1188017096669618), pulled 19 Oct 2026 via the meta CLI (VERIFIED); offer and prices from the Culture Capsules page (https://fa-capsules-d.pplx.app/capsules.html), pending eTeacher approval; checkout conversion reference from the Julie masterclass funnel (2,863 visitors → 92 checkouts → 69 purchases, 13 Oct 2026); Meta Purchase-optimization setup mirrors the Julie Set 01 configuration (pixel, 7d click / 1d view, lowest cost). Everything not marked VERIFIED is ASSUMED.*
