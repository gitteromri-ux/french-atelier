/* French Atelier — teacher bio dialogs (teachers.html). Bios verbatim from Acadomia
   (Craig Taylor, "FA Teachers info.xlsx", 12 Jun 2025; Charline Georges → Keren Ziv,
   "New teachers info september 2026.xlsx", 19 Oct 2026) and, for Caitlin, Charline and Philippe,
   from the previous site livefrenchatelier.com/teacher/{beta,zeta,delta}. */
(function(){
  var T = {
    caitlin: {name:'Caitlin', full:'Caitlin', region:'Strasbourg · Alsace', img:'assets/teachers/upscaled/caitlin.jpg', quote:'Great French isn’t just spoken—it’s understood between the lines. We practice the subtleties that shape connection.',
      bio:['French-American and raised between two cultures, Caitlin blends clarity, empathy, and insight into each session. She’s especially skilled at bridging cultural nuances for learners navigating both.','Living in Strasbourg, she draws daily inspiration from the city’s blend of German and French architecture — and teaches you how language reflects identity.'],
      facts:[['Role','Senior French Tutor'],['Experience','12+ years']]},
    charline: {name:'Charline', full:'Charline', region:'Paris · Île-de-France', img:'assets/teachers/upscaled/charline.jpg', quote:'Language becomes meaningful when tied to real life. That’s when it moves from memory to instinct.',
      bio:['With a background in teaching French in the UK and the US, Charline brings a refined sensibility and a love for elegance to every class. Her teaching embodies French poise, precision, and cultural finesse.','Based in Paris, she’ll guide you through the subtleties of French etiquette — from café conversations to the art of saying just enough.'],
      facts:[['Role','Senior French Teacher'],['Experience','15+ years']]},
    philippe: {name:'Philippe', full:'Philippe', region:'West Paris · Île-de-France', img:'assets/teachers/upscaled/philippe.jpg', quote:'Fluency is not speed—it’s depth. Together, we shape how you sound, think, and respond in French.',
      bio:['With over 15 years abroad, Philippe brings global perspective and a deep passion for French history. His lessons are rich in context, always linking grammar to cultural meaning.','From his home in the west of Paris, Philippe often leads his students on linguistic journeys through centuries — from the Sun King to the Empire.'],
      facts:[['Role','Senior French Teacher'],['Experience','15 years']]},
    carmele: {name:'Carmèle', full:'Carmèle Savarino', region:'Paris · Île-de-France', img:'assets/teachers/upscaled/carmele.jpg',
      bio:['Say bonjour to Carmèle! A passionate FLE instructor with experience at the Alliance Française in Manila, she also creates fun and effective learning content. From the heart of Paris—city of lights, style, and café culture—she brings elegance and energy to every lesson!'],
      facts:[]},
    shanice: {name:'Shanice', full:'Shanice Thobor', region:'Montpellier · Occitanie', img:'assets/teachers/upscaled/shanice.jpg',
      bio:['Meet Shanice! A cheerful and dynamic Franco-Canadian from sunny Montpellier, Shanice brings 15 years of teaching experience—and a whole lot of good vibes! She’s here to make French fun, fresh, and full of culture.'],
      facts:[['Experience','15 years of teaching']]},
    delphine: {name:'Delphine', full:'Delphine Sauzéat', region:'Florensac · Occitanie', img:'assets/teachers/upscaled/delphine-reframed.jpg?v=3',
      bio:['With a profound commitment to intercultural understanding and language education, I have cultivated a diverse career spanning more than a decade in hospitality, tourism, and international cooperation. My role as a French as a Foreign Language educator has allowed me to design and implement dynamic learning programs that intertwine language acquisition with intercultural awareness, tailored to the unique needs of learners from various backgrounds. Through my multilingual journey, I actively seek to create impactful projects that unite languages, cultures, and places; thus fostering meaningful connections and enriching educational experiences.'],
      facts:[['Profession','French teacher'],['Experience','7 years'],['Education','Master’s Degree in Teaching French as a Foreign Language, specialisation in Digital Technologies and Plurilingualism — graduated with distinction'],['Languages','French (native, C2) · Spanish (C2) · English (C1.1)']]},
    christ: {name:'Christ', full:'Christ Fadel', region:'Strasbourg · Alsace', img:'assets/teachers/upscaled/christ.jpg?v=2',
      bio:['I would describe myself as a very hyperactive, jack of all master of none kind of person: I have a very wide array of interests and am always up to learn more. My favorite hobby is learning ancient languages (I have reading knowledge of about a dozen of them) and teaching is my calling since I was 17 years of age.'],
      facts:[['Profession','Classics teacher and stage actor'],['Experience','10 years of tutoring, 2 years of in-classroom teaching'],['Education','Bachelor’s degree in Classics, University of Strasbourg'],['Languages','French C2 · English C2 · Italian C2 · Arabic C2 · German B2 · Alsatian B2 · Greek B1 · Chinese A2']]}
  };
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  var root=null, lastFocus=null;
  function build(){
    if(root) return root;
    root=document.createElement('div'); root.className='tb-overlay'; root.setAttribute('aria-hidden','true');
    root.innerHTML='<div class="tb-dialog" role="dialog" aria-modal="true" aria-labelledby="tbName"><button type="button" class="tb-close" aria-label="Close">×</button><div class="tb-photo"><img alt=""></div><div class="tb-body"><p class="tb-eyebrow"></p><h3 id="tbName" class="tb-name"></h3><blockquote class="tb-quote"></blockquote><div class="tb-bio"></div><dl class="tb-facts"></dl></div></div>';
    document.body.appendChild(root);
    root.addEventListener('click',function(e){ if(e.target===root||e.target.closest('.tb-close')) close(); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&root.classList.contains('is-open')) close(); });
    return root;
  }
  function open(slug){
    var t=T[slug]; if(!t) return;
    var r=build();
    r.querySelector('.tb-photo img').src=t.img; r.querySelector('.tb-photo img').alt=t.full+', French teacher';
    r.querySelector('.tb-eyebrow').textContent=t.region;
    r.querySelector('.tb-name').textContent=t.full;
    var q=r.querySelector('.tb-quote'); q.textContent=t.quote||''; q.style.display=t.quote?'':'none';
    r.querySelector('.tb-bio').innerHTML=t.bio.map(function(p){return '<p>'+esc(p)+'</p>';}).join('');
    r.querySelector('.tb-facts').innerHTML=t.facts.map(function(f){return '<div><dt>'+esc(f[0])+'</dt><dd>'+esc(f[1])+'</dd></div>';}).join('');
    lastFocus=document.activeElement;
    r.classList.add('is-open'); r.setAttribute('aria-hidden','false'); document.documentElement.classList.add('tb-lock');
    r.querySelector('.tb-close').focus();
    if(location.hash!=='#bio-'+slug) history.replaceState(null,'','#bio-'+slug);
  }
  function close(){
    if(!root) return;
    root.classList.remove('is-open'); root.setAttribute('aria-hidden','true'); document.documentElement.classList.remove('tb-lock');
    if(/^#bio-/.test(location.hash)) history.replaceState(null,'',location.pathname+location.search);
    if(lastFocus&&lastFocus.focus) lastFocus.focus();
  }
  function init(){
    document.querySelectorAll('[data-teacher-bio]').forEach(function(card){
      var slug=card.getAttribute('data-teacher-bio'); if(!T[slug]) return;
      card.classList.add('has-bio'); card.setAttribute('tabindex','0'); card.setAttribute('role','button');
      card.setAttribute('aria-label','Read '+T[slug].full+'’s full bio');
      card.addEventListener('click',function(e){ e.preventDefault(); open(slug); });
      card.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(slug);} });
    });
    var m=location.hash.match(/^#bio-([a-z]+)$/); if(m&&T[m[1]]){ setTimeout(function(){ var c=document.querySelector('[data-teacher-bio="'+m[1]+'"]'); if(c) c.scrollIntoView({block:'center'}); open(m[1]); },250); }
    window.addEventListener('hashchange',function(){ var m=location.hash.match(/^#bio-([a-z]+)$/); if(m&&T[m[1]]) open(m[1]); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
