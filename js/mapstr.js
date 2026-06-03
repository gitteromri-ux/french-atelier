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
          { id: "eiffel", city: "Paris — Tour Eiffel", lat: 48.8584, lng: 2.2945, location: "Eiffel Tower & Champ-de-Mars, 7e arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Eiffel_Tower_in_2022_02.jpg/1920px-Eiffel_Tower_in_2022_02.jpg", credit: "Wikimedia Commons / Maksim Sokolov (maxergon.com)", photoSrc: "https://commons.wikimedia.org/wiki/File:Eiffel_Tower_in_2022_02.jpg", units: [{ num: 1, fr: "Se présenter", en: "Greet, exchange names, discover the cultural codes of first meetings in French. Use s'appeler and propose tu." }] },
          { id: "alma-cafe", city: "Paris — Alma Bridge", lat: 48.8630, lng: 2.3010, location: "Classic café near the Alma bridge, 8e arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Paris_Pont_de_l%27Alma_Jeux_olympiques_2024_247.jpg/1920px-Paris_Pont_de_l%27Alma_Jeux_olympiques_2024_247.jpg", credit: "Wikimedia Commons / GFreihalter", photoSrc: "https://commons.wikimedia.org/wiki/File:Paris_Pont_de_l%27Alma_Jeux_olympiques_2024_247.jpg", units: [{ num: 3, fr: "Demander son chemin", en: "Use excusez-moi and c'est où ? to ask for directions. Understand left, right, straight on." }, { num: 4, fr: "Réparer + commander une boisson simple", en: "Signal a communication breakdown, ask for repetition or slower speech, and place a simple café order." }] },
          { id: "bakery-16", city: "Paris — Passy", lat: 48.8580, lng: 2.2780, location: "Boulangerie in the 16th arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Boulangerie_19_rue_Montgallet_%C3%A0_Paris_le_19_ao%C3%BBt_2015_-_4.jpg/1920px-Boulangerie_19_rue_Montgallet_%C3%A0_Paris_le_19_ao%C3%BBt_2015_-_4.jpg", credit: "Wikimedia Commons / Lionel Allorge", photoSrc: "https://commons.wikimedia.org/wiki/File:Boulangerie_19_rue_Montgallet_%C3%A0_Paris_le_19_ao%C3%BBt_2015_-_4.jpg", units: [{ num: 2, fr: "Épeler & vérifier une information", en: "Ask how to spell a word, spell it back, and confirm or correct. Practice the French alphabet and phonetics." }] },
          { id: "bouillon-chartier", city: "Paris — Bouillon Chartier", lat: 48.8742, lng: 2.3460, location: "Bouillon Chartier, 9e arrondissement (Grands Boulevards)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Paris_Chartier_1304.jpg/1920px-Paris_Chartier_1304.jpg", credit: "Wikimedia Commons / Michel wal", photoSrc: "https://commons.wikimedia.org/wiki/File:Paris_Chartier_1304.jpg", units: [{ num: 5, fr: "Commander — Je voudrais… + c'est combien ?", en: "Order food and drinks using je voudrais, ask for the price, handle numbers 0–39. French restaurant culture." }, { num: 6, fr: "Commander — Autre chose ?", en: "Respond to Autre chose ? and C'est tout ?, add items to an order, practice numbers 40–69." }, { num: 10, fr: "Commander — Payer par carte", en: "Express hunger and thirst with j'ai faim / soif, place an order, and pay by card. Full café interaction." }] },
          { id: "palais-royal", city: "Paris — Palais-Royal", lat: 48.8638, lng: 2.3371, location: "Palais-Royal gardens & Tuileries, 1er arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Victor_Hugo_dit_du_Palais_Royal_Mus%C3%A9e_Rodin_S.6686_Paris.jpg/1920px-Victor_Hugo_dit_du_Palais_Royal_Mus%C3%A9e_Rodin_S.6686_Paris.jpg", credit: "Wikimedia Commons / Auguste Rodin", photoSrc: "https://commons.wikimedia.org/wiki/File:Victor_Hugo_dit_du_Palais_Royal_Mus%C3%A9e_Rodin_S.6686_Paris.jpg", units: [{ num: 7, fr: "Proposer une sortie simple", en: "Use être and the pronoun y to suggest an outing, accept or decline, and make a simple decision." }, { num: 8, fr: "Accepter / refuser + exprimer une préférence", en: "Use je préfère to choose between two options, accept or refuse politely, reach a clear decision." }] },
          { id: "pont-des-arts", city: "Paris — Pont des Arts", lat: 48.8584, lng: 2.3375, location: "Pont des Arts (Love Lock Bridge), 6e arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Paris%2C_Pont_des_Arts_--_2014_--_1407.jpg/1920px-Paris%2C_Pont_des_Arts_--_2014_--_1407.jpg", credit: "Wikimedia Commons / Dietmar Rabich", photoSrc: "https://commons.wikimedia.org/wiki/File:Paris,_Pont_des_Arts_--_2014_--_1407.jpg", units: [{ num: 9, fr: "Échanger un numéro de téléphone", en: "Ask for and give a phone number, verify with c'est..., c'est ça ?, practice numbers 70–99." }] },
          { id: "pantheon", city: "Paris — Panthéon", lat: 48.8462, lng: 2.3510, location: "Panthéon, 5e arrondissement (Latin Quarter)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Facade_of_the_Panth%C3%A9on_de_Paris%2C_21_June_2014.jpg/1920px-Facade_of_the_Panth%C3%A9on_de_Paris%2C_21_June_2014.jpg", credit: "Wikimedia Commons / Dennis G. Jarvis", photoSrc: "https://commons.wikimedia.org/wiki/File:Facade_of_the_Panth%C3%A9on_de_Paris,_21_June_2014.jpg", units: [{ num: 11, fr: "Acheter un billet / demander un prix", en: "Buy a ticket, ask for the price, and pay. Cultural role of museums and cultural venues in France." }] },
          { id: "jardin-luxembourg", city: "Paris — Jardin du Luxembourg", lat: 48.8462, lng: 2.3372, location: "Jardin du Luxembourg & Shakespeare & Co, 6e arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Palais_Luxembourg_Pluie.jpg/1920px-Palais_Luxembourg_Pluie.jpg", credit: "Wikimedia Commons / Rafesmar", photoSrc: "https://commons.wikimedia.org/wiki/File:Palais_Luxembourg_Pluie.jpg", units: [{ num: 12, fr: "Donner / échanger email & adresse", en: "Exchange email addresses and street addresses using possessive adjectives mon, ma. Spell and confirm details." }, { num: 13, fr: "Parler de son origine / où on habite", en: "Use venir de and habiter à to talk about where you are from and where you live. Introduce a third person." }] },
          { id: "coulee-verte", city: "Paris — Coulée Verte", lat: 48.8488, lng: 2.3846, location: "Coulée Verte René-Dumont (elevated park), 12e arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Coul%C3%A9e_Verte_Ren%C3%A9-Dumont_%40_Paris_%2828980190410%29.jpg/1920px-Coul%C3%A9e_Verte_Ren%C3%A9-Dumont_%40_Paris_%2828980190410%29.jpg", credit: "Wikimedia Commons / Guilhem Vellut from Paris, France", photoSrc: "https://commons.wikimedia.org/wiki/File:Coul%C3%A9e_Verte_Ren%C3%A9-Dumont_@_Paris_(28980190410).jpg", units: [{ num: 14, fr: "Gérer un imprévu", en: "Handle an unexpected situation (a closed venue), propose an alternative plan, and make a decision." }, { num: 15, fr: "Fixer un rendez-vous (date / heure)", en: "Propose a time and date, negotiate with ça va ?, confirm and close. Tell the time and days of the week." }] },
          { id: "bastille", city: "Paris — Bastille", lat: 48.8533, lng: 2.3692, location: "Place de la Bastille, 11e/12e arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/July_Column_and_Opera_de_Paris_Bastille_on_Place_de_la_Bastille_%2828235987286%29.jpg/1920px-July_Column_and_Opera_de_Paris_Bastille_on_Place_de_la_Bastille_%2828235987286%29.jpg", credit: "Wikimedia Commons / Gary Todd from Xinzheng, China", photoSrc: "https://commons.wikimedia.org/wiki/File:July_Column_and_Opera_de_Paris_Bastille_on_Place_de_la_Bastille_(28235987286).jpg", units: [{ num: 16, fr: "Commander — Réactivation", en: "Revisit ordering sequences at a faster pace: respond to Autre chose ? in three different ways." }, { num: 17, fr: "Commander — Je prends… + l'addition", en: "Use je prends, react to an unavailable item, and ask for the bill. Fluent end-to-end restaurant interaction." }] },
          { id: "montmartre", city: "Paris — Montmartre", lat: 48.8867, lng: 2.3431, location: "Montmartre & Place du Tertre, 18e arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Montmartre%2C_Place_du_Tertre._Fortepan_69842.jpg/1920px-Montmartre%2C_Place_du_Tertre._Fortepan_69842.jpg", credit: "Wikimedia Commons / FOTO:Fortepan — ID 69842: Adomán…", photoSrc: "https://commons.wikimedia.org/wiki/File:Montmartre,_Place_du_Tertre._Fortepan_69842.jpg", units: [{ num: 18, fr: "Exprimer une préférence + justifier", en: "Choose between two options, say je préfère…, and justify with parce que c'est + adjectif." }] },
          { id: "canal-saint-martin", city: "Paris — Canal Saint-Martin", lat: 48.8695, lng: 2.3652, location: "Canal Saint-Martin, 10e arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/2022-04-14-Passerelle_de_la_Grange-aux-Belles-8583.jpg/1920px-2022-04-14-Passerelle_de_la_Grange-aux-Belles-8583.jpg", credit: "Wikimedia Commons / Superbass", photoSrc: "https://commons.wikimedia.org/wiki/File:2022-04-14-Passerelle_de_la_Grange-aux-Belles-8583.jpg", units: [{ num: 19, fr: "Arrivée — Se présenter + orientation + réparation", en: "Chain two micro-tasks — introducing yourself and asking for directions — with repair if needed. Review of Units 1–3." }, { num: 20, fr: "Commander + payer + réparer + conclure", en: "Complete a full ordering and payment scenario at speed. Closing review of FA Foundation. A true production milestone." }] }
        ],
        routeOrder: ["eiffel", "bakery-16", "alma-cafe", "palais-royal", "bouillon-chartier", "pont-des-arts", "jardin-luxembourg", "pantheon", "coulee-verte", "bastille", "canal-saint-martin", "montmartre"]
      },
      {
        id: "fa-beginner", name: "FA Beginner", level: "A1.1 → A1.2", shortLevel: "A1.1",
        region: "Normandy → Paris & Versailles", href: "courses/fa-beginner.html", color: "#E8A87C", routeColor: "#E8A87C",
        description: "From the Normandy coast to Versailles and Paris. Family, weather, daily life, the market.",
        pins: [
          { id: "cabourg", city: "Cabourg", lat: 49.2836, lng: -0.1206, location: "Promenade Marcel Proust, Cabourg (Belle Époque seaside resort)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Promenade_Marcel_Proust_de_Cabourg_en_soir%C3%A9e_%28juillet_2025%29.JPG/1920px-Promenade_Marcel_Proust_de_Cabourg_en_soir%C3%A9e_%28juillet_2025%29.JPG", credit: "Wikimedia Commons / Florian Pépellin", photoSrc: "https://commons.wikimedia.org/wiki/File:Promenade_Marcel_Proust_de_Cabourg_en_soir%C3%A9e_(juillet_2025).JPG", units: [{ num: 1, fr: "Se repérer : demander / indiquer une direction simple", en: "Ask for and give simple directions: pardon, où est... s'il vous plaît ? You tournez à gauche / à droite." }, { num: 2, fr: "Se présenter : profession, nationalité & tour de parole", en: "Introduce yourself beyond basics: profession with je suis + métier, nationality, and ask tu fais quoi ?" }] },
          { id: "honfleur", city: "Honfleur", lat: 49.4184, lng: 0.2333, location: "Vieux-Bassin (Old Harbour), Honfleur — where Champlain set sail for Québec", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Vieux-Bassin_Honfleur_01.jpg/1920px-Vieux-Bassin_Honfleur_01.jpg", credit: "Wikimedia Commons / Miniwark", photoSrc: "https://commons.wikimedia.org/wiki/File:Vieux-Bassin_Honfleur_01.jpg", units: [{ num: 3, fr: "Dire où on est : se situer en temps réel", en: "Locate yourself using je suis là, devant…, juste en face de…, c'est à côté de…" }, { num: 4, fr: "Dire d'où on vient / où on habite + relancer", en: "Use je viens de… and j'habite à… to talk about origin and home, ask back with et toi ?" }] },
          { id: "deauville", city: "Deauville", lat: 49.3537, lng: 0.0707, location: "Les Planches boardwalk, Deauville (American Film Festival town)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Deauville_sea_front_boardwalk_-_panoramio.jpg/1920px-Deauville_sea_front_boardwalk_-_panoramio.jpg", credit: "Wikimedia Commons / nigelb", photoSrc: "https://commons.wikimedia.org/wiki/File:Deauville_sea_front_boardwalk_-_panoramio.jpg", units: [{ num: 5, fr: "Parler de sa famille + âge (avoir)", en: "Talk about family using avoir: say your age j'ai … ans, mention siblings, parents, and children." }, { num: 6, fr: "Saluer + prendre des nouvelles + clôturer (tu / vous)", en: "Use bonjour / bonsoir, ask ça va ?, respond naturally. Master the tu / vous distinction in context." }] },
          { id: "rouen", city: "Rouen", lat: 49.4432, lng: 1.0993, location: "Vieux-Marché & half-timbered streets, Rouen (Joan of Arc's city)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/The_old_town_of_Rouen_includes_about_2%2C000_half-timbered_houses%2C_of_which_half_have_been_restored_%2830269021684%29.jpg/1920px-The_old_town_of_Rouen_includes_about_2%2C000_half-timbered_houses%2C_of_which_half_have_been_restored_%2830269021684%29.jpg", credit: "Wikimedia Commons / Jorge Láscar from Melbourne, Aus…", photoSrc: "https://commons.wikimedia.org/wiki/File:The_old_town_of_Rouen_includes_about_2,000_half-timbered_houses,_of_which_half_have_been_restored_(30269021684).jpg", units: [{ num: 7, fr: "Demander poliment / s'excuser + réparer", en: "Use polite formulas and repair strategies: vous pouvez répéter ? / parler plus lentement ?" }, { num: 8, fr: "Localiser : dire où est… (c'est / il y a)", en: "Use c'est and il y a to describe location: give a street, number, and distances près d'ici / loin." }] },
          { id: "etretat", city: "Étretat", lat: 49.7070, lng: 0.2046, location: "Falaise d'Aval (chalk cliffs immortalised by Monet & Maupassant), Étretat", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/%C3%89tretat_-_La_Falaise_d%27Aval_-_View_ENE_on_%C3%89tretat.jpg/1920px-%C3%89tretat_-_La_Falaise_d%27Aval_-_View_ENE_on_%C3%89tretat.jpg", credit: "Wikimedia Commons / Txllxt TxllxT", photoSrc: "https://commons.wikimedia.org/wiki/File:%C3%89tretat_-_La_Falaise_d%27Aval_-_View_ENE_on_%C3%89tretat.jpg", units: [{ num: 9, fr: "Décrire ce qu'on voit + donner un avis simple", en: "Describe three elements using c'est un/une…, il y a…, je vois… and express a simple opinion." }, { num: 13, fr: "Parler de la météo + réagir", en: "Ask and answer about the weather: il fait beau / froid / chaud, il pleut, predict with demain, il va faire…" }] },
          { id: "versailles", city: "Versailles", lat: 48.8049, lng: 2.1204, location: "Palace of Versailles & Hall of Mirrors, Versailles", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Chateau_Versailles_Galerie_des_Glaces.jpg/1920px-Chateau_Versailles_Galerie_des_Glaces.jpg", credit: "Wikimedia Commons / Myrabella", photoSrc: "https://commons.wikimedia.org/wiki/File:Chateau_Versailles_Galerie_des_Glaces.jpg", units: [{ num: 10, fr: "Fixer une date / heure + parler de projets (futur proche)", en: "Give the date and day, talk about plans using demain, je vais… and cette semaine, je vais…" }, { num: 14, fr: "Choisir / proposer une activité selon la météo", en: "Based on the weather, suggest two activities: on va au parc / au cinéma / au château." }] },
          { id: "contrescarpe", city: "Paris — Place de la Contrescarpe", lat: 48.8508, lng: 2.3506, location: "Place de la Contrescarpe, 5e arrondissement (Hemingway's Paris)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Place_de_la_Contrescarpe_%40_Paris_%2829256393304%29.jpg/1920px-Place_de_la_Contrescarpe_%40_Paris_%2829256393304%29.jpg", credit: "Wikimedia Commons / Guilhem Vellut from Paris, France", photoSrc: "https://commons.wikimedia.org/wiki/File:Place_de_la_Contrescarpe_@_Paris_(29256393304).jpg", units: [{ num: 11, fr: "Proposer une activité (14 juillet) + se mettre d'accord", en: "Suggest Bastille Day activities: on va voir le feu d'artifice / on va au bal, negotiate a time and confirm." }] },
          { id: "jardin-plantes", city: "Paris — Jardin des Plantes", lat: 48.8435, lng: 2.3595, location: "Jardin des Plantes & Seine quays, 5e arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Paris_-_Jardin_des_plantes_-_AL_Jussieu.jpg/1920px-Paris_-_Jardin_des_plantes_-_AL_Jussieu.jpg", credit: "Wikimedia Commons / Statue: Jean-François Legendre-H…", photoSrc: "https://commons.wikimedia.org/wiki/File:Paris_-_Jardin_des_plantes_-_AL_Jussieu.jpg", units: [{ num: 12, fr: "Décrire ses routines + négation utile", en: "Talk about daily routine with reflexive verbs je me lève à… and negate habits je ne travaille pas le week-end." }, { num: 15, fr: "Parler d'activités (verbes en -ER) + organiser une sortie", en: "Use common -er verbs to describe leisure activities, plan a museum or expo outing, arrange a meeting point." }] },
          { id: "place-vosges", city: "Paris — Place des Vosges", lat: 48.8554, lng: 2.3644, location: "Place des Vosges & Musée Carnavalet, Marais, 4e arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Paris_Place_des_Vosges_229.jpg/1920px-Paris_Place_des_Vosges_229.jpg", credit: "Wikimedia Commons / GFreihalter", photoSrc: "https://commons.wikimedia.org/wiki/File:Paris_Place_des_Vosges_229.jpg", units: [{ num: 16, fr: "Poser des questions avec « est-ce que » + mini-interview", en: "Form questions with est-ce que and conduct a short 5-question interview. Express degrees of opinion." }, { num: 17, fr: "Poser des questions (mots interrogatifs) + relancer", en: "Use question words qui, où, quand, pourquoi, comment to ask and answer in a flowing conversation." }] },
          { id: "train-bleu", city: "Paris — Gare de Lyon", lat: 48.8449, lng: 2.3739, location: "Le Train Bleu restaurant, Gare de Lyon, 12e arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Le_Train_Bleu%2C_Gare_de_Lyon%2C_2007_-_panoramio.jpg/1920px-Le_Train_Bleu%2C_Gare_de_Lyon%2C_2007_-_panoramio.jpg", credit: "Wikimedia Commons / simon tunstall", photoSrc: "https://commons.wikimedia.org/wiki/File:Le_Train_Bleu,_Gare_de_Lyon,_2007_-_panoramio.jpg", units: [{ num: 18, fr: "Parler de ce qu'on mange / boit + préférences", en: "Discuss food and drink habits: je mange…, je bois…, offer or decline with tu en veux ? / oui, volontiers !" }] },
          { id: "marche-aligre", city: "Paris — Marché d'Aligre", lat: 48.8492, lng: 2.3779, location: "Marché d'Aligre, 12e arrondissement (Paris's liveliest outdoor market)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Paris_Rue_d%27Aligre_2021%2C_March%C3%A9_2021.jpg/1920px-Paris_Rue_d%27Aligre_2021%2C_March%C3%A9_2021.jpg", credit: "Wikimedia Commons / Smiley.toerist", photoSrc: "https://commons.wikimedia.org/wiki/File:Paris_Rue_d%27Aligre_2021,_March%C3%A9_2021.jpg", units: [{ num: 19, fr: "Acheter au marché : quantités + articles partitifs", en: "Buy produce at a French market using quantities un kilo de…, deux cents grammes de… and partitive articles." }, { num: 20, fr: "Parler de son expérience + dire au revoir (clôture FA1)", en: "Give a free 2–3 minute spoken account of your stay using at least 5 speech acts. A true production milestone." }] }
        ],
        routeOrder: ["cabourg", "honfleur", "deauville", "rouen", "etretat", "versailles", "contrescarpe", "jardin-plantes", "place-vosges", "train-bleu", "marche-aligre"]
      },
      {
        id: "fa-elementary", name: "FA Elementary", level: "A1.2 → A2.1", shortLevel: "A1.2",
        region: "Loire → Bordeaux → Basque", href: "courses/fa-elementary.html", color: "#D4A574", routeColor: "#D4A574",
        description: "Loire châteaux to Atlantic vineyards to Basque mountains. Chain, compare, narrate, describe.",
        pins: [
          { id: "orleans", city: "Orléans", lat: 47.9029, lng: 1.9092, location: "Place du Martroi, Orléans (City of Joan of Arc, gateway to the Loire)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Place_du_Martroi_with_statue_of_Jeanne_d%27Arc_in_Orl%C3%A9ans_France.jpg/1920px-Place_du_Martroi_with_statue_of_Jeanne_d%27Arc_in_Orl%C3%A9ans_France.jpg", credit: "Wikimedia Commons / Tim Adams", photoSrc: "https://commons.wikimedia.org/wiki/File:Place_du_Martroi_with_statue_of_Jeanne_d%27Arc_in_Orl%C3%A9ans_France.jpg", units: [{ num: 1, fr: "Se présenter : saluer + dire qui on est", en: "Reactivate greetings at a higher level: moi, c'est… / je suis…, maintain tu / vous register, exchange identity info." }, { num: 2, fr: "Demander et donner une direction simple", en: "Ask with excusez-moi, pour aller à…, c'est par où ? and give itinerary: tout droit, puis à gauche." }] },
          { id: "villandry", city: "Villandry", lat: 47.3415, lng: 0.5144, location: "Jardins de Villandry (Renaissance gardens, UNESCO World Heritage)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Jardins_de_Villandry_%281%29.jpg/1920px-Jardins_de_Villandry_%281%29.jpg", credit: "Wikimedia Commons / Xfigpower", photoSrc: "https://commons.wikimedia.org/wiki/File:Jardins_de_Villandry_(1).jpg", units: [{ num: 3, fr: "Exprimer une préférence + justifier simplement", en: "Choose between two options, say je préfère… parce que c'est plus…, and agree on a destination." }] },
          { id: "chenonceau", city: "Château de Chenonceau", lat: 47.3238, lng: 1.0701, location: "Château de Chenonceau (the château of the ladies, spanning the Cher river)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Ch%C3%A2teau_de_Chenonceau_-_caryatides_%28Chenonceaux%29.jpg/1920px-Ch%C3%A2teau_de_Chenonceau_-_caryatides_%28Chenonceaux%29.jpg", credit: "Wikimedia Commons / Gzen92", photoSrc: "https://commons.wikimedia.org/wiki/File:Ch%C3%A2teau_de_Chenonceau_-_caryatides_(Chenonceaux).jpg", units: [{ num: 4, fr: "Demander et indiquer une direction (reprise + pression)", en: "Ask for two different locations and give two complete directions. Practice at a faster pace." }, { num: 5, fr: "Proposer une mini-sortie + se mettre d'accord", en: "Plan a short outing: suggest a meeting point on se retrouve à…, sequence two activities, confirm ça marche !" }] },
          { id: "tours", city: "Tours", lat: 47.3941, lng: 0.6848, location: "Place Plumereau terraces & Loire guinguette, Tours", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Place_Plumereau_-_maisons_%28Tours%29.jpg/1920px-Place_Plumereau_-_maisons_%28Tours%29.jpg", credit: "Wikimedia Commons / Gzen92", photoSrc: "https://commons.wikimedia.org/wiki/File:Place_Plumereau_-_maisons_(Tours).jpg", units: [{ num: 6, fr: "Commander au bar / restaurant (poliment)", en: "Order two items using je voudrais…, s'il vous plaît, respond to a follow-up, ask for l'addition." }, { num: 7, fr: "Partager + exprimer une quantité (pronom en)", en: "Offer and respond to sharing using the pronoun en. Practise expressing quantity in a natural food-sharing context." }] },
          { id: "poitiers", city: "Poitiers", lat: 46.5802, lng: 0.3404, location: "Parc de Blossac, Poitiers (elegant park, gateway to the south)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Vue_du_Parc_de_Blossac_%28Poitiers%29_en_janvier_2024.JPG/1920px-Vue_du_Parc_de_Blossac_%28Poitiers%29_en_janvier_2024.JPG", credit: "Wikimedia Commons / Benoît Prieur", photoSrc: "https://commons.wikimedia.org/wiki/File:Vue_du_Parc_de_Blossac_(Poitiers)_en_janvier_2024.JPG", units: [{ num: 9, fr: "Comparer + justifier (parce que / mais)", en: "Compare two options using je préfère… parce que…, introduce nuance with mais l'autre option est plus…" }, { num: 10, fr: "Exprimer ses goûts + justifier", en: "Share a cultural preference using j'aime bien… parce que…, invite the other person et toi, tu préfères quoi ?" }] },
          { id: "bordeaux-wine", city: "Bordeaux — Wine District", lat: 44.8405, lng: -0.5805, location: "Bordeaux wine merchants & vineyards, Chartrons district", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Bordeaux_-_Temple_des_Chartrons_04.jpg/1920px-Bordeaux_-_Temple_des_Chartrons_04.jpg", credit: "Wikimedia Commons / Pierre-Yves Beaudouin", photoSrc: "https://commons.wikimedia.org/wiki/File:Bordeaux_-_Temple_des_Chartrons_04.jpg", units: [{ num: 8, fr: "Recommander + exprimer une préférence", en: "Recommend a wine using je te conseille celui-là, ask tu préfères rouge ou blanc ? French wine culture." }] },
          { id: "cite-du-vin", city: "Bordeaux — Cité du Vin", lat: 44.8620, lng: -0.5545, location: "La Cité du Vin (the world's premier wine museum), Bordeaux", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Cit%C3%A9_du_Vin_Bordeaux_15.jpg/1920px-Cit%C3%A9_du_Vin_Bordeaux_15.jpg", credit: "Wikimedia Commons / FrDr", photoSrc: "https://commons.wikimedia.org/wiki/File:Cit%C3%A9_du_Vin_Bordeaux_15.jpg", units: [{ num: 11, fr: "Proposer une sortie + se mettre d'accord", en: "Suggest a weekend outing: t'as envie de sortir ? on pourrait aller au musée ?, negotiate, fix time and place." }] },
          { id: "bordeaux-musee", city: "Bordeaux — Musée des Beaux-Arts", lat: 44.8387, lng: -0.5764, location: "Musée des Beaux-Arts de Bordeaux, Cours d'Albret", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Bordeaux_Mus%C3%A9e_des_Beaux_Arts_12.JPG/1920px-Bordeaux_Mus%C3%A9e_des_Beaux_Arts_12.JPG", credit: "Wikimedia Commons / GFreihalter", photoSrc: "https://commons.wikimedia.org/wiki/File:Bordeaux_Mus%C3%A9e_des_Beaux_Arts_12.JPG", units: [{ num: 14, fr: "Décrire une œuvre + exprimer une préférence", en: "Describe a work of art c'est un tableau / une sculpture using two adjectives, express a preference." }, { num: 15, fr: "Présenter une œuvre (mini-exposé) + justifier", en: "Give a structured 30–45 second presentation: je vais vous parler de…, c'est une œuvre de…, ça a été créé en…" }] },
          { id: "dune-pilat", city: "Dune du Pilat", lat: 44.5893, lng: -1.2109, location: "Dune du Pilat (Europe's tallest sand dune, 110m, Atlantic coast)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Dune-Pilat%2Bmaisons-du-Pyla-byMmeRundvald.jpg/1920px-Dune-Pilat%2Bmaisons-du-Pyla-byMmeRundvald.jpg", credit: "Wikimedia Commons / Rundvald", photoSrc: "https://commons.wikimedia.org/wiki/File:Dune-Pilat%2Bmaisons-du-Pyla-byMmeRundvald.jpg", units: [{ num: 12, fr: "Raconter un souvenir court (passé composé)", en: "Narrate a short memory using the passé composé: on a visité…, c'était top, j'ai adoré." }, { num: 13, fr: "Exprimer une opinion + justifier (accord / désaccord simple)", en: "Use je trouve que c'est… and pour moi… to share an opinion, agree or disagree simply." }] },
          { id: "gujan-mestras", city: "Gujan-Mestras", lat: 44.6384, lng: -1.0672, location: "Oyster ports of Gujan-Mestras, Bassin d'Arcachon", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Parc_a_huitres_a_Gujan_Mestras_DSC_0017.JPG/1920px-Parc_a_huitres_a_Gujan_Mestras_DSC_0017.JPG", credit: "Wikimedia Commons / Pline", photoSrc: "https://commons.wikimedia.org/wiki/File:Parc_a_huitres_a_Gujan_Mestras_DSC_0017.JPG", units: [{ num: 16, fr: "Organiser un parcours + se mettre d'accord", en: "Negotiate a visit itinerary: on commence par…, et ensuite…, asking for agreement t'es d'accord ?" }] },
          { id: "bayonne", city: "Bayonne", lat: 43.4929, lng: -1.4748, location: "Cathédrale Sainte-Marie & chocolate-makers of the old town, Bayonne", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Cloister_of_Cath%C3%A9drale_Sainte-Marie_de_Bayonne_-_Bayonne%2C_France_July_15%2C_2024.jpg/1920px-Cloister_of_Cath%C3%A9drale_Sainte-Marie_de_Bayonne_-_Bayonne%2C_France_July_15%2C_2024.jpg", credit: "Wikimedia Commons / Giorgio Galeotti", photoSrc: "https://commons.wikimedia.org/wiki/File:Cloister_of_Cath%C3%A9drale_Sainte-Marie_de_Bayonne_-_Bayonne,_France_July_15,_2024.jpg", units: [{ num: 17, fr: "Raconter / imaginer (micro-récit)", en: "Narrate and imagine a scene using d'abord…, et ensuite…, à la fin… Produce a 4-sentence micro-narrative." }] },
          { id: "biarritz", city: "Biarritz", lat: 43.4832, lng: -1.5586, location: "Rocher de la Vierge, Biarritz (iconic Basque surf coast viewpoint)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Rocher_de_la_Vierge_depuis_Biarritz.jpg/1920px-Rocher_de_la_Vierge_depuis_Biarritz.jpg", credit: "Wikimedia Commons / Christian David", photoSrc: "https://commons.wikimedia.org/wiki/File:Rocher_de_la_Vierge_depuis_Biarritz.jpg", units: [{ num: 18, fr: "Organiser une visite (heure / lieu / étapes) + valider", en: "Plan a full visit: agree on meeting point on se retrouve à… heures devant…, sequence three stages." }] },
          { id: "la-rhune", city: "La Rhune", lat: 43.3088, lng: -1.6353, location: "La Rhune (sacred Basque mountain, 905m, rack railway to the summit)", image: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Urrugne%2C_France_-_panoramio_%283%29.jpg", credit: "Wikimedia Commons / buztanki", photoSrc: "https://commons.wikimedia.org/wiki/File:Urrugne,_France_-_panoramio_(3).jpg", units: [{ num: 19, fr: "Micro-récit + réagir / relancer (pré-bilan)", en: "Narrate a recent outing in 4 sentences, express a nuanced reaction j'ai adoré / j'ai pas trop aimé." }] },
          { id: "saint-jean-luz", city: "Saint-Jean-de-Luz", lat: 43.3895, lng: -1.6612, location: "Harbour of Saint-Jean-de-Luz (where Louis XIV was married, final bay before Spain)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Puerto%2C_San_Juan_de_Luz%2C_Francia%2C_2023-01-05%2C_DD_07-09_HDR.jpg/1920px-Puerto%2C_San_Juan_de_Luz%2C_Francia%2C_2023-01-05%2C_DD_07-09_HDR.jpg", credit: "Wikimedia Commons / Diego Delso", photoSrc: "https://commons.wikimedia.org/wiki/File:Puerto,_San_Juan_de_Luz,_Francia,_2023-01-05,_DD_07-09_HDR.jpg", units: [{ num: 20, fr: "Consolider : défendre un choix + négocier + conclure", en: "Defend a choice: moi, je choisis… parce que…, propose an alternative on pourrait aussi…, close allez, c'est décidé !" }] }
        ],
        routeOrder: ["orleans", "villandry", "chenonceau", "tours", "poitiers", "bordeaux-wine", "cite-du-vin", "bordeaux-musee", "dune-pilat", "gujan-mestras", "bayonne", "biarritz", "la-rhune", "saint-jean-luz"]
      },
      {
        id: "fa-intermediate", name: "FA Intermediate", level: "A2.1 → A2.2", shortLevel: "A2.1",
        region: "Marseille → Chamonix → Strasbourg → Reims", href: "courses/fa-intermediate.html", color: "#6E789C", routeColor: "#6E789C",
        description: "Marseille's ancient port to Chamonix's glaciers to Alsace and Champagne. Debate, negotiate, and narrate across three very different corners of France.",
        pins: [
          { id: "vieux-port", city: "Marseille — Vieux-Port", lat: 43.2951, lng: 5.3700, location: "Vieux-Port (Old Harbour), Marseille — the beating heart of the city since 600 BC", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Marseille_Old_Port.jpg/1920px-Marseille_Old_Port.jpg", credit: "Wikimedia Commons / Ingo Mehling", photoSrc: "https://commons.wikimedia.org/wiki/File:Marseille_Old_Port.jpg", units: [{ num: 1, fr: "Inviter / proposer une sortie", en: "Invite someone out using et si on allait au théâtre ?, agree on a time and place, and confirm warmly in a spontaneous 10-turn exchange." }, { num: 2, fr: "Refuser poliment + proposer une alternative", en: "Decline an invitation with a brief reason and immediately offer a concrete alternative. Maintain tu/vous register throughout." }] },
          { id: "le-panier", city: "Marseille — Le Panier", lat: 43.2977, lng: 5.3683, location: "Le Panier (oldest quarter of Marseille), steep alleys and colourful facades above the port", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Marseille_Panier_Movie_Theater.jpg/1920px-Marseille_Panier_Movie_Theater.jpg", credit: "Wikimedia Commons / Benh LIEU SONG", photoSrc: "https://commons.wikimedia.org/wiki/File:Marseille_Panier_Movie_Theater.jpg", units: [{ num: 3, fr: "Négocier + conclure un compromis", en: "Raise a constraint, propose a practical concession, and close with a clear joint decision. Practice structured negotiation over at least 12 turns." }, { num: 4, fr: "Exprimer une préférence culturelle + comparer", en: "Share a preference about social customs, justify it, and invite comparison — et dans ton pays, on fait comment ? Discover the cultural codes around la bise." }] },
          { id: "vallon-auffes", city: "Marseille — Vallon des Auffes", lat: 43.2837, lng: 5.3558, location: "Vallon des Auffes (tiny fishing harbour under the Corniche, Marseille)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Marseille_Vallon_des_Auffes_01.jpg/1920px-Marseille_Vallon_des_Auffes_01.jpg", credit: "Wikimedia Commons / Zairon", photoSrc: "https://commons.wikimedia.org/wiki/File:Marseille_Vallon_des_Auffes_01.jpg", units: [{ num: 5, fr: "Exprimer une gêne + demander conseil", en: "Express uncertainty about a social situation, ask for the other person's preference, and propose a comfortable alternative." }, { num: 6, fr: "Recommander + micro-récit au passé", en: "Open with a short past-tense anecdote, make a recommendation, justify it, introduce a nuance with en revanche, and invite the other person." }] },
          { id: "mucem", city: "Marseille — MuCEM", lat: 43.2966, lng: 5.3610, location: "MuCEM (Museum of European and Mediterranean Civilisations), J4 pier, Marseille", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/View_of_Mucem_under_construction_from_Esplanade_de_la_Tourette%2C_Marseille%2C_2012.jpg/1920px-View_of_Mucem_under_construction_from_Esplanade_de_la_Tourette%2C_Marseille%2C_2012.jpg", credit: "Wikimedia Commons / DimiTalen", photoSrc: "https://commons.wikimedia.org/wiki/File:View_of_Mucem_under_construction_from_Esplanade_de_la_Tourette,_Marseille,_2012.jpg", units: [{ num: 7, fr: "Donner un avis + voter entre deux options", en: "Share a personal opinion about a cultural event, justify it, compare two options, and reach a joint decision. Practice direct object pronouns." }, { num: 8, fr: "Donner un avis + comparer deux œuvres", en: "Express two opinions on works of art, compare them, and ask et toi, tu préfères lequel ? Discover key works of French art." }] },
          { id: "calanques", city: "Marseille — Calanques", lat: 43.2164, lng: 5.4386, location: "Calanques de Morgiou (limestone coastal inlets, Parc National des Calanques), south of Marseille", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Calanques_de_Marseille_20120922_48.jpg/1920px-Calanques_de_Marseille_20120922_48.jpg", credit: "Wikimedia Commons / Georges Seguin (Okki)", photoSrc: "https://commons.wikimedia.org/wiki/File:Calanques_de_Marseille_20120922_48.jpg", units: [{ num: 9, fr: "Organiser un parcours + gérer un imprévu", en: "Plan a three-stage visit, handle an unexpected closure, and agree on a plan B. Practice improvised decision-making in a cultural setting." }] },
          { id: "mer-de-glace", city: "Chamonix — Mer de Glace", lat: 45.9161, lng: 6.9210, location: "Mer de Glace (France's largest glacier, reached by the Montenvers rack railway), Chamonix", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Mer_de_Glace%2C_Aiguille_du_G%C3%A9ant_et_Grandes_Jorasses.jpg/1920px-Mer_de_Glace%2C_Aiguille_du_G%C3%A9ant_et_Grandes_Jorasses.jpg", credit: "Wikimedia Commons / Detroit Publishing Company", photoSrc: "https://commons.wikimedia.org/wiki/File:Mer_de_Glace,_Aiguille_du_G%C3%A9ant_et_Grandes_Jorasses.jpg", units: [{ num: 10, fr: "Comparer + nuancer un avis", en: "Compare two cultural experiences, introduce nuance with mais / en revanche / au final, and state a clear personal preference. Explore the French performing arts scene." }, { num: 11, fr: "Recommander un endroit + se repérer", en: "Express a preference for a neighbourhood, handle a moment of disorientation, and make a local recommendation." }] },
          { id: "aiguille-du-midi", city: "Chamonix — Aiguille du Midi", lat: 45.8786, lng: 6.8873, location: "Aiguille du Midi (3,842 m cable-car summit, Chamonix — panoramic view over Mont-Blanc massif)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/AiguilleDuMidiTM.jpg/1920px-AiguilleDuMidiTM.jpg", credit: "Wikimedia Commons / Nicolas Sanchez", photoSrc: "https://commons.wikimedia.org/wiki/File:AiguilleDuMidiTM.jpg", units: [{ num: 12, fr: "Nuancer un avis + défendre un choix", en: "Assert a position, acknowledge the counterargument, and defend a practical decision using concessive connectors." }] },
          { id: "petite-france", city: "Strasbourg — Petite France", lat: 48.5800, lng: 7.7400, location: "Petite France (medieval half-timbered district on the Ill river), Strasbourg", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Stra%C3%9Fburg_%28Frankreich%29%2C_Petite_France_--_2011_--_1759.jpg/1920px-Stra%C3%9Fburg_%28Frankreich%29%2C_Petite_France_--_2011_--_1759.jpg", credit: "Wikimedia Commons / Dietmar Rabich", photoSrc: "https://commons.wikimedia.org/wiki/File:Stra%C3%9Fburg_(Frankreich),_Petite_France_--_2011_--_1759.jpg", units: [{ num: 13, fr: "Proposer + comparer deux destinations", en: "Propose two travel destinations, compare them on one criterion, justify your preference, and reach a joint decision. Practice French regional vocabulary." }] },
          { id: "place-broglie", city: "Strasbourg — Place Broglie", lat: 48.5836, lng: 7.7457, location: "Place Broglie (site of the Strasbourg Christmas Market, oldest in France), Strasbourg", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Tramway_%40_Place_Broglie_%40_Strasbourg_%2844894701294%29.jpg/1920px-Tramway_%40_Place_Broglie_%40_Strasbourg_%2844894701294%29.jpg", credit: "Wikimedia Commons / Guilhem Vellut from Annecy, France", photoSrc: "https://commons.wikimedia.org/wiki/File:Tramway_@_Place_Broglie_@_Strasbourg_(44894701294).jpg", units: [{ num: 14, fr: "Organiser un programme + gérer un désaccord + un imprévu", en: "Negotiate a 3-step itinerary with a diverging view, use concessive connectors, then handle an unexpected problem and agree on a plan B." }, { num: 15, fr: "Raconter une expérience (week-end) + relancer", en: "Narrate a past weekend in 4 sentences using the passé composé, express a reaction, and hand the floor back et toi, tu as fait quoi ?" }] },
          { id: "cathedrale-strasbourg", city: "Strasbourg — Cathédrale", lat: 48.5818, lng: 7.7507, location: "Cathédrale Notre-Dame de Strasbourg (pink Vosges sandstone Gothic cathedral, 142m spire)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Maison_Kammerzell_and_Cath%C3%A9drale_Notre_Dame_Strasbourg_France_copr_2022_by_Tim_Adams_CC_by_3.jpg/1920px-Maison_Kammerzell_and_Cath%C3%A9drale_Notre_Dame_Strasbourg_France_copr_2022_by_Tim_Adams_CC_by_3.jpg", credit: "Wikimedia Commons / Tim Adams", photoSrc: "https://commons.wikimedia.org/wiki/File:Maison_Kammerzell_and_Cath%C3%A9drale_Notre_Dame_Strasbourg_France_copr_2022_by_Tim_Adams_CC_by_3.jpg", units: [{ num: 16, fr: "Comparer + recommander selon un critère", en: "Compare two destinations on multiple criteria, recommend one conditionally, and introduce a counterpoint en revanche." }] },
          { id: "reims-cathedrale", city: "Reims — Cathédrale", lat: 49.2533, lng: 4.0339, location: "Cathédrale Notre-Dame de Reims (royal coronation cathedral, UNESCO World Heritage)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Reims_Cathedral.jpg/1920px-Reims_Cathedral.jpg", credit: "Wikimedia Commons / Balise42", photoSrc: "https://commons.wikimedia.org/wiki/File:Reims_Cathedral.jpg", units: [{ num: 17, fr: "Acheter au marché + négocier un prix", en: "Request a specific quantity of a product, ask a quality question, and attempt a soft negotiation — vous me faites un petit prix ? Discover the culture of French outdoor markets." }] },
          { id: "place-erlon", city: "Reims — Place d'Erlon", lat: 49.2580, lng: 4.0321, location: "Place d'Erlon (Reims's lively pedestrian main square, cafés and brasseries)", image: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Reims-FR-51-place_d%27Erlon-en_ruine-A.jpg", credit: "Wikimedia Commons / Georges Graff", photoSrc: "https://commons.wikimedia.org/wiki/File:Reims-FR-51-place_d%27Erlon-en_ruine-A.jpg", units: [{ num: 18, fr: "Signaler un problème + demander une solution", en: "Signal a problem at a restaurant or shop calmly, request a remedy, and conclude the interaction once the issue is resolved." }] },
          { id: "caves-champagne", city: "Reims — Caves de Champagne", lat: 49.2488, lng: 4.0306, location: "Caves de Champagne (chalk cellars where Champagne matures, Reims — UNESCO geosite)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Northern_France_-_from_Belgium_and_the_English_Channel_to_the_Loire%2C_excluding_Paris_and_its_environs_-_handbook_for_travellers_%281909%29_%2814802387983%29.jpg/1920px-Northern_France_-_from_Belgium_and_the_English_Channel_to_the_Loire%2C_excluding_Paris_and_its_environs_-_handbook_for_travellers_%281909%29_%2814802387983%29.jpg", credit: "Wikimedia Commons / Karl Baedeker (Firm)", photoSrc: "https://commons.wikimedia.org/wiki/File:Northern_France_-_from_Belgium_and_the_English_Channel_to_the_Loire,_excluding_Paris_and_its_environs_-_handbook_for_travellers_(1909)_(14802387983).jpg", units: [{ num: 19, fr: "Raconter un événement culturel + relancer", en: "Narrate a past experience of a French national celebration in 4 sentences, describe the atmosphere, and invite the other person to share their experience." }, { num: 20, fr: "Comparer deux cultures + exprimer un avis nuancé", en: "Compare a French tradition with its equivalent in your own culture, give a personal opinion, and introduce a counterpoint. Full consolidation of FA Intermediate: past narration, comparison, nuance, and intercultural reflection." }] }
        ],
        routeOrder: ["vieux-port", "le-panier", "vallon-auffes", "mucem", "calanques", "mer-de-glace", "aiguille-du-midi", "petite-france", "place-broglie", "cathedrale-strasbourg", "reims-cathedrale", "place-erlon", "caves-champagne"]
      },
      {
        id: "lsf-foundation", name: "LSF Foundation", level: "A0 → A1.1", shortLevel: "A0",
        region: "Paris — everyday life", href: "courses/lsf-foundation.html", color: "#C76F50", routeColor: "#C76F50",
        description: "An evening course anchored in everyday Parisian life. Survive, greet, count, order a drink, and close a first conversation — ten confidence-building steps.",
        pins: [
          { id: "lsf-cafe-flore", city: "Paris — Café de Flore", lat: 48.8540, lng: 2.3330, location: "Café de Flore, Boulevard Saint-Germain, 6e arrondissement (iconic Paris café)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Panneau_Histoire_de_Paris%2C_caf%C3%A9_de_Flore%2C_172_boulevard_Saint-Germain%2C_Paris_6e.jpg/1920px-Panneau_Histoire_de_Paris%2C_caf%C3%A9_de_Flore%2C_172_boulevard_Saint-Germain%2C_Paris_6e.jpg", credit: "Wikimedia Commons / Celette", photoSrc: "https://commons.wikimedia.org/wiki/File:Panneau_Histoire_de_Paris,_caf%C3%A9_de_Flore,_172_boulevard_Saint-Germain,_Paris_6e.jpg", units: [{ num: 1, fr: "Hello, je m'appelle…", en: "Introduce yourself: give your first name, country of origin, and language(s) spoken. Practice the spoken alphabet and discover French accents." }, { num: 2, fr: "Bonjour, bonsoir, au revoir !", en: "Greet appropriately at different times of day and take leave. Learn key salutation formulas and get a first feel for the tu/vous distinction." }] },
          { id: "lsf-marche-aligre", city: "Paris — Marché d'Aligre", lat: 48.8503, lng: 2.3776, location: "Marché d'Aligre (open-air market), Place d'Aligre, 12e arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Paris_Rue_d%27Aligre_2021%2C_March%C3%A9_2021.jpg/1920px-Paris_Rue_d%27Aligre_2021%2C_March%C3%A9_2021.jpg", credit: "Wikimedia Commons / Smiley.toerist", photoSrc: "https://commons.wikimedia.org/wiki/File:Paris_Rue_d%27Aligre_2021,_March%C3%A9_2021.jpg", units: [{ num: 3, fr: "0 à 20 — les chiffres", en: "Say your age, give a phone number, and understand a simple price. Count from 0 to 20 and practice the nasal sounds that shape French pronunciation." }, { num: 4, fr: "C'est quoi ?", en: "Name everyday objects and say what something is. Use c'est un / une / des with 20 common nouns and develop an implicit feel for grammatical gender." }] },
          { id: "lsf-boulangerie-mouffetard", city: "Paris — Rue Mouffetard", lat: 48.8439, lng: 2.3508, location: "Boulangerie on Rue Mouffetard, 5e arrondissement (the oldest market street in Paris)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Rue_Mouffetard_%40_Paris_%2833321250530%29.jpg/1920px-Rue_Mouffetard_%40_Paris_%2833321250530%29.jpg", credit: "Wikimedia Commons / Guilhem Vellut from Paris, France", photoSrc: "https://commons.wikimedia.org/wiki/File:Rue_Mouffetard_@_Paris_(33321250530).jpg", units: [{ num: 5, fr: "Les couleurs et les descriptions", en: "Describe an object or a person using one or two adjectives. Learn colour vocabulary alongside grand/petit/beau/vieux and develop awareness of adjective agreement." }] },
          { id: "lsf-seine-quay", city: "Paris — Quais de Seine", lat: 48.8566, lng: 2.3522, location: "Quais de la Seine (riverside walkway), Île de la Cité area, Paris", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Paris_-_Quai_de_la_Seine_%2822894467274%29.jpg/1920px-Paris_-_Quai_de_la_Seine_%2822894467274%29.jpg", credit: "Wikimedia Commons / Fred Romero from Paris, France", photoSrc: "https://commons.wikimedia.org/wiki/File:Paris_-_Quai_de_la_Seine_(22894467274).jpg", units: [{ num: 6, fr: "⚡ Speed dating — Let's recap !", en: "Introduce yourself to three different people in two minutes each. A mid-course review of Units 1–5 with no new language: name, country, language, age, and a description." }] },
          { id: "lsf-cafe-de-la-mairie", city: "Paris — Place Saint-Sulpice", lat: 48.8513, lng: 2.3339, location: "Café de la Mairie, Place Saint-Sulpice, 6e arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Coin_place_Saint-Sulpice_Paris_1.jpg/1920px-Coin_place_Saint-Sulpice_Paris_1.jpg", credit: "Wikimedia Commons / Celette", photoSrc: "https://commons.wikimedia.org/wiki/File:Coin_place_Saint-Sulpice_Paris_1.jpg", units: [{ num: 7, fr: "Au café", en: "Order a drink and pay at a café. Use je voudrais / je prends / s'il vous plaît / merci / c'est combien ? in a short, polite exchange." }, { num: 8, fr: "Les jours et les moments", en: "Say which day and time of day you do an activity. Learn the 7 days of the week and time-of-day expressions, and use habitual forms le lundi, le matin." }] },
          { id: "lsf-parc-monceau", city: "Paris — Parc Monceau", lat: 48.8796, lng: 2.3087, location: "Parc Monceau (elegant 18th-century English garden), 8e arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Parc_Monceau_%40_Paris_%2823506245009%29.jpg/1920px-Parc_Monceau_%40_Paris_%2823506245009%29.jpg", credit: "Wikimedia Commons / Guilhem Vellut from Paris, France", photoSrc: "https://commons.wikimedia.org/wiki/File:Parc_Monceau_@_Paris_(23506245009).jpg", units: [{ num: 9, fr: "J'aime / je n'aime pas", en: "Express your feelings about 5 activities or foods. Use the full opinion scale — j'adore / j'aime / je n'aime pas / je déteste — with an infinitive or a noun." }, { num: 10, fr: "À bientôt !", en: "Hold a short closing conversation: introduce yourself, share a preference, and mention a simple plan. A general review of all LSF Foundation language with complete politeness formulas." }] }
        ],
        routeOrder: ["lsf-cafe-flore", "lsf-marche-aligre", "lsf-boulangerie-mouffetard", "lsf-seine-quay", "lsf-cafe-de-la-mairie", "lsf-parc-monceau"]
      },
      {
        id: "lsf-beginner", name: "LSF Beginner", level: "A1.1 → A1.2", shortLevel: "A1.1",
        region: "Paris — daily life", href: "courses/lsf-beginner.html", color: "#B5607A", routeColor: "#B5607A",
        description: "Evening sessions in everyday Paris: shopping, getting around, eating out, describing home, and expressing preferences — all without a script.",
        pins: [
          { id: "lsf-beg-intro", city: "Paris — Place de la République", lat: 48.8674, lng: 2.3633, location: "Place de la République (bustling central square), 11e arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Place_de_la_R%C3%A9publique_%28Paris%29%2C_r%C3%A9am%C3%A9nagement%2C_2012-04-05_12.jpg/1920px-Place_de_la_R%C3%A9publique_%28Paris%29%2C_r%C3%A9am%C3%A9nagement%2C_2012-04-05_12.jpg", credit: "Wikimedia Commons / Coyau", photoSrc: "https://commons.wikimedia.org/wiki/File:Place_de_la_R%C3%A9publique_(Paris),_r%C3%A9am%C3%A9nagement,_2012-04-05_12.jpg", units: [{ num: 1, fr: "Bonjour, je m'appelle…", en: "Introduce yourself to a stranger: give your first name, nationality, and home city. Respond to et vous ? without hesitation in a 2-turn mini-dialogue." }] },
          { id: "lsf-beg-marche", city: "Paris — Marché Bastille", lat: 48.8533, lng: 2.3701, location: "Marché Bastille (Boulevard Richard-Lenoir), 11e arrondissement — one of Paris's finest outdoor markets", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/March%C3%A9_Bastille%2C_Paris_26_September_2013.jpg/1920px-March%C3%A9_Bastille%2C_Paris_26_September_2013.jpg", credit: "Wikimedia Commons / Michael Costa", photoSrc: "https://commons.wikimedia.org/wiki/File:March%C3%A9_Bastille,_Paris_26_September_2013.jpg", units: [{ num: 2, fr: "Au marché et à la boulangerie", en: "Buy three products, ask for the price, and close the transaction. Use je voudrais [produit], s'il vous plaît, c'est combien ?, voilà, merci !" }] },
          { id: "lsf-beg-metro", city: "Paris — Châtelet", lat: 48.8597, lng: 2.3470, location: "Châtelet metro station (hub of the Paris metro, 1er arrondissement)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Station_M%C3%A9tro_Ch%C3%A2telet_ligne_1_Paris_2.jpg/1920px-Station_M%C3%A9tro_Ch%C3%A2telet_ligne_1_Paris_2.jpg", credit: "Wikimedia Commons / Chabe01", photoSrc: "https://commons.wikimedia.org/wiki/File:Station_M%C3%A9tro_Ch%C3%A2telet_ligne_1_Paris_2.jpg", units: [{ num: 3, fr: "Comment y aller ?", en: "Ask for and understand a simple itinerary, then buy a metro ticket. Use pour aller à [lieu], s'il vous plaît ? and understand à gauche / à droite / tout droit." }] },
          { id: "lsf-beg-restaurant", city: "Paris — Montparnasse", lat: 48.8420, lng: 2.3213, location: "Brasserie du Dôme, Boulevard du Montparnasse, 14e arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/La_Rotonde%2C_105_Boulevard_du_Montparnasse%2C_75006_Paris_2013.jpg/1920px-La_Rotonde%2C_105_Boulevard_du_Montparnasse%2C_75006_Paris_2013.jpg", credit: "Wikimedia Commons / flightlog", photoSrc: "https://commons.wikimedia.org/wiki/File:La_Rotonde,_105_Boulevard_du_Montparnasse,_75006_Paris_2013.jpg", units: [{ num: 4, fr: "Au café, au restaurant", en: "Place a full order, handle a mistake — ce n'est pas ce que j'ai commandé — and ask for the bill. A complete role-play with no script on the second pass." }] },
          { id: "lsf-beg-appart", city: "Paris — Oberkampf", lat: 48.8647, lng: 2.3726, location: "Residential apartment building, Rue Oberkampf, 11e arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Charbon_Caf%C3%A9%2C_109_Rue_Oberkampf%2C_75011_Paris%2C_17_September_2020.jpg/1920px-Charbon_Caf%C3%A9%2C_109_Rue_Oberkampf%2C_75011_Paris%2C_17_September_2020.jpg", credit: "Wikimedia Commons / Jeanne Menjoulet from Paris, France", photoSrc: "https://commons.wikimedia.org/wiki/File:Charbon_Caf%C3%A9,_109_Rue_Oberkampf,_75011_Paris,_17_September_2020.jpg", units: [{ num: 5, fr: "Chez moi", en: "Describe your home in 3–5 sentences: name the rooms, locate them with prepositions, and give the floor number. Answer 2 follow-up questions without a script." }, { num: 6, fr: "⚡ Speed dating : Bienvenue en France !", en: "Chain the 5 speech acts from Units 1–5 in a speed dating format with at least one unexpected prompt per situation." }] },
          { id: "lsf-beg-routine", city: "Paris — Canal Saint-Martin", lat: 48.8721, lng: 2.3651, location: "Canal Saint-Martin quayside (morning joggers, bakeries, neighbourhood life), 10e arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/2022-04-14-Passerelle_de_la_Grange-aux-Belles-8583.jpg/1920px-2022-04-14-Passerelle_de_la_Grange-aux-Belles-8583.jpg", credit: "Wikimedia Commons / Superbass", photoSrc: "https://commons.wikimedia.org/wiki/File:2022-04-14-Passerelle_de_la_Grange-aux-Belles-8583.jpg", units: [{ num: 7, fr: "Ma journée, ma routine", en: "Describe your typical day in 5–6 sentences: give the time, use reflexive verbs je me lève à…, and name the relevant days of the week." }] },
          { id: "lsf-beg-preferences", city: "Paris — Buttes-Chaumont", lat: 48.8799, lng: 2.3819, location: "Parc des Buttes-Chaumont (dramatic 19th-century park, temple island), 19e arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Autumn_tree_in_Parc_des_Buttes-Chaumont%2C_November_2019_3.jpg/1920px-Autumn_tree_in_Parc_des_Buttes-Chaumont%2C_November_2019_3.jpg", credit: "Wikimedia Commons / Jami430", photoSrc: "https://commons.wikimedia.org/wiki/File:Autumn_tree_in_Parc_des_Buttes-Chaumont,_November_2019_3.jpg", units: [{ num: 8, fr: "Ce que j'aime, ce que je déteste", en: "Exchange preferences on food, activities, and places over 5 turns. Use the full opinion scale and close with a short monologue: 3 things you love about France." }] },
          { id: "lsf-beg-pharmacie", city: "Paris — Pharmacy", lat: 48.8586, lng: 2.3378, location: "Grande Pharmacie de Paris, Saint-Germain-des-Prés, 6e arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Lizard%2C_Pharmacie_F._Cotinat%2C_Paris_23_December_2016_001.jpg/1920px-Lizard%2C_Pharmacie_F._Cotinat%2C_Paris_23_December_2016_001.jpg", credit: "Wikimedia Commons / Guilhem Vellut from Paris, France", photoSrc: "https://commons.wikimedia.org/wiki/File:Lizard,_Pharmacie_F._Cotinat,_Paris_23_December_2016_001.jpg", units: [{ num: 9, fr: "Je ne me sens pas bien", en: "Describe two symptoms and request medication at a pharmacy. Use j'ai mal à la tête / au ventre, j'ai de la fièvre. Understand simple pharmacist instructions." }, { num: 10, fr: "⚡ Speed dating : Mon premier mois en France", en: "Final consolidation of all LSF Beginner speech acts in free production. Five situations drawn at random from Units 1–9, each with at least one unexpected prompt." }] }
        ],
        routeOrder: ["lsf-beg-intro", "lsf-beg-marche", "lsf-beg-metro", "lsf-beg-restaurant", "lsf-beg-appart", "lsf-beg-routine", "lsf-beg-preferences", "lsf-beg-pharmacie"]
      },
      {
        id: "lsf-elementary", name: "LSF Elementary", level: "A1.2 → A2.1", shortLevel: "A1.2",
        region: "Paris — cultural & professional life", href: "courses/lsf-elementary.html", color: "#8B7BB5", routeColor: "#8B7BB5",
        description: "Evening sessions for settled residents: opinions on French culture, handling problems, appointments, outings, work, past events, admin tasks, and cultural implicits.",
        pins: [
          { id: "lsf-el-cafe-opinion", city: "Paris — Le Marais", lat: 48.8579, lng: 2.3583, location: "Café dans le Marais (Place des Vosges area), 4e arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Caf%C3%A9_%22le_Cirque%22%2C_rue_Saint-Martin_%2849475149796%29.jpg/1920px-Caf%C3%A9_%22le_Cirque%22%2C_rue_Saint-Martin_%2849475149796%29.jpg", credit: "Wikimedia Commons / Gabriel de Andrade Fernandes fro…", photoSrc: "https://commons.wikimedia.org/wiki/File:Caf%C3%A9_%22le_Cirque%22,_rue_Saint-Martin_(49475149796).jpg", units: [{ num: 1, fr: "Et alors, tu aimes la France ?", en: "Narrate your arrival in France in a 4–5 sentence oral account using the passé composé. Express an opinion with je trouve que… and discover what international residents find surprising about French life." }] },
          { id: "lsf-el-problem", city: "Paris — Hôtel", lat: 48.8636, lng: 2.3264, location: "Hôtel de l'Opéra area (9e arrondissement) — signalling a problem at reception", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Reception_desk_in_a_parisian_hotel_%2833206612983%29.jpg/1920px-Reception_desk_in_a_parisian_hotel_%2833206612983%29.jpg", credit: "Wikimedia Commons / Luca Sartoni from Vienna, Austria", photoSrc: "https://commons.wikimedia.org/wiki/File:Reception_desk_in_a_parisian_hotel_(33206612983).jpg", units: [{ num: 2, fr: "Il y a un problème…", en: "Signal a problem clearly, make a polite request using est-ce que vous pouvez ?, and hold your ground if the first response is a refusal. Handle at least 2 unexpected twists." }] },
          { id: "lsf-el-rdv", city: "Paris — Cabinet médical", lat: 48.8706, lng: 2.3290, location: "Cabinet médical, 9e arrondissement (phone appointment with a French doctor or specialist)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Rotterdam_-_Kunsthal_%284%29.jpg/1920px-Rotterdam_-_Kunsthal_%284%29.jpg", credit: "Wikimedia Commons / Fred Romero from Paris, France", photoSrc: "https://commons.wikimedia.org/wiki/File:Rotterdam_-_Kunsthal_(4).jpg", units: [{ num: 3, fr: "Prendre rendez-vous", en: "Make an appointment by phone: introduce yourself, state the purpose of your call, and negotiate an alternative slot if the first is unavailable." }] },
          { id: "lsf-el-sortir", city: "Paris — Opéra Garnier", lat: 48.8719, lng: 2.3316, location: "Opéra Garnier (Palais Garnier), Place de l'Opéra, 9e arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Palais_Garnier_Paris_June_2010_001.jpg/1920px-Palais_Garnier_Paris_June_2010_001.jpg", credit: "Wikimedia Commons / King of Hearts", photoSrc: "https://commons.wikimedia.org/wiki/File:Palais_Garnier_Paris_June_2010_001.jpg", units: [{ num: 4, fr: "Sortir à Paris", en: "Propose an outing with a day and venue, reserve tickets, and accept or decline with a reason. Agree on a meeting point and time. Discover the cultural offer of French cities." }, { num: 6, fr: "⚡ Speed dating : La vie à Paris", en: "Chain the 5 speech acts from Units 1–5 in a speed dating format with one unexpected prompt per situation and no written support." }] },
          { id: "lsf-el-work", city: "Paris — La Défense", lat: 48.8924, lng: 2.2386, location: "La Défense (Paris business district — professional introductions and project talk)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Entr%C3%A9e_%C2%AB_Grande_Arche_%C2%BB_de_la_gare_de_la_D%C3%A9fense_%28C%C5%93ur_Transport%29_%281%29.jpg/1920px-Entr%C3%A9e_%C2%AB_Grande_Arche_%C2%BB_de_la_gare_de_la_D%C3%A9fense_%28C%C5%93ur_Transport%29_%281%29.jpg", credit: "Wikimedia Commons / Remontees", photoSrc: "https://commons.wikimedia.org/wiki/File:Entr%C3%A9e_%C2%AB_Grande_Arche_%C2%BB_de_la_gare_de_la_D%C3%A9fense_(C%C5%93ur_Transport)_(1).jpg", units: [{ num: 5, fr: "Mon travail, mes projets", en: "Give a 5-sentence semi-formal professional introduction: name your job and sector, describe your work environment, and talk about a near-future project using je vais + infinitif." }] },
          { id: "lsf-el-recit", city: "Paris — Musée d'Orsay", lat: 48.8600, lng: 2.3266, location: "Musée d'Orsay (Impressionist and Post-Impressionist collections), 7e arrondissement", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Paris_-_Mus%C3%A9e_d%27Orsay_8490.jpg/1920px-Paris_-_Mus%C3%A9e_d%27Orsay_8490.jpg", credit: "Wikimedia Commons / Phyrexian", photoSrc: "https://commons.wikimedia.org/wiki/File:Paris_-_Mus%C3%A9e_d%27Orsay_8490.jpg", units: [{ num: 7, fr: "Je t'explique…", en: "Narrate a recent event in 4–5 sentences using the passé composé with avoir. Sequence with d'abord… et ensuite…, and respond to one off-script question." }] },
          { id: "lsf-el-admin", city: "Paris — Bureau de poste", lat: 48.8654, lng: 2.3489, location: "Bureau de poste (La Poste branch), 2e arrondissement — administrative tasks at bank or post office", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/La_Poste%2C_49-51_rue_La_Bo%C3%A9tie%2C_Paris_8e_3.jpg/1920px-La_Poste%2C_49-51_rue_La_Bo%C3%A9tie%2C_Paris_8e_3.jpg", credit: "Wikimedia Commons / Celette", photoSrc: "https://commons.wikimedia.org/wiki/File:La_Poste,_49-51_rue_La_Bo%C3%A9tie,_Paris_8e_3.jpg", units: [{ num: 8, fr: "Vie pratique", en: "Handle a simple administrative task at a bank or post office: state your request in formal register, understand the procedure, and write a short 2–3 sentence complaint message." }] },
          { id: "lsf-el-culture", city: "Paris — Belleville", lat: 48.8718, lng: 2.3798, location: "Belleville (multicultural neighbourhood, 20e arrondissement — decoding French cultural implicits)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Rue_de_Belleville_June_2010.jpg/1920px-Rue_de_Belleville_June_2010.jpg", credit: "Wikimedia Commons / Aleksandr Zykov from Russia", photoSrc: "https://commons.wikimedia.org/wiki/File:Rue_de_Belleville_June_2010.jpg", units: [{ num: 9, fr: "Comprendre les Français", en: "Decode two French cultural situations, identify an implicit refusal, and react appropriately. Use clarification strategies and compare with your own cultural background." }, { num: 10, fr: "⚡ Speed dating : Ma vie en France", en: "Final consolidation of all LSF Elementary speech acts in entirely free production. Five situations at random from Units 1–9, adapting register (formal/informal) as required." }] }
        ],
        routeOrder: ["lsf-el-cafe-opinion", "lsf-el-problem", "lsf-el-rdv", "lsf-el-sortir", "lsf-el-work", "lsf-el-recit", "lsf-el-admin", "lsf-el-culture"]
      }
    ]
  };

  /* ---------- CONFIG ---------- */
  var GOLD = '#C8A96B';
  // CARTO "dark-matter" raster — the brand's dark-navy luxury basemap.
  // (Reverted from voyager per user; keeps the premium night-map look
  //  with gold journey markers reading cleanly on a dark canvas.)
  var DARK_TILES = [
    'https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
    'https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
    'https://c.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
    'https://d.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
  ];
  var ATTRIB = '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>';
  var FRANCE_CENTER = [2.6, 46.6];
  var FRANCE_ZOOM = 5.1;
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

    // Floating real-place photo card (top-left, 3D pop on click)
    var photoPop = el('figure', 'ms-photo-pop');
    photoPop.setAttribute('aria-hidden', 'true');
    stage.appendChild(photoPop);

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
        'carto-dark': {
          type: 'raster',
          tiles: DARK_TILES,
          tileSize: 256,
          attribution: ATTRIB
        }
      },
      layers: [
        { id: 'bg', type: 'background', paint: { 'background-color': '#00001F' } },
        { id: 'carto-dark', type: 'raster', source: 'carto-dark',
          paint: { 'raster-opacity': 1, 'raster-saturation': 0.05, 'raster-contrast': 0.08, 'raster-brightness-max': 0.92 } }
      ]
    };

    map = new maplibregl.Map({
      container: mapEl.id,
      style: style,
      center: FRANCE_CENTER,
      zoom: compact ? FRANCE_ZOOM - 0.2 : FRANCE_ZOOM,
      pitch: MAP_PITCH,
      bearing: MAP_BEARING,
      minZoom: 4.2,
      maxZoom: 12,
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

      // WIDE outer BLUE NEON halo — the gorgeous always-on shine beneath the trail
      map.addLayer({
        id: 'ms-route-neon', type: 'line', source: 'ms-route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#2FA4FF', 'line-width': 38, 'line-opacity': 0.30, 'line-blur': 26 }
      });
      // Inner brighter neon core for a luminous, electric edge
      map.addLayer({
        id: 'ms-route-neon2', type: 'line', source: 'ms-route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#6FC4FF', 'line-width': 16, 'line-opacity': 0.34, 'line-blur': 10 }
      });
      // Soft, wide gold aura beneath the path — gives a luxurious glow, NOT a hard line
      map.addLayer({
        id: 'ms-route-glow', type: 'line', source: 'ms-route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': GOLD, 'line-width': 12, 'line-opacity': 0.30, 'line-blur': 9 }
      });
      // Elegant dotted path: round caps + tight dasharray render as soft DOTS,
      // so it reads as a refined journey trail rather than a metro/train line.
      map.addLayer({
        id: 'ms-route-base', type: 'line', source: 'ms-route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#EAD49B', 'line-width': 3.2, 'line-opacity': 0.9, 'line-dasharray': [0, 2.1] }
      });
      // A single gentle travelling comet of light that drifts along the trail
      map.addLayer({
        id: 'ms-route-anim', type: 'line', source: 'ms-route-anim',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#BFE4FF', 'line-width': 7, 'line-opacity': 0.85, 'line-blur': 2 }
      });

      setJourney(DATA.courses[0].id, false);
    });

    map.on('error', function (e) { /* tile load errors are non-fatal */ });

    /* ----- GeoJSON helpers ----- */
    function emptyFC() { return { type: 'FeatureCollection', features: [] }; }
    function lineFeature(coords) {
      return { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: coords } }] };
    }
    /* Catmull-Rom spline -> smooth flowing curve through every stop.
       Turns the jagged straight-line zigzag into one elegant journey trail. */
    function smoothPath(pts, segments) {
      if (!pts || pts.length < 3) return pts ? pts.slice() : [];
      segments = segments || 22;
      var out = [];
      var p = pts.slice();
      // pad ends so the curve reaches the first/last point cleanly
      p.unshift(pts[0]);
      p.push(pts[pts.length - 1]);
      for (var i = 1; i < p.length - 2; i++) {
        var p0 = p[i - 1], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2];
        for (var t = 0; t < segments; t++) {
          var s = t / segments, s2 = s * s, s3 = s2 * s;
          var x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * s +
            (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * s2 +
            (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * s3);
          var y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * s +
            (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * s2 +
            (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * s3);
          out.push([x, y]);
        }
      }
      out.push(pts[pts.length - 1]);
      return out;
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
        // Anchor at CENTER so the numbered disc sits exactly on its route
        // point — 'bottom' floated the disc above the line, detaching pins
        // from the journey curve.
        var mk = new maplibregl.Marker({ element: node, anchor: 'center' })
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
      // Populate the separate top-left photo pop-up (real place image, 3D)
      if (p.image) {
        photoPop.innerHTML =
          '<span class="ms-photo-pop-glow" aria-hidden="true"></span>' +
          '<img class="ms-photo-pop-img" src="' + esc(p.image) + '" alt="' + esc(p.city) + '" loading="eager" decoding="async">' +
          '<figcaption class="ms-photo-pop-cap">' +
            '<span class="ms-photo-pop-step">Stop ' + (idx + 1) + '</span>' +
            '<span class="ms-photo-pop-city">' + esc(p.city) + '</span>' +
            (p.credit ? '<span class="ms-photo-pop-credit">' + esc(p.credit) + '</span>' : '') +
          '</figcaption>';
        photoPop.classList.remove('open');
        // force reflow so the pop animation re-triggers each click
        void photoPop.offsetWidth;
        photoPop.classList.add('open');
        photoPop.setAttribute('aria-hidden', 'false');
      } else {
        photoPop.classList.remove('open');
        photoPop.setAttribute('aria-hidden', 'true');
        photoPop.innerHTML = '';
      }
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
      // Ease toward the stop without losing journey context. On phones keep
      // the flat top-down view and never collapse below a city zoom, so the
      // surrounding stops stay in frame when the bottom sheet opens.
      if (ready) {
        var narrow = (window.matchMedia && window.matchMedia('(max-width:760px)').matches) || window.innerWidth <= 760;
        var opt = { center: [p.lng, p.lat], pitch: narrow ? 0 : MAP_PITCH, duration: 750,
          offset: narrow ? [0, -150] : (compact ? [0, -30] : [-110, -10]) };
        if (narrow && map.getZoom() < 9) { opt.zoom = 10.6; }
        map.easeTo(opt);
      }
    }
    function closePanel() {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      photoPop.classList.remove('open');
      photoPop.setAttribute('aria-hidden', 'true');
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
      // Smooth, flowing curved trail through every stop (no more jagged zigzag)
      var curve = smoothPath(coords, 24);

      // route color per course
      map.setPaintProperty('ms-route-neon', 'line-color', '#2FA4FF');
      map.setPaintProperty('ms-route-glow', 'line-color', course.routeColor);
      map.setPaintProperty('ms-route-base', 'line-color', course.routeColor);
      map.getSource('ms-route').setData(lineFeature(curve));
      animateRoute(curve);

      // fit bounds to the journey
      var b = new maplibregl.LngLatBounds();
      coords.forEach(function (c) { b.extend(c); });
      // Responsive framing. The padding MUST be keyed to the real map size,
      // not the `compact` flag — map.html runs with compact=false even on a
      // phone, and the wide desktop padding (left 90 + right 416 = 506px)
      // exceeds a ~360px mobile map, so fitBounds silently fails ("Map cannot
      // fit within canvas") and the camera stays zoomed out over all France.
      var isNarrow = (window.matchMedia && window.matchMedia('(max-width:760px)').matches) ||
        window.innerWidth <= 760;
      var mapW = mapEl.offsetWidth || window.innerWidth;
      var mapH = mapEl.offsetHeight || window.innerHeight;
      var pad = (compact || isNarrow)
        ? { top: 70, bottom: 150, left: 38, right: 38 }
        : { top: 96, bottom: 110, left: 90, right: 416 };
      // Safety: never let padding swallow the canvas (keeps fitBounds valid).
      var maxH = Math.max(20, mapW * 0.34);
      var maxV = Math.max(20, mapH * 0.30);
      if (pad.left + pad.right > mapW * 0.72) { pad.left = Math.min(pad.left, maxH); pad.right = Math.min(pad.right, maxH); }
      if (pad.top + pad.bottom > mapH * 0.66) { pad.top = Math.min(pad.top, maxV); pad.bottom = Math.min(pad.bottom, maxV * 1.4); }
      // Compact Paris courses cluster tightly -> allow a closer zoom so the
      // curve reads as a real journey across the city, not a tiny tangle.
      // Cap a touch lower on phones so all stops fit without colliding pins.
      var tightCity = (course.id === 'fa-foundation' ||
        course.id === 'lsf-foundation' || course.id === 'lsf-beginner' ||
        course.id === 'lsf-elementary');
      var tightMax = isNarrow ? 11.2 : 12;
      // On phones, render the journey FLAT (pitch 0). The 40° tilt makes
      // fitBounds unpredictable in portrait and pushes the far end off-screen;
      // a top-down view frames a tall north-south route cleanly every time.
      var fitPitch = isNarrow ? 0 : MAP_PITCH;
      map.fitBounds(b, {
        padding: pad,
        pitch: fitPitch,
        bearing: MAP_BEARING,
        duration: userInitiated ? 1200 : 0,
        maxZoom: tightCity ? tightMax : (isNarrow ? 6.4 : 7.2)
      });
      // Open the first stop automatically so the map arrives alive, not empty
      // — with its photo card + lesson panel showing. DESKTOP ONLY: on mobile
      // the bottom sheet would cover the journey, so we leave the map clear
      // and let the user tap a stop.
      var firstPin = pins[0];
      if (firstPin && !compact && !isNarrow) {
        if (autoOpenTimer) { clearTimeout(autoOpenTimer); }
        autoOpenTimer = setTimeout(function () {
          openStop(course, firstPin, 0);
        }, userInitiated ? 900 : 650);
      }
    }
    var autoOpenTimer = null;

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
    if (first) { window.__mapstrInstance = mount(first); }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.Mapstr = { mount: mount, data: DATA };
})();
