idx = open('/home/user/workspace/fa-site/index.html').read()
fold = open('/home/user/workspace/fa-site/_partials/mapstr-fold.html').read()

# 1) add stylesheet link after fa.css
assert '<link rel="stylesheet" href="css/fa.css">' in idx
idx = idx.replace('<link rel="stylesheet" href="css/fa.css">',
                  '<link rel="stylesheet" href="css/fa.css">\n<link rel="stylesheet" href="css/mapstr.css">', 1)

# 2) insert fold between courses section end and How It Works
marker = '<!-- ===== HOW IT WORKS (5-step LMS journey, maintained from old site) ===== -->'
assert marker in idx
idx = idx.replace(marker, fold + '\n' + marker, 1)

# 3) add script before fa.js script (fa.js handles [data-advisor]; load mapstr after)
assert '<script src="js/fa.js"></script>' in idx
idx = idx.replace('<script src="js/fa.js"></script>',
                  '<script src="js/fa.js"></script>\n<script src="js/mapstr.js" defer></script>', 1)

open('/home/user/workspace/fa-site/index.html','w').write(idx)
print("embedded. new index size:", len(idx))
