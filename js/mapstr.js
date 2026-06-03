/* ============================================================
   MAPSTR ENGINE — REAL interactive map of France (MapLibre GL JS)
   The French Atelier by Acadomia · dark-navy + gold luxury styling

   Self-contained: renders a genuine MapLibre raster map of France
   (CARTO dark-matter tiles, no API key), luxury numbered gold journey
   markers at REAL geographic coordinates, an animated gold route line,
   three FA journeys as toggle tabs, a glass info panel per stop, and a
   legend. Auto-mounts into the first #mapstr-mount on DOM ready.

   Public API:
     window.Mapstr.mount(target)   // selector or Element; default '#mapstr-mount'
     window.Mapstr.data            // the course/journey dataset
     returns { root, setJourney(id), openStop(id), closePanel() }
   ============================================================ */
(function () {
  'use strict';

  /* ---------- DATA (embedded from data/courses_geo.json) ---------- */
  var DATA = {
    tagline: "French is learned where it is lived — in the street, at the counter, in the queue, on the quay.",
    courses: [
      {
        id: "fa-foundation", name: "FA Foundation", level: "A0 → A1.1", shortLevel: "A0",
        region: "Paris", href: "courses/fa-foundation.html", color: "#C8A96B", routeColor: "#C8A96B",
        description: "Entirely in Paris. Learn to greet, order, ask directions, and pay — French lived at its source.",
        pins: [
          { id: "eiffel", city: "Paris — Tour Eiffel", lat: 48.8584, lng: 2.2945, location: "Eiffel Tower & Champ-de-Mars, 7e arrondissement", units: [{ num: 1, fr: "Se présenter", en: "Greet, exchange names, discover the cultural codes of first meetings in French. Use s'appeler and propose tu." }] },
          { id: "alma-cafe", city: "Paris — Alma Bridge", lat: 48.8630, lng: 2.3010, location: "Classic café near the Alma bridge, 8e arrondissement", units: [{ num: 3, fr: "Demander son chemin", en: "Use excusez-moi and c'est où ? to ask for directions. Understand left, right, straight on." }, { num: 4, fr: "Réparer + commander une boisson simple", en: "Signal a communication breakdown, ask for repetition or slower speech, and place a simple café order." }] },
          { id: "bakery-16", city: "Paris — Passy", lat: 48.8580, lng: 2.2780, location: "Boulangerie in the 16th arrondissement", units: [{ num: 2, fr: "Épeler & vérifier une information", en: "Ask how to spell a word, spell it back, and confirm or correct. Practice the French alphabet and phonetics." }] },
          { id: "bouillon-chartier", city: "Paris — Bouillon Chartier", lat: 48.8742, lng: 2.3460, location: "Bouillon Chartier, 9e arrondissement (Grands Boulevards)", units: [{ num: 5, fr: "Commander — Je voudrais… + c'est combien ?", en: "Order food and drinks using je voudrais, ask for the price, handle numbers 0–39. French restaurant culture." }, { num: 6, fr: "Commander — Autre chose ?", en: "Respond to Autre chose ? and C'est tout ?, add items to an order, practice numbers 40–69." }, { num: 10, fr: "Commander — Payer par carte", en: "Express hunger and thirst with j'ai faim / soif, place an order, and pay by card. Full café interaction." }] },
          { id: "palais-royal", city: "Paris — Palais-Royal", lat: 48.8638, lng: 2.3371, location: "Palais-Royal gardens & Tuileries, 1er arrondissement", units: [{ num: 7, fr: "Proposer une sortie simple", en: "Use être and the pronoun y to suggest an outing, accept or decline, and make a simple decision." }, { num: 8, fr: "Accepter / refuser + exprimer une préférence", en: "Use je préfère to choose between two options, accept or refuse politely, reach a clear decision." }] },
          { id: "pont-des-arts", city: "Paris — Pont des Arts", lat: 48.8584, lng: 2.3375, location: "Pont des Arts (Love Lock Bridge), 6e arrondissement", units: [{ num: 9, fr: "Échanger un numéro de téléphone", en: "Ask for and give a phone number, verify with c'est..., c'est ça ?, practice numbers 70–99." }] },
          { id: "pantheon", city: "Paris — Panthéon", lat: 48.8462, lng: 2.3510, location: "Panthéon, 5e arrondissement (Latin Quarter)", units: [{ num: 11, fr: "Acheter un billet / demander un prix", en: "Buy a ticket, ask for the price, and pay. Cultural role of museums and cultural venues in France." }] },
          { id: "jardin-luxembourg", city: "Paris — Jardin du Luxembourg", lat: 48.8462, lng: 2.3372, location: "Jardin du Luxembourg & Shakespeare & Co, 6e arrondissement", units: [{ num: 12, fr: "Donner / échanger email & adresse", en: "Exchange email addresses and street addresses using possessive adjectives mon, ma. Spell and confirm details." }, { num: 13, fr: "Parler de son origine / où on habite", en: "Use venir de and habiter à to talk about where you are from and where you live. Introduce a third person." }] },
          { id: "coulee-verte", city: "Paris — Coulée Verte", lat: 48.8488, lng: 2.3846, location: "Coulée Verte René-Dumont (elevated park), 12e arrondissement", units: [{ num: 14, fr: "Gérer un imprévu", en: "Handle an unexpected situation (a closed venue), propose an alternative plan, and make a decision." }, { num: 15, fr: "Fixer un rendez-vous (date / heure)", en: "Propose a time and date, negotiate with ça va ?, confirm and close. Tell the time and days of the week." }] },
          { id: "bastille", city: "Paris — Bastille", lat: 48.8533, lng: 2.3692, location: "Place de la Bastille, 11e/12e arrondissement", units: [{ num: 16, fr: "Commander — Réactivation", en: "Revisit ordering sequences at a faster pace: respond to Autre chose ? in three different ways." }, { num: 17, fr: "Commander — Je prends… + l'addition", en: "Use je prends, react to an unavailable item, and ask for the bill. Fluent end-to-end restaurant interaction." }] },
          { id: "montmartre", city: "Paris — Montmartre", lat: 48.8867, lng: 2.3431, location: "Montmartre & Place du Tertre, 18e arrondissement", units: [{ num: 18, fr: "Exprimer une préférence + justifier", en: "Choose between two options, say je préfère…, and justify with parce que c'est + adjectif." }] },
          { id: "canal-saint-martin", city: "Paris — Canal Saint-Martin", lat: 48.8695, lng: 2.3652, location: "Canal Saint-Martin, 10e arrondissement", units: [{ num: 19, fr: "Arrivée — Se présenter + orientation + réparation", en: "Chain two micro-tasks — introducing yourself and asking for directions — with repair if needed. Review of Units 1–3." }, { num: 20, fr: "Commander + payer + réparer + conclure", en: "Complete a full ordering and payment scenario at speed. Closing review of FA Foundation. A true production milestone." }] }
        ],
        routeOrder: ["eiffel", "bakery-16", "alma-cafe", "palais-royal", "bouillon-chartier", "pont-des-arts", "jardin-luxembourg", "pantheon", "coulee-verte", "bastille", "canal-saint-martin", "montmartre"]
      },
      {
        id: "fa-beginner", name: "FA Beginner", level: "A1.1 → A1.2", shortLevel: "A1.1",
        region: "Normandy → Paris & Versailles", href: "courses/fa-beginner.html", color: "#E8A87C", routeColor: "#E8A87C",
        description: "From the Normandy coast to Versailles and Paris. Family, weather, daily life, the market.",
        pins: [
          { id: "cabourg", city: "Cabourg", lat: 49.2836, lng: -0.1206, location: "Promenade Marcel Proust, Cabourg (Belle Époque seaside resort)", units: [{ num: 1, fr: "Se repérer : demander / indiquer une direction simple", en: "Ask for and give simple directions: pardon, où est... s'il vous plaît ? You tournez à gauche / à droite." }, { num: 2, fr: "Se présenter : profession, nationalité & tour de parole", en: "Introduce yourself beyond basics: profession with je suis + métier, nationality, and ask tu fais quoi ?" }] },
          { id: "honfleur", city: "Honfleur", lat: 49.4184, lng: 0.2333, location: "Vieux-Bassin (Old Harbour), Honfleur — where Champlain set sail for Québec", units: [{ num: 3, fr: "Dire où on est : se situer en temps réel", en: "Locate yourself using je suis là, devant…, juste en face de…, c'est à côté de…" }, { num: 4, fr: "Dire d'où on vient / où on habite + relancer", en: "Use je viens de… and j'habite à… to talk about origin and home, ask back with et toi ?" }] },
          { id: "deauville", city: "Deauville", lat: 49.3537, lng: 0.0707, location: "Les Planches boardwalk, Deauville (American Film Festival town)", units: [{ num: 5, fr: "Parler de sa famille + âge (avoir)", en: "Talk about family using avoir: say your age j'ai … ans, mention siblings, parents, and children." }, { num: 6, fr: "Saluer + prendre des nouvelles + clôturer (tu / vous)", en: "Use bonjour / bonsoir, ask ça va ?, respond naturally. Master the tu / vous distinction in context." }] },
          { id: "rouen", city: "Rouen", lat: 49.4432, lng: 1.0993, location: "Vieux-Marché & half-timbered streets, Rouen (Joan of Arc's city)", units: [{ num: 7, fr: "Demander poliment / s'excuser + réparer", en: "Use polite formulas and repair strategies: vous pouvez répéter ? / parler plus lentement ?" }, { num: 8, fr: "Localiser : dire où est… (c'est / il y a)", en: "Use c'est and il y a to describe location: give a street, number, and distances près d'ici / loin." }] },
          { id: "etretat", city: "Étretat", lat: 49.7070, lng: 0.2046, location: "Falaise d'Aval (chalk cliffs immortalised by Monet & Maupassant), Étretat", units: [{ num: 9, fr: "Décrire ce qu'on voit + donner un avis simple", en: "Describe three elements using c'est un/une…, il y a…, je vois… and express a simple opinion." }, { num: 13, fr: "Parler de la météo + réagir", en: "Ask and answer about the weather: il fait beau / froid / chaud, il pleut, predict with demain, il va faire…" }] },
          { id: "versailles", city: "Versailles", lat: 48.8049, lng: 2.1204, location: "Palace of Versailles & Hall of Mirrors, Versailles", units: [{ num: 10, fr: "Fixer une date / heure + parler de projets (futur proche)", en: "Give the date and day, talk about plans using demain, je vais… and cette semaine, je vais…" }, { num: 14, fr: "Choisir / proposer une activité selon la météo", en: "Based on the weather, suggest two activities: on va au parc / au cinéma / au château." }] },
          { id: "contrescarpe", city: "Paris — Place de la Contrescarpe", lat: 48.8508, lng: 2.3506, location: "Place de la Contrescarpe, 5e arrondissement (Hemingway's Paris)", units: [{ num: 11, fr: "Proposer une activité (14 juillet) + se mettre d'accord", en: "Suggest Bastille Day activities: on va voir le feu d'artifice / on va au bal, negotiate a time and confirm." }] },
          { id: "jardin-plantes", city: "Paris — Jardin des Plantes", lat: 48.8435, lng: 2.3595, location: "Jardin des Plantes & Seine quays, 5e arrondissement", units: [{ num: 12, fr: "Décrire ses routines + négation utile", en: "Talk about daily routine with reflexive verbs je me lève à… and negate habits je ne travaille pas le week-end." }, { num: 15, fr: "Parler d'activités (verbes en -ER) + organiser une sortie", en: "Use common -er verbs to describe leisure activities, plan a museum or expo outing, arrange a meeting point." }] },
          { id: "place-vosges", city: "Paris — Place des Vosges", lat: 48.8554, lng: 2.3644, location: "Place des Vosges & Musée Carnavalet, Marais, 4e arrondissement", units: [{ num: 16, fr: "Poser des questions avec « est-ce que » + mini-interview", en: "Form questions with est-ce que and conduct a short 5-question interview. Express degrees of opinion." }, { num: 17, fr: "Poser des questions (mots interrogatifs) + relancer", en: "Use question words qui, où, quand, pourquoi, comment to ask and answer in a flowing conversation." }] },
          { id: "train-bleu", city: "Paris — Gare de Lyon", lat: 48.8449, lng: 2.3739, location: "Le Train Bleu restaurant, Gare de Lyon, 12e arrondissement", units: [{ num: 18, fr: "Parler de ce qu'on mange / boit + préférences", en: "Discuss food and drink habits: je mange…, je bois…, offer or decline with tu en veux ? / oui, volontiers !" }] },
          { id: "marche-aligre", city: "Paris — Marché d'Aligre", lat: 48.8492, lng: 2.3779, location: "Marché d'Aligre, 12e arrondissement (Paris's liveliest outdoor market)", units: [{ num: 19, fr: "Acheter au marché : quantités + articles partitifs", en: "Buy produce at a French market using quantities un kilo de…, deux cents grammes de… and partitive articles." }, { num: 20, fr: "Parler de son expérience + dire au revoir (clôture FA1)", en: "Give a free 2–3 minute spoken account of your stay using at least 5 speech acts. A true production milestone." }] }
        ],
        routeOrder: ["cabourg", "honfleur", "deauville", "rouen", "etretat", "versailles", "contrescarpe", "jardin-plantes", "place-vosges", "train-bleu", "marche-aligre"]
      },
      {
        id: "fa-elementary", name: "FA Elementary", level: "A1.2 → A2.1", shortLevel: "A1.2",
        region: "Loire → Bordeaux → Basque", href: "courses/fa-elementary.html", color: "#D4A574", routeColor: "#D4A574",
        description: "Loire châteaux to Atlantic vineyards to Basque mountains. Chain, compare, narrate, describe.",
        pins: [
          { id: "orleans", city: "Orléans", lat: 47.9029, lng: 1.9092, location: "Place du Martroi, Orléans (City of Joan of Arc, gateway to the Loire)", units: [{ num: 1, fr: "Se présenter : saluer + dire qui on est", en: "Reactivate greetings at a higher level: moi, c'est… / je suis…, maintain tu / vous register, exchange identity info." }, { num: 2, fr: "Demander et donner une direction simple", en: "Ask with excusez-moi, pour aller à…, c'est par où ? and give itinerary: tout droit, puis à gauche." }] },
          { id: "villandry", city: "Villandry", lat: 47.3415, lng: 0.5144, location: "Jardins de Villandry (Renaissance gardens, UNESCO World Heritage)", units: [{ num: 3, fr: "Exprimer une préférence + justifier simplement", en: "Choose between two options, say je préfère… parce que c'est plus…, and agree on a destination." }] },
          { id: "chenonceau", city: "Château de Chenonceau", lat: 47.3238, lng: 1.0701, location: "Château de Chenonceau (the château of the ladies, spanning the Cher river)", units: [{ num: 4, fr: "Demander et indiquer une direction (reprise + pression)", en: "Ask for two different locations and give two complete directions. Practice at a faster pace." }, { num: 5, fr: "Proposer une mini-sortie + se mettre d'accord", en: "Plan a short outing: suggest a meeting point on se retrouve à…, sequence two activities, confirm ça marche !" }] },
          { id: "tours", city: "Tours", lat: 47.3941, lng: 0.6848, location: "Place Plumereau terraces & Loire guinguette, Tours", units: [{ num: 6, fr: "Commander au bar / restaurant (poliment)", en: "Order two items using je voudrais…, s'il vous plaît, respond to a follow-up, ask for l'addition." }, { num: 7, fr: "Partager + exprimer une quantité (pronom en)", en: "Offer and respond to sharing using the pronoun en. Practise expressing quantity in a natural food-sharing context." }] },
          { id: "poitiers", city: "Poitiers", lat: 46.5802, lng: 0.3404, location: "Parc de Blossac, Poitiers (elegant park, gateway to the south)", units: [{ num: 9, fr: "Comparer + justifier (parce que / mais)", en: "Compare two options using je préfère… parce que…, introduce nuance with mais l'autre option est plus…" }, { num: 10, fr: "Exprimer ses goûts + justifier", en: "Share a cultural preference using j'aime bien… parce que…, invite the other person et toi, tu préfères quoi ?" }] },
          { id: "bordeaux-wine", city: "Bordeaux — Wine District", lat: 44.8405, lng: -0.5805, location: "Bordeaux wine merchants & vineyards, Chartrons district", units: [{ num: 8, fr: "Recommander + exprimer une préférence", en: "Recommend a wine using je te conseille celui-là, ask tu préfères rouge ou blanc ? French wine culture." }] },
          { id: "cite-du-vin", city: "Bordeaux — Cité du Vin", lat: 44.8620, lng: -0.5545, location: "La Cité du Vin (the world's premier wine museum), Bordeaux", units: [{ num: 11, fr: "Proposer une sortie + se mettre d'accord", en: "Suggest a weekend outing: t'as envie de sortir ? on pourrait aller au musée ?, negotiate, fix time and place." }] },
          { id: "bordeaux-musee", city: "Bordeaux — Musée des Beaux-Arts", lat: 44.8387, lng: -0.5764, location: "Musée des Beaux-Arts de Bordeaux, Cours d'Albret", units: [{ num: 14, fr: "Décrire une œuvre + exprimer une préférence", en: "Describe a work of art c'est un tableau / une sculpture using two adjectives, express a preference." }, { num: 15, fr: "Présenter une œuvre (mini-exposé) + justifier", en: "Give a structured 30–45 second presentation: je vais vous parler de…, c'est une œuvre de…, ça a été créé en…" }] },
          { id: "dune-pilat", city: "Dune du Pilat", lat: 44.5893, lng: -1.2109, location: "Dune du Pilat (Europe's tallest sand dune, 110m, Atlantic coast)", units: [{ num: 12, fr: "Raconter un souvenir court (passé composé)", en: "Narrate a short memory using the passé composé: on a visité…, c'était top, j'ai adoré." }, { num: 13, fr: "Exprimer une opinion + justifier (accord / désaccord simple)", en: "Use je trouve que c'est… and pour moi… to share an opinion, agree or disagree simply." }] },
          { id: "gujan-mestras", city: "Gujan-Mestras", lat: 44.6384, lng: -1.0672, location: "Oyster ports of Gujan-Mestras, Bassin d'Arcachon", units: [{ num: 16, fr: "Organiser un parcours + se mettre d'accord", en: "Negotiate a visit itinerary: on commence par…, et ensuite…, asking for agreement t'es d'accord ?" }] },
          { id: "bayonne", city: "Bayonne", lat: 43.4929, lng: -1.4748, location: "Cathédrale Sainte-Marie & chocolate-makers of the old town, Bayonne", units: [{ num: 17, fr: "Raconter / imaginer (micro-récit)", en: "Narrate and imagine a scene using d'abord…, et ensuite…, à la fin… Produce a 4-sentence micro-narrative." }] },
          { id: "biarritz", city: "Biarritz", lat: 43.4832, lng: -1.5586, location: "Rocher de la Vierge, Biarritz (iconic Basque surf coast viewpoint)", units: [{ num: 18, fr: "Organiser une visite (heure / lieu / étapes) + valider", en: "Plan a full visit: agree on meeting point on se retrouve à… heures devant…, sequence three stages." }] },
          { id: "la-rhune", city: "La Rhune", lat: 43.3088, lng: -1.6353, location: "La Rhune (sacred Basque mountain, 905m, rack railway to the summit)", units: [{ num: 19, fr: "Micro-récit + réagir / relancer (pré-bilan)", en: "Narrate a recent outing in 4 sentences, express a nuanced reaction j'ai adoré / j'ai pas trop aimé." }] },
          { id: "saint-jean-luz", city: "Saint-Jean-de-Luz", lat: 43.3895, lng: -1.6612, location: "Harbour of Saint-Jean-de-Luz (where Louis XIV was married, final bay before Spain)", units: [{ num: 20, fr: "Consolider : défendre un choix + négocier + conclure", en: "Defend a choice: moi, je choisis… parce que…, propose an alternative on pourrait aussi…, close allez, c'est décidé !" }] }
        ],
        routeOrder: ["orleans", "villandry", "chenonceau", "tours", "poitiers", "bordeaux-wine", "cite-du-vin", "bordeaux-musee", "dune-pilat", "gujan-mestras", "bayonne", "biarritz", "la-rhune", "saint-jean-luz"]
      }
    ]
  };

  /* ---------- CONFIG ---------- */
  var GOLD = '#C8A96B';
  // CARTO "voyager" raster — a richer, more beautiful basemap with CLEAR,
  // legible city labels (Paris, Lyon, Bordeaux, Marseille, Strasbourg…).
  var VOYAGER_TILES = [
    'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
  ];
  var ATTRIB = '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>';
  var FRANCE_CENTER = [2.6, 46.4];
  var FRANCE_ZOOM = 5.25;
  var MAP_PITCH = 40;   // subtle 3D tilt for depth
  var MAP_BEARING = 0;  // no rotation — keeps the frame clean, tiles fully cover

  /* ---------- HELPERS ---------- */
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function courseById(id) {
    for (var i = 0; i < DATA.courses.length; i++) if (DATA.courses[i].id === id) return DATA.courses[i];
    return DATA.courses[0];
  }
  function pinById(course, id) {
    for (var i = 0; i < course.pins.length; i++) if (course.pins[i].id === id) return course.pins[i];
    return null;
  }
  function orderedPins(course) {
    return course.routeOrder.map(function (id) { return pinById(course, id); }).filter(Boolean);
  }

  /* ============================================================
     MOUNT
     ============================================================ */
  function mount(target) {
    var root = typeof target === 'string' ? document.querySelector(target)
      : (target || document.querySelector('#mapstr-mount'));
    if (!root) return null;
    if (root.getAttribute('data-mapstr-ready') === '1') return null;
    root.setAttribute('data-mapstr-ready', '1');

    var compact = root.hasAttribute('data-compact') || root.closest('#mapstr') != null && document.body.classList.contains('home');
    // Homepage uses #mapstr wrapper section; treat that as compact unless on map.html
    var isMapPage = /map\.html$/.test(location.pathname) || document.querySelector('.map-hero') != null;
    compact = !isMapPage;

    root.classList.add('ms-root');
    if (compact) root.classList.add('ms-compact');

    /* ----- Scaffold ----- */
    root.innerHTML = '';

    var shell = el('div', 'ms-shell');
    root.appendChild(shell);

    // Header (eyebrow + title + tagline)
    var head = el('div', 'ms-head');
    head.innerHTML =
      '<span class="ms-eyebrow">Interactive Map of France</span>' +
      '<h2 class="ms-title">Follow your <span class="ms-ital">journey</span> across France</h2>' +
      '<p class="ms-tagline">' + esc(DATA.tagline) + '</p>';
    shell.appendChild(head);

    // Tabs
    var tabs = el('div', 'ms-tabs');
    tabs.setAttribute('role', 'tablist');
    DATA.courses.forEach(function (c, i) {
      var t = el('button', 'ms-tab', '');
      t.type = 'button';
      t.setAttribute('role', 'tab');
      t.dataset.course = c.id;
      t.innerHTML = '<span class="ms-tab-level">' + esc(c.shortLevel) + '</span>' +
        '<span class="ms-tab-name">' + esc(c.name) + '</span>' +
        '<span class="ms-tab-region">' + esc(c.region) + '</span>';
      t.addEventListener('click', function () { setJourney(c.id, true); });
      tabs.appendChild(t);
    });
    shell.appendChild(tabs);

    // Map + panel stage
    var stage = el('div', 'ms-stage');
    var mapEl = el('div', 'ms-map');
    mapEl.id = 'ms-map-' + Math.random().toString(36).slice(2, 8);
    stage.appendChild(mapEl);

    // Legend
    var legend = el('div', 'ms-legend');
    stage.appendChild(legend);

    // Info panel (glass)
    var panel = el('aside', 'ms-panel');
    panel.setAttribute('aria-hidden', 'true');
    stage.appendChild(panel);

    shell.appendChild(stage);
    root.appendChild(shell);

    /* ----- State ----- */
    var map = null;
    var markers = [];
    var activeCourse = null;
    var ready = false;

    /* ----- MapLibre guard ----- */
    if (typeof maplibregl === 'undefined') {
      stage.classList.add('ms-noscript');
      mapEl.innerHTML = '<div class="ms-fallback"><p>The interactive map is loading…</p>' +
        '<p class="ms-fallback-sub">If it does not appear, please check your connection — the map of France loads from a map-tile service.</p></div>';
      // still render tabs/legend with data so structure is correct
      buildLegend(courseById(DATA.courses[0].id));
      activeCourse = courseById(DATA.courses[0].id);
      tabs.children[0].classList.add('active');
      return { root: root, setJourney: function () {}, openStop: function () {}, closePanel: function () {} };
    }

    /* ----- Build map ----- */
    var style = {
      version: 8,
      sources: {
        'carto-voyager': {
          type: 'raster',
          tiles: VOYAGER_TILES,
          tileSize: 256,
          attribution: ATTRIB
        }
      },
      layers: [
        { id: 'bg', type: 'background', paint: { 'background-color': '#0a1024' } },
        { id: 'carto-voyager', type: 'raster', source: 'carto-voyager',
          paint: { 'raster-opacity': 1, 'raster-saturation': -0.04, 'raster-contrast': 0.06 } }
      ]
    };

    map = new maplibregl.Map({
      container: mapEl.id,
      style: style,
      center: FRANCE_CENTER,
      zoom: compact ? FRANCE_ZOOM - 0.3 : FRANCE_ZOOM,
      pitch: MAP_PITCH,
      bearing: MAP_BEARING,
      minZoom: 4,
      maxZoom: 15,
      maxPitch: 70,
      attributionControl: false,
      cooperativeGestures: compact,
      dragRotate: true,
      pitchWithRotate: true
    });
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    map.addControl(new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }), 'top-right');

    map.on('load', function () {
      ready = true;
      // Route source/layers (initialised empty; filled by setJourney)
      map.addSource('ms-route', { type: 'geojson', data: emptyFC() });
      map.addSource('ms-route-anim', { type: 'geojson', data: emptyFC() });

      // Soft, wide aura beneath the path — gives a luxurious glow, NOT a hard line
      map.addLayer({
        id: 'ms-route-glow', type: 'line', source: 'ms-route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': GOLD, 'line-width': 18, 'line-opacity': 0.16, 'line-blur': 12 }
      });
      // Elegant dotted path: round caps + tight dasharray render as soft DOTS,
      // so it reads as a refined journey trail rather than a metro/train line.
      map.addLayer({
        id: 'ms-route-base', type: 'line', source: 'ms-route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#A9853F', 'line-width': 3.4, 'line-opacity': 0.7, 'line-dasharray': [0, 2.2] }
      });
      // A single gentle travelling dot of light that drifts along the trail
      map.addLayer({
        id: 'ms-route-anim', type: 'line', source: 'ms-route-anim',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#E9CF95', 'line-width': 6, 'line-opacity': 0.7, 'line-blur': 1.5 }
      });

      setJourney(DATA.courses[0].id, false);
    });

    map.on('error', function (e) { /* tile load errors are non-fatal */ });

    /* ----- GeoJSON helpers ----- */
    function emptyFC() { return { type: 'FeatureCollection', features: [] }; }
    function lineFeature(coords) {
      return { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: coords } }] };
    }

    /* ----- Route animation ----- */
    var animTimer = null;
    function animateRoute(coords) {
      if (animTimer) { clearInterval(animTimer); animTimer = null; }
      if (!coords || coords.length < 2) return;
      // densify into a polyline of points for a smooth trace
      var dense = densify(coords, 60);
      var win = Math.max(8, Math.round(dense.length * 0.08)); // short travelling window (a comet of light)
      var i = 0;
      var src = map.getSource('ms-route-anim');
      if (!src) return;
      animTimer = setInterval(function () {
        i += 1;
        if (i > dense.length + win) { i = 0; } // loop the glide
        var start = Math.max(0, i - win);
        var end = Math.min(dense.length, i);
        if (end - start < 2) { src.setData(emptyFC()); return; }
        src.setData(lineFeature(dense.slice(start, end)));
      }, 30);
    }
    function densify(coords, perSeg) {
      var out = [];
      for (var s = 0; s < coords.length - 1; s++) {
        var a = coords[s], b = coords[s + 1];
        for (var t = 0; t < perSeg; t++) {
          var f = t / perSeg;
          out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
        }
      }
      out.push(coords[coords.length - 1]);
      return out;
    }

    /* ----- Markers ----- */
    function clearMarkers() {
      markers.forEach(function (m) { m.remove(); });
      markers = [];
    }
    function buildMarkers(course) {
      clearMarkers();
      var pins = orderedPins(course);
      pins.forEach(function (p, idx) {
        var node = el('div', 'ms-marker');
        node.setAttribute('role', 'button');
        node.setAttribute('tabindex', '0');
        node.setAttribute('aria-label', p.city + ' — stop ' + (idx + 1));
        node.innerHTML =
          '<span class="ms-marker-pin">' +
            '<span class="ms-marker-num">' + (idx + 1) + '</span>' +
          '</span>' +
          '<span class="ms-marker-label">' + esc(p.city) + '</span>';
        node.addEventListener('click', function (ev) { ev.stopPropagation(); openStop(course, p, idx); });
        node.addEventListener('keydown', function (ev) {
          if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openStop(course, p, idx); }
        });
        var mk = new maplibregl.Marker({ element: node, anchor: 'bottom' })
          .setLngLat([p.lng, p.lat]).addTo(map);
        node._pinId = p.id;
        markers.push(mk);
      });
    }
    function highlightMarker(pinId) {
      markers.forEach(function (m) {
        var e = m.getElement();
        e.classList.toggle('active', e._pinId === pinId);
      });
    }

    /* ----- Legend ----- */
    function buildLegend(course) {
      legend.innerHTML =
        '<div class="ms-legend-row"><span class="ms-legend-dot"></span>' +
          '<span class="ms-legend-txt">' + esc(course.name) + ' &middot; ' + esc(course.level) + '</span></div>' +
        '<div class="ms-legend-row ms-legend-route"><span class="ms-legend-line"></span>' +
          '<span class="ms-legend-txt">Journey route &middot; ' + course.routeOrder.length + ' stops</span></div>' +
        '<div class="ms-legend-hint">Tap a numbered stop to open its lesson</div>';
    }

    /* ----- Info panel ----- */
    function openStop(course, p, idx) {
      var unitsHTML = p.units.map(function (u) {
        return '<li class="ms-unit">' +
          '<span class="ms-unit-num">Unit ' + u.num + '</span>' +
          '<h4 class="ms-unit-fr">' + esc(u.fr) + '</h4>' +
          '<p class="ms-unit-en">' + esc(u.en) + '</p>' +
        '</li>';
      }).join('');
      panel.innerHTML =
        '<button class="ms-panel-close" type="button" aria-label="Close">&times;</button>' +
        '<div class="ms-panel-head">' +
          '<span class="ms-panel-step">Stop ' + (idx + 1) + ' of ' + course.routeOrder.length + '</span>' +
          '<h3 class="ms-panel-city">' + esc(p.city) + '</h3>' +
          '<p class="ms-panel-loc">' + esc(p.location) + '</p>' +
        '</div>' +
        '<div class="ms-panel-course">' +
          '<span class="ms-panel-coursetag">' + esc(course.name) + ' &middot; ' + esc(course.level) + '</span>' +
        '</div>' +
        '<ul class="ms-panel-units">' + unitsHTML + '</ul>' +
        '<a class="ms-panel-cta" href="' + esc(course.href) + '">View the ' + esc(course.name) + ' course' +
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>';
      panel.querySelector('.ms-panel-close').addEventListener('click', closePanel);
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      highlightMarker(p.id);
      // Ease toward the stop without losing journey context
      if (ready) {
        map.easeTo({ center: [p.lng, p.lat], pitch: MAP_PITCH, duration: 750, offset: compact ? [0, -30] : [-110, -10] });
      }
    }
    function closePanel() {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      highlightMarker(null);
    }
    stage.addEventListener('click', function (e) {
      if (e.target === stage) closePanel();
    });

    /* ----- Journey switch ----- */
    function setJourney(courseId, userInitiated) {
      var course = courseById(courseId);
      activeCourse = course;

      // tabs
      Array.prototype.forEach.call(tabs.children, function (t) {
        t.classList.toggle('active', t.dataset.course === courseId);
      });

      buildLegend(course);
      closePanel();

      if (!ready) return; // markers/route get built on load via initial setJourney

      buildMarkers(course);

      var pins = orderedPins(course);
      var coords = pins.map(function (p) { return [p.lng, p.lat]; });

      // route color per course
      map.setPaintProperty('ms-route-glow', 'line-color', course.routeColor);
      map.setPaintProperty('ms-route-base', 'line-color', course.routeColor);
      map.getSource('ms-route').setData(lineFeature(coords));
      animateRoute(coords);

      // fit bounds to the journey
      var b = new maplibregl.LngLatBounds();
      coords.forEach(function (c) { b.extend(c); });
      var pad = compact
        ? { top: 70, bottom: 60, left: 50, right: 50 }
        : { top: 110, bottom: 120, left: 90, right: 380 };
      // Keep the 3D tilt + cinematic bearing while framing the journey.
      map.fitBounds(b, {
        padding: pad,
        pitch: MAP_PITCH,
        bearing: MAP_BEARING,
        duration: userInitiated ? 1200 : 0,
        maxZoom: course.id === 'fa-foundation' ? 11.6 : 8.2
      });
    }

    return {
      root: root,
      map: map,
      setJourney: setJourney,
      openStop: function (id) {
        var c = activeCourse || courseById(DATA.courses[0].id);
        var p = pinById(c, id);
        var idx = c.routeOrder.indexOf(id);
        if (p) openStop(c, p, idx);
      },
      closePanel: closePanel
    };
  }

  /* ---------- AUTO-MOUNT ---------- */
  function boot() {
    var first = document.querySelector('#mapstr-mount');
    if (first) mount(first);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.Mapstr = { mount: mount, data: DATA };
})();
