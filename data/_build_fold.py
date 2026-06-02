#!/usr/bin/env python3
import json, math, html as htmlmod

d = json.load(open('/home/user/workspace/fa-site/data/courses_geo.json'))
courses = d['courses']
TAGLINE = d['tagline']
BRAND_MAPSTR = d['brand_mapstr']

# ---- projection (same as _project_pins.py) ----
LON_MIN, LON_MAX = -4.8, 8.3
LAT_MIN, LAT_MAX = 42.2, 51.1
X0, X1 = 95, 905
Y0, Y1 = 110, 900
def proj(lat, lng):
    x = X0 + (lng - LON_MIN)/(LON_MAX - LON_MIN)*(X1-X0)
    y = Y0 + (LAT_MAX - lat)/(LAT_MAX - LAT_MIN)*(Y1-Y0)
    return round(x,1), round(y,1)

# Journey order = order in JSON (FA Foundation->Intermediate, then LSF trio)
pins = []
for c in courses:
    x,y = proj(c['pin']['lat'], c['pin']['lng'])
    pins.append((x,y))

# ---- smooth route through pins (Catmull-Rom -> cubic bezier) ----
def catmull_rom(points, samples=24):
    pts = [points[0]] + list(points) + [points[-1]]
    out = []
    for i in range(1, len(pts)-2):
        p0,p1,p2,p3 = pts[i-1],pts[i],pts[i+1],pts[i+2]
        for t in range(samples+1):
            tt=t/samples
            t2=tt*tt; t3=t2*tt
            x=0.5*((2*p1[0])+(-p0[0]+p2[0])*tt+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3)
            y=0.5*((2*p1[1])+(-p0[1]+p2[1])*tt+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)
            out.append((round(x,1),round(y,1)))
    return out

route_pts = catmull_rom(pins, samples=22)
route_d = "M " + " L ".join(f"{x},{y}" for x,y in route_pts)

# segment boundary index in route_pts for each course pin (so JS can draw per chapter)
# each segment between pin i and i+1 spans (samples) points
SAMPLES=22
seg_index = [i*SAMPLES for i in range(len(pins))]  # index of each pin within route_pts

# ---- decorative satellite stop pins around each main pin ----
# deterministic offsets so each course gets 2-3 small "stop" dots near its anchor
def satellites(cx, cy, n, seed):
    out=[]
    rng = (seed*9301+49297)
    for k in range(n):
        rng = (rng*9301+49297) % 233280
        ang = (rng/233280.0)*2*math.pi + k*2.1
        rad = 26 + (k*11) + (rng%18)
        out.append((round(cx+math.cos(ang)*rad,1), round(cy+math.sin(ang)*rad,1)))
    return out

def esc(s): return htmlmod.escape(str(s), quote=True)

# ---------- Build chapter rail ----------
rail = []
for i,c in enumerate(courses):
    rail.append(
f'''      <button class="mp-stop" data-stop="{i}" data-course="{c['id']}" type="button" aria-label="Go to chapter {i+1}: {esc(c['name'])}, {esc(c['region'])}">
        <span class="mp-stop-dot"></span>
        <span class="mp-stop-idx">{i+1:02d}</span>
        <span class="mp-stop-tt"><span class="mp-stop-name">{esc(c['name'])}</span><span class="mp-stop-reg">{esc(c['region'])}</span></span>
      </button>''')
rail_html = "\n".join(rail)

# ---------- Build POI groups (main + satellites) ----------
poi_groups = []
for i,c in enumerate(courses):
    cx,cy = pins[i]
    sats = satellites(cx,cy, min(3, max(2, len(c['anchors'])//5)), seed=i+3)
    sat_svg = "\n".join(
        f'    <circle class="mp-poi-sat" cx="{sx}" cy="{sy}" r="3.4"/>' for sx,sy in sats)
    # label anchor side: left half -> end, right -> start
    side = "start" if cx < 760 else "end"
    lx = cx + (16 if side=="start" else -16)
    ly = cy - 14
    poi_groups.append(
f'''  <g class="mp-poi" data-poi="{i}" data-course="{c['id']}" data-idx="{i}">
{sat_svg}
    <circle class="mp-poi-pulse" cx="{cx}" cy="{cy}" r="10"/>
    <circle class="mp-poi-ring"  cx="{cx}" cy="{cy}" r="16"/>
    <circle class="mp-poi-core"  cx="{cx}" cy="{cy}" r="6.5"/>
    <text class="mp-poi-label" x="{lx}" y="{ly}" text-anchor="{side}">{esc(c['pin']['city'])}</text>
  </g>''')
poi_html = "\n".join(poi_groups)

# ---------- Build story cards ----------
def level_badge(c): return esc(c['level'])
def stops_list(c, n=4):
    items = c['anchors'][:n]
    return "".join(f'<li>{esc(a)}</li>' for a in items)

cards=[]
for i,c in enumerate(courses):
    track_tag = esc(c['track'])
    sig=""
    if c.get('signature_unit'):
        su=c['signature_unit']
        sig=f'''
        <a class="mp-card-sig" href="{esc(su['deck'])}" target="_blank" rel="noopener" data-course="{c['id']}">
          <span class="mp-card-sig-ey">Signature unit · {esc(su['code'])}</span>
          <span class="mp-card-sig-tt">{esc(su['title'])}</span>
          <span class="mp-card-sig-open">Opens up the lesson<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        </a>'''
    newbadge = '<span class="mp-card-new">New</span>' if c.get('new') else ''
    speak = '<span class="mp-card-speak">Live speaking</span>' if c.get('speaking_focus') else ''
    cards.append(
f'''    <article class="mp-card" data-card="{i}" data-course="{c['id']}" aria-hidden="true">
      <div class="mp-card-head">
        <span class="mp-card-track">{track_tag}{newbadge}{speak}</span>
        <span class="mp-card-lvl">{level_badge(c)}</span>
      </div>
      <h3 class="mp-card-name">{esc(c['name'])}</h3>
      <p class="mp-card-region"><span class="mp-card-reg-rule"></span>{esc(c['region'])} · {c['units']} units</p>
      <p class="mp-card-journey">{esc(c['journey'])}</p>
      <div class="mp-card-stops">
        <span class="mp-card-stops-ey">Real places you'll learn in</span>
        <ul>{stops_list(c)}</ul>
      </div>
      <p class="mp-card-outcome"><span>You'll be able to</span> {esc(c['outcome'])}</p>{sig}
      <div class="mp-card-cta">
        <a class="mp-card-btn" href="courses/{c['id']}.html" data-course="{c['id']}">Explore this journey
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
        <a class="mp-card-syl" href="downloads/{c['id']}-syllabus.pdf" target="_blank" rel="noopener">Download syllabus</a>
      </div>
    </article>''')
cards_html = "\n".join(cards)

# ---------- Mobile accordion ----------
macc=[]
for i,c in enumerate(courses):
    open_cls = " is-open" if i==0 else ""
    exp = "true" if i==0 else "false"
    sig=""
    if c.get('signature_unit'):
        su=c['signature_unit']
        sig=f'''<a class="mp-m-sig" href="{esc(su['deck'])}" target="_blank" rel="noopener">Signature unit {esc(su['code'])} · {esc(su['title'])} ↗</a>'''
    newbadge = '<span class="mp-card-new">New</span>' if c.get('new') else ''
    macc.append(
f'''      <div class="mp-m-stop{open_cls}" data-mstop="{i}" data-course="{c['id']}">
        <button class="mp-m-head" type="button" aria-expanded="{exp}" aria-controls="mp-mbody-{i}">
          <span class="mp-m-idx">{i+1:02d}</span>
          <span class="mp-m-tt">
            <span class="mp-m-name">{esc(c['name'])}{newbadge}</span>
            <span class="mp-m-reg">{esc(c['region'])} · {esc(c['level'])}</span>
          </span>
          <svg class="mp-m-chev" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="mp-m-body" id="mp-mbody-{i}" role="region">
          <div class="mp-m-inner"><div class="mp-m-pad">
            <p class="mp-m-journey">{esc(c['journey'])}</p>
            <ul class="mp-m-stops">{stops_list(c,4)}</ul>
            <p class="mp-m-outcome">{esc(c['outcome'])}</p>
            {sig}
            <div class="mp-m-cta">
              <a class="mp-card-btn" href="courses/{c['id']}.html">Explore<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
              <a class="mp-card-syl" href="downloads/{c['id']}-syllabus.pdf" target="_blank" rel="noopener">Syllabus</a>
            </div>
          </div></div>
        </div>
      </div>''')
macc_html="\n".join(macc)

# land path
LAND = "M 542.6,81.3 L 492.4,89.0 L 399.2,209.5 L 279.5,211.4 L 313.3,243.2 L 258.4,310.6 L 203.5,325.1 L 70.0,334.7 L 100.4,392.5 L 227.3,443.6 L 306.6,537.1 L 303.3,609.3 L 299.4,715.3 L 283.5,817.5 L 337.1,862.8 L 429.6,884.9 L 481.8,910.0 L 561.8,918.7 L 587.6,853.1 L 653.7,802.1 L 706.6,813.6 L 740.9,826.2 L 793.2,843.5 L 853.3,802.1 L 883.1,779.9 L 839.4,724.0 L 851.3,615.1 L 815.6,524.6 L 789.2,440.7 L 887.7,412.8 L 930.0,279.8 L 890.3,272.1 L 806.4,232.6 L 771.4,223.9 L 665.6,154.5 L 628.6,147.8 L 542.6,81.3 Z"

# expose data for JS as inline JSON (camera targets + seg indices)
cam = []
for i,c in enumerate(courses):
    cx,cy = pins[i]
    cam.append({"id":c['id'],"x":cx,"y":cy,"seg":seg_index[i],
                "accent":c['color']['accent'],"bg":c['color']['bg'],"tint":c['color']['tint'],
                "zoom": 2.05 if c['region'] in ("Paris",) else 1.85})
JS_DATA = json.dumps({"pins":[{"x":x,"y":y} for x,y in pins],
                      "seg":seg_index,"total":len(route_pts),
                      "cam":cam}, separators=(',',':'))

# ---------- assemble fold ----------
mapsvg = f'''<svg viewBox="0 0 1000 1000" class="mp-svg" role="img" aria-label="Stylised map of France tracing the student journey across real French places">
  <defs>
    <radialGradient id="mp-sea" cx="50%" cy="38%" r="75%">
      <stop offset="0%" stop-color="#FFFDF8"/>
      <stop offset="100%" stop-color="#F1E7D6"/>
    </radialGradient>
    <filter id="mp-soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6"/>
    </filter>
  </defs>
  <g class="mp-grid" aria-hidden="true">
    <line x1="150" y1="60" x2="150" y2="940"/><line x1="300" y1="60" x2="300" y2="940"/><line x1="450" y1="60" x2="450" y2="940"/><line x1="600" y1="60" x2="600" y2="940"/><line x1="750" y1="60" x2="750" y2="940"/><line x1="850" y1="60" x2="850" y2="940"/>
    <line x1="60" y1="150" x2="940" y2="150"/><line x1="60" y1="300" x2="940" y2="300"/><line x1="60" y1="450" x2="940" y2="450"/><line x1="60" y1="600" x2="940" y2="600"/><line x1="60" y1="750" x2="940" y2="750"/><line x1="60" y1="900" x2="940" y2="900"/>
  </g>
  <ellipse class="mp-region-glow" data-glow cx="534" cy="309" rx="120" ry="120"/>
  <path class="mp-land" d="{LAND}"/>
  <path class="mp-route-bg" d="{route_d}"/>
  <path class="mp-route" data-route d="{route_d}"/>
  <g class="mp-comet" data-comet aria-hidden="true">
    <circle class="mp-comet-glow" r="11"/>
    <circle class="mp-comet-core" r="4.5"/>
  </g>
{poi_html}
</svg>'''

fold = f'''<!-- ============================================================
     MAPSTR SIGNATURE FOLD — "French is learned where it is lived"
     The real pedagogy: every course is a journey across real French
     places; every unit anchors to a real landmark that opens up.
     Data spine: data/courses_geo.json  ·  Styles: css/mapstr.css  ·  Logic: js/mapstr.js
     ============================================================ -->
<section class="mp-fold" id="mapstr" aria-labelledby="mp-title" data-mp data-mp-json='{JS_DATA}'>

  <!-- Intro -->
  <div class="mp-intro neon-splash reveal">
    <span class="mp-kicker"><span class="mp-kicker-rule"></span>The French Atelier · Mapstr</span>
    <h2 class="mp-title" id="mp-title">French is learned <em>where it is lived</em></h2>
    <p class="mp-lede">In the street, at the counter, in the queue, on the quay. Every course is a real journey across France — and every unit opens up at a real place. Scroll to travel the route, from your first <em>bonjour</em> in Paris to fluent conversation across the regions.</p>
    <span class="mp-scrollcue" aria-hidden="true">Begin the journey
      <svg width="16" height="24" viewBox="0 0 16 24" fill="none"><rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" stroke-opacity=".5"/><circle class="mp-scrollcue-dot" cx="8" cy="7" r="2" fill="currentColor"/></svg>
    </span>
  </div>

  <!-- ===== Desktop scroll-pinned stage ===== -->
  <div class="mp-scroller" data-scroller>
    <div class="mp-sticky">
      <div class="mp-stage">

        <!-- chapter rail -->
        <nav class="mp-rail" aria-label="Course journeys">
          <div class="mp-rail-head">The Route · A0 → A2.2</div>
{rail_html}
          <div class="mp-rail-foot">
            <span class="mp-rail-loop">Language → culture → real places → back to language</span>
          </div>
        </nav>

        <!-- map -->
        <div class="mp-mapwrap">
          <div class="mp-viewport">
            <div class="mp-camera" data-camera>
              <div class="mp-map">
                {mapsvg}
              </div>
            </div>
          </div>

          <!-- progress meter -->
          <div class="mp-meter" aria-hidden="true">
            <span>A0</span>
            <span class="mp-meter-track"><span class="mp-meter-fill" data-meter></span></span>
            <span class="mp-meter-end">A2.2</span>
          </div>
        </div>

        <!-- pinned story cards (one shown at a time, colored per course) -->
        <div class="mp-cards" data-cards>
{cards_html}
        </div>

      </div>
    </div>

    <!-- scroll panels: one per course chapter (drive the pin/camera/card) -->
    <div class="mp-panels" aria-hidden="true">
{''.join(f'      <div class="mp-panel" data-panel="{i}"></div>\n' for i in range(len(courses)))}    </div>
  </div>

  <!-- ===== Mobile tap-driven accordion ===== -->
  <div class="mp-mobile">
    <div class="mp-m-map" aria-hidden="true">
      <svg viewBox="0 0 1000 1000" class="mp-svg" role="img" aria-label="Map of France with course regions">
        <g class="mp-grid"><line x1="300" y1="60" x2="300" y2="940"/><line x1="600" y1="60" x2="600" y2="940"/><line x1="60" y1="300" x2="940" y2="300"/><line x1="60" y1="600" x2="940" y2="600"/></g>
        <path class="mp-land" d="{LAND}"/>
        <path class="mp-route-bg" d="{route_d}"/>
{poi_html}
      </svg>
    </div>
    <div class="mp-m-list" data-maccordion>
{macc_html}
    </div>
  </div>

  <!-- ===== Finale ===== -->
  <div class="mp-finale neon-splash reveal">
    <svg class="mp-finale-mark" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="1.3"/>
      <path d="M32 11 L36 28 L53 32 L36 36 L32 53 L28 36 L11 32 L28 28 Z" fill="currentColor"/>
      <circle cx="32" cy="32" r="4.5" fill="var(--paper)"/>
    </svg>
    <h3>The route ends where <em>real conversation begins</em></h3>
    <p>Seven courses. One living map of France. From the Eiffel Tower to the quays of Bordeaux, the Calanques of Marseille and the markets of Strasbourg — your French is learned in the places where it is spoken. Plan your journey with an advisor, or wander the 181 real places we teach from.</p>
    <div class="mp-finale-cta">
      <button class="mp-cta" type="button" data-advisor>
        Talk to an Advisor
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <a class="mp-cta-ghost" href="{esc(BRAND_MAPSTR)}" target="_blank" rel="noopener">
        Our Mapstr · 181 places
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
    </div>
  </div>

</section>
'''

open('/home/user/workspace/fa-site/_partials/mapstr-fold.html','w').write(fold)
print("WROTE fold:", len(fold), "bytes")
print("route points:", len(route_pts), "seg idx:", seg_index)
for c in cam: print(c['id'], c['x'], c['y'], "accent", c['accent'])
