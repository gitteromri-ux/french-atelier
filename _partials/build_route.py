import json
g=json.load(open("/home/user/workspace/fa-site/_partials/map_geo.json"))
c=g["cities"]
# Journey order (A0 -> Fluency)
order=["paris","paris2","westparis","strasbourg","lyon","pau","montpellier","nice"]
# paris2 same coords as paris but tiny offset so route nudges
pts=[
  ("start", (c["paris"][0]+26, c["paris"][1]-30)),  # A0 start NE of Paris, gentle approach
  ("paris", c["paris"]),
  ("westparis", (c["westparis"][0]-2, c["westparis"][1]+6)),
  ("strasbourg", c["strasbourg"]),
  ("lyon", c["lyon"]),
  ("pau", c["pau"]),
  ("montpellier", c["montpellier"]),
  ("nice", c["nice"]),
]
P=[p for _,p in pts]

def catmull_rom(P,seg=24):
    # returns smooth path string through points
    pts=[P[0]]+P+[P[-1]]
    d=f"M {P[0][0]},{P[0][1]} "
    for i in range(1,len(pts)-2):
        p0,p1,p2,p3=pts[i-1],pts[i],pts[i+1],pts[i+2]
        for t in range(1,seg+1):
            tt=t/seg
            t2=tt*tt;t3=t2*tt
            x=0.5*((2*p1[0])+(-p0[0]+p2[0])*tt+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3)
            y=0.5*((2*p1[1])+(-p0[1]+p2[1])*tt+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)
            d+=f"L {round(x,1)},{round(y,1)} "
    return d.strip()

route_d=catmull_rom(P)
out={"route_d":route_d,"order":[n for n,_ in pts],"city_pts":c}
json.dump(out,open("/home/user/workspace/fa-site/_partials/route.json","w"),indent=2)
print(route_d[:200],"...")
print("points:",[n for n,_ in pts])
