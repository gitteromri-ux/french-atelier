import json
g=json.load(open("/home/user/workspace/fa-site/_partials/map_geo.json"))
r=json.load(open("/home/user/workspace/fa-site/_partials/route.json"))
land=g["path"]; route=r["route_d"]; C=g["cities"]

# Stop data: place label, teacher name+city, pillar (verbatim label), level chip, 3 verbatim pillar bullets
# Bullets are VERBATIM from MASTER_BUILD_BRIEF pillar lists. No invented copy.
STOPS=[
 dict(id="paris", city="paris", place="Paris", teacher="Carmèle", region="Paris",
      img="assets/teachers/carmele.png", pillar="Art &amp; Architecture", lvl="A0 · Bonjour",
      bul=["Explore Haussmannian vs. medieval styles","Decode city layout and arrondissements","Notre-Dame as cultural conversation point"]),
 dict(id="paris", city="paris", place="Paris", teacher="Charline", region="Paris",
      img="assets/teachers/charline.jpg", pillar="Fashion and Film", lvl="A1 · Premiers mots",
      bul=["Express style through comparisons","Learn color and material vocabulary","Decode elegance through language choices"]),
 dict(id="westparis", city="westparis", place="West Paris", teacher="Philippe", region="West Paris",
      img="assets/teachers/philippe.jpg", pillar="Music &amp; Poetry", lvl="A2 · Trouver sa voix",
      bul=["Celebrate La Fête de la Musique","Use jouer and time expressions","Connect rhythm and French grammar"]),
 dict(id="strasbourg", city="strasbourg", place="Strasbourg", teacher="Caitlin", region="Strasbourg",
      img="assets/teachers/caitlin.jpg", pillar="Tradition &amp; History", lvl="B1 · Conversations",
      bul=["Explore Bastille Day symbolism","Practice tu vs. vous respectfully","Engage with history through language"]),
 dict(id="lyon", city="lyon", place="Lyon", teacher="Iris", region="Lyon",
      img="assets/teachers/iris.png", pillar="Gastronomy &amp; Wine", lvl="B1 · À table",
      bul=["Experience the apéritif ritual","Learn to order like locals","Discover regional bars and bistros"]),
 dict(id="pau", city="pau", place="Pau", teacher="Corentin", region="Pau",
      img="assets/teachers/corentin.png", pillar="Travel &amp; Landmarks", lvl="B2 · En route",
      bul=["Use maps and directions daily","Link verbs to real locations","Navigate Left Bank and Right"]),
 dict(id="montpellier", city="montpellier", place="Montpellier", teacher="Shanice", region="Montpellier",
      img="assets/teachers/shanice.png", pillar="Real-life French", lvl="B2 · Au quotidien",
      bul=["Order confidently at cafés or markets","Speak fluently in everyday settings","Debate opinions politely"]),
 dict(id="nice", city="nice", place="Nice", teacher="Stan", region="Nice",
      img="assets/teachers/stan.png", pillar="Fluency", lvl="C1 · Maîtrise",
      bul=["Listen to French podcasts","Use idiomatic phrases","Speak fluently in everyday and formal settings"]),
]

# region glow ellipses approx per region (cx,cy,rx,ry) for halo
GLOW={k:(v[0],v[1],90,90) for k,v in C.items()}

def poi_svg():
    s=""
    # region glows
    for st in STOPS:
        x,y=C[st["city"]]
    seen=set()
    for st in STOPS:
        cid=st["city"]
        if cid in seen: continue
        seen.add(cid)
        x,y=C[cid]
        s+=f'<ellipse class="mp-region-glow" data-glow="{cid}" cx="{x}" cy="{y}" rx="95" ry="95"/>\n'
    return s

def poi_markers():
    s=""
    seen=set()
    for i,st in enumerate(STOPS):
        cid=st["city"]
        if cid in seen: continue
        seen.add(cid)
        x,y=C[cid]
        lbl=st["place"]
        # bespoke label placement to avoid collisions (Paris/West Paris are close)
        place={
          "paris":      (18, -10, "start"),
          "westparis":  (-16, 22, "end"),
          "strasbourg": (-14, 4, "end"),
          "lyon":       (16, 4, "start"),
          "pau":        (16, 4, "start"),
          "montpellier":(16, 16, "start"),
          "nice":       (-14, -8, "end"),
        }
        dx,dy,anchor=place.get(cid,(16,4,"start"))
        s+=f'''<g class="mp-poi" data-poi="{cid}" data-idx="{i}">
  <circle class="mp-poi-pulse" cx="{x}" cy="{y}" r="9"/>
  <circle class="mp-poi-ring" cx="{x}" cy="{y}" r="15"/>
  <circle class="mp-poi-core" cx="{x}" cy="{y}" r="6"/>
  <text class="mp-poi-label" x="{x+dx}" y="{y+dy}" text-anchor="{anchor}">{lbl}</text>
</g>\n'''
    return s

def rail():
    s=""
    for i,st in enumerate(STOPS):
        label = f'{st["teacher"]} · {st["place"]}'
        s+=f'''<button class="mp-stop" data-stop="{i}" type="button" aria-label="Go to stop {i+1}: {st["teacher"]} in {st["place"]}">
  <span class="mp-stop-dot"></span>
  <span class="mp-stop-idx">{i+1:02d}</span>
  <span>{label}</span>
</button>\n'''
    return s

def cards():
    s=""
    for i,st in enumerate(STOPS):
        bullets="".join(f"<li>{b}</li>" for b in st["bul"])
        s+=f'''<article class="mp-card" data-card="{i}">
  <div class="mp-card-top">
    <img class="mp-card-portrait" src="{st['img']}" alt="{st['teacher']}, native French teacher in {st['place']}" loading="lazy">
    <div class="mp-card-meta">
      <span class="mp-card-place">{st['place']}, France</span>
      <span class="mp-card-teacher">{st['teacher']} <span>· live from France</span></span>
    </div>
  </div>
  <span class="mp-card-lvl">{st['lvl']}</span>
  <div class="mp-card-pillar">{st['pillar']}</div>
  <ul>{bullets}</ul>
</article>\n'''
    return s

def mobile():
    s=""
    for i,st in enumerate(STOPS):
        x,y=C[st["city"]]
        bullets="".join(f"<li>{b}</li>" for b in st["bul"])
        opn=" is-open" if i==0 else ""
        s+=f'''<button class="mp-m-stop{opn}" data-mstop="{i}" data-city="{st['city']}" type="button" aria-expanded="{'true' if i==0 else 'false'}">
  <div class="mp-m-stophead">
    <span class="mp-m-idx">{i+1:02d}</span>
    <img class="mp-m-portrait" src="{st['img']}" alt="{st['teacher']}" loading="lazy">
    <div class="mp-m-tt">
      <span class="mp-m-place">{st['place']} · {st['pillar']}</span>
      <span class="mp-m-teacher">{st['teacher']}</span>
    </div>
    <svg class="mp-m-chev" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </div>
  <div class="mp-m-body"><div>
    <span class="mp-m-lvl">{st['lvl']}</span>
    <div class="mp-m-pillar">{st['pillar']}</div>
    <ul>{bullets}</ul>
  </div></div>
</button>\n'''
    return s

GRID=""
# graticule lines
for gx in range(150,950,150):
    GRID+=f'<line x1="{gx}" y1="60" x2="{gx}" y2="940"/>'
for gy in range(150,950,150):
    GRID+=f'<line x1="60" y1="{gy}" x2="940" y2="{gy}"/>'

LOGO_MARK='''<svg class="mp-finale-mark" viewBox="0 0 64 64" fill="none" aria-hidden="true">
  <circle cx="32" cy="32" r="30" stroke="#C8A560" stroke-width="1.5"/>
  <path d="M32 8 L37 27 L56 32 L37 37 L32 56 L27 37 L8 32 L27 27 Z" fill="#C8A560"/>
  <circle cx="32" cy="32" r="5" fill="#0B1340"/>
</svg>'''

html=f'''<!-- ============================================================
     MAPSTR SIGNATURE FOLD — "Your Authentic French Journey to Fluency"
     Self-contained. Link: css/mapstr.css  +  js/mapstr.js
     ============================================================ -->
<section class="mp-fold" id="mapstr" aria-labelledby="mp-title">

  <!-- Intro -->
  <div class="mp-intro">
    <span class="mp-kicker">An Interactive Map of France</span>
    <h2 class="mp-title" id="mp-title">Your Authentic French Journey <em>to Fluency</em></h2>
    <p class="mp-lede">Trace a living route across real French places — from your first <em>bonjour</em> to true fluency. Each stop pairs a culture pillar with the native teacher who guides you there, live from France.</p>
    <span class="mp-scrollcue" aria-hidden="true">Scroll to begin
      <svg width="16" height="22" viewBox="0 0 16 22" fill="none"><rect x="1" y="1" width="14" height="20" rx="7" stroke="#C8A560" stroke-opacity=".5"/><circle cx="8" cy="7" r="2" fill="#C8A560"/></svg>
    </span>
  </div>

  <!-- ===== Desktop scroll-pinned stage ===== -->
  <div class="mp-scroller" data-scroller>
    <div class="mp-stage">
      <!-- chapter rail -->
      <nav class="mp-rail" aria-label="Journey stops">
        <div class="mp-rail-head">The Route · A0 → Fluency</div>
        {rail()}
      </nav>

      <!-- map -->
      <div class="mp-mapwrap">
        <div class="mp-camera" data-camera>
          <div class="mp-map">
            <svg viewBox="0 0 1000 1000" role="img" aria-label="Stylised map of France with the journey route and teacher cities">
              <g class="mp-grid">{GRID}</g>
              {poi_svg()}
              <path class="mp-land" d="{land}"/>
              <path class="mp-route-bg" d="{route}"/>
              <path class="mp-route" data-route d="{route}"/>
              <g data-comet>
                <circle class="mp-comet-glow" r="9"/>
                <circle class="mp-comet" r="4"/>
              </g>
              {poi_markers()}
            </svg>
          </div>
        </div>

        <!-- progress meter -->
        <div class="mp-meter" aria-hidden="true">
          <span>A0</span>
          <span class="mp-meter-track"><span class="mp-meter-fill" data-meter></span></span>
          <span class="mp-meter-end">Fluency</span>
        </div>

        <!-- pinned story cards -->
        <div class="mp-cards">
          {cards()}
        </div>
      </div>
    </div>
  </div>

  <!-- ===== Mobile tap-driven list ===== -->
  <div class="mp-mobile">
    <div class="mp-m-map">
      <svg viewBox="0 0 1000 1000" role="img" aria-label="Map of France with teacher cities">
        <g class="mp-grid">{GRID}</g>
        {poi_svg()}
        <path class="mp-land" d="{land}"/>
        <path class="mp-route-bg" d="{route}"/>
        <path class="mp-route" data-mroute d="{route}"/>
        {poi_markers()}
      </svg>
    </div>
    <div class="mp-m-list">
      {mobile()}
    </div>
  </div>

  <!-- ===== Fluency destination + CTA ===== -->
  <div class="mp-finale reveal">
    {LOGO_MARK}
    <h3>Arrive at <em>Fluency</em></h3>
    <p>Eight regions. Six culture pillars. Native teachers, live from France. Your route ends where real conversation begins — start planning it with an advisor today.</p>
    <button class="mp-cta" type="button" data-advisor>
      Talk to an Advisor
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
  </div>

</section>
'''
open("/home/user/workspace/fa-site/_partials/mapstr-fold.html","w").write(html)
print("written",len(html),"bytes")
