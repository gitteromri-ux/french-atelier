import re
idx = open('/home/user/workspace/fa-site/index.html').read()
fold = open('/home/user/workspace/fa-site/_partials/mapstr-fold.html').read()

# Replace existing fold section (from the build comment to </section> of mp-fold)
start_marker = '<!-- ============================================================\n     MAPSTR SIGNATURE FOLD'
# find start
si = idx.find(start_marker)
assert si != -1, "fold start not found"
# the fold ends with the mp-fold </section>; find first '</section>' after the data-mp opening that closes mp-fold.
# Simpler: fold file ends with '</section>\n'. Find the closing right before HOW IT WORKS marker.
how = idx.find('<!-- ===== HOW IT WORKS', si)
assert how != -1
# everything between si and how is the old fold (+ trailing newlines)
idx = idx[:si] + fold.rstrip() + '\n\n' + idx[how:]
open('/home/user/workspace/fa-site/index.html','w').write(idx)
print("re-embedded. size", len(idx))
print("viewport present:", idx.count('mp-viewport'))
print("data-mp count:", idx.count('data-mp '))
