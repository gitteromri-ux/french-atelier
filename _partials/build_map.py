#!/usr/bin/env python3
"""Project real France outline + city lat/lon into a 1000x1000 SVG viewBox."""
import json

# Simplified but recognizable metropolitan France outline (lon,lat) — hexagon silhouette
# traced coarsely from real coastline/border vertices (clockwise from Dunkerque).
outline = [
    (2.37, 51.03),   # Dunkerque (north)
    (1.61, 50.95),   # Calais
    (0.20, 49.70),   # Le Havre area
    (-1.61, 49.68),  # Cherbourg (Cotentin tip)
    (-1.10, 49.35),
    (-1.93, 48.65),  # Mont St Michel bay
    (-2.76, 48.50),  # Brittany north
    (-4.78, 48.40),  # Brest (Finistère NW tip)
    (-4.32, 47.80),  # Brittany SW
    (-2.40, 47.27),  # St-Nazaire
    (-1.20, 46.30),  # La Rochelle
    (-1.25, 45.55),  # Gironde mouth
    (-1.31, 44.45),  # Arcachon
    (-1.55, 43.39),  # Biarritz / Atlantic SW corner
    (-0.74, 42.92),  # Pyrenees foothills
    (0.66, 42.69),   # Pyrenees crest
    (1.45, 42.43),   # Andorra area
    (2.66, 42.34),   # Perpignan / Med coast
    (3.05, 43.02),   # Narbonne
    (4.05, 43.55),   # Montpellier coast
    (4.85, 43.43),   # Camargue / Rhone mouth
    (5.37, 43.30),   # Marseille
    (6.16, 43.12),   # Toulon
    (7.07, 43.55),   # Cannes / Riviera
    (7.52, 43.78),   # Nice / Menton (SE corner)
    (6.86, 44.36),   # Alps
    (7.04, 45.49),   # Mont Blanc / Italy border
    (6.50, 46.43),   # Geneva area
    (6.10, 47.30),   # Jura
    (7.59, 47.59),   # Basel / Rhine corner (E)
    (8.23, 48.97),   # Rhine / Strasbourg E
    (7.63, 49.05),   # Saarland
    (6.36, 49.46),   # Luxembourg border
    (5.83, 49.55),   # Ardennes
    (4.23, 50.27),   # Belgium border
    (3.67, 50.34),   # Lille area
    (2.37, 51.03),   # back to Dunkerque
]

cities = {
    "strasbourg": (7.75, 48.58),
    "paris":      (2.35, 48.85),   # Carmèle + Charline (Paris)
    "westparis":  (1.90, 48.80),   # Philippe — West Paris (offset slightly W of Paris)
    "lyon":       (4.83, 45.76),
    "pau":        (-0.37, 43.30),
    "montpellier":(3.88, 43.61),
    "nice":       (7.27, 43.70),
}

# projection bounds
lons = [p[0] for p in outline]
lats = [p[1] for p in outline]
minlon, maxlon = min(lons), max(lons)
minlat, maxlat = min(lats), max(lats)

W, H = 1000, 1000
PAD = 70
# preserve aspect using a latitude-corrected scale (simple equirectangular w/ cos(meanlat))
import math
meanlat = math.radians((minlat+maxlat)/2)
sx = (maxlon-minlon)
sy = (maxlat-minlat)
# width in lon corrected
ar_lon = sx*math.cos(meanlat)
ar_lat = sy
scale = min((W-2*PAD)/ar_lon, (H-2*PAD)/ar_lat)

def project(lon, lat):
    x = PAD + (lon-minlon)*math.cos(meanlat)*scale
    # offset to center horizontally
    y = PAD + (maxlat-lat)*scale
    return round(x,1), round(y,1)

# center horizontally
maxx = max(project(p[0],p[1])[0] for p in outline)
minx = min(project(p[0],p[1])[0] for p in outline)
xoff = (W - (maxx-minx))/2 - minx
maxy = max(project(p[0],p[1])[1] for p in outline)
miny = min(project(p[0],p[1])[1] for p in outline)
yoff = (H - (maxy-miny))/2 - miny

def proj(lon,lat):
    x,y = project(lon,lat)
    return round(x+xoff,1), round(y+yoff,1)

pts = [proj(lon,lat) for lon,lat in outline]
d = "M " + " L ".join(f"{x},{y}" for x,y in pts) + " Z"

city_pts = {k: proj(lon,lat) for k,(lon,lat) in cities.items()}

print("PATH_D =", d)
print()
for k,v in city_pts.items():
    print(f"{k}: {v}")

out = {"path": d, "cities": city_pts, "viewBox": f"0 0 {W} {H}"}
with open("/home/user/workspace/fa-site/_partials/map_geo.json","w") as f:
    json.dump(out,f,indent=2)
