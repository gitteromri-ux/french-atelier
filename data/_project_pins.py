import json
d = json.load(open('/home/user/workspace/fa-site/data/courses_geo.json'))

# France mainland bounds roughly. The existing mp-land path uses a 1000x1000 viewBox.
# Calibrate projection so known cities land on the existing land shape.
# Paris (48.8584, 2.2945) should be ~ (541, 291) per old POI for "paris".
# We'll fit a simple linear lon->x, lat->y using France extent.
# lon range ~ -4.8 (Brittany/Atlantic) .. 8.2 (Alsace); lat ~ 42.3 (south) .. 51.1 (north)
LON_MIN, LON_MAX = -4.8, 8.3
LAT_MIN, LAT_MAX = 42.2, 51.1
# x maps lon; y maps lat inverted. Fit to land bbox in viewBox ~ x:70..930, y:81..918
X0, X1 = 95, 905
Y0, Y1 = 110, 900

def proj(lat, lng):
    x = X0 + (lng - LON_MIN)/(LON_MAX - LON_MIN)*(X1-X0)
    y = Y0 + (LAT_MAX - lat)/(LAT_MAX - LAT_MIN)*(Y1-Y0)
    return round(x,1), round(y,1)

for c in d['courses']:
    p = c['pin']
    x,y = proj(p['lat'], p['lng'])
    print(f"{c['id']:16s} {p['city']:22s} {x:6.1f},{y:6.1f}")
