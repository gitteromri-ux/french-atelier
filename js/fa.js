/* The French Atelier — shared interactions */
(function(){
  // Header scroll state
  var header=document.querySelector('.site-header');
  function onScroll(){ if(!header)return; if(window.scrollY>40)header.classList.add('scrolled');else header.classList.remove('scrolled'); }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  // Mobile drawer
  var toggle=document.querySelector('.nav-toggle');
  var drawer=document.querySelector('.nav-drawer');
  var close=document.querySelector('.nav-drawer-close');
  if(toggle&&drawer){ toggle.addEventListener('click',function(){drawer.classList.add('open');document.body.style.overflow='hidden';}); }
  if(close&&drawer){ close.addEventListener('click',function(){drawer.classList.remove('open');document.body.style.overflow='';}); }
  if(drawer){ drawer.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){drawer.classList.remove('open');document.body.style.overflow='';});}); }

  // Scroll reveal
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);} });
  },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});

  // Ambient autoplay-muted videos (.video-bg, .video-frame, .video-band)
  document.querySelectorAll('.video-bg video, .video-frame video, .video-band video').forEach(function(v){
    v.muted=true; v.setAttribute('muted','');
    v.setAttribute('playsinline','');
    v.play().catch(function(){});
  });

  // Interactive course worlds (accordion)
  document.querySelectorAll('[data-world] .world-head').forEach(function(head){
    head.addEventListener('click',function(){
      var world=head.closest('[data-world]');
      if(!world)return;
      var open=world.classList.contains('is-open');
      // close all others
      document.querySelectorAll('[data-world].is-open').forEach(function(w){
        if(w!==world){w.classList.remove('is-open');var h=w.querySelector('.world-head');if(h)h.setAttribute('aria-expanded','false');}
      });
      world.classList.toggle('is-open',!open);
      head.setAttribute('aria-expanded',String(!open));
    });
  });

  // Sorbonne pillars (click-to-open accordion cards, keyboard accessible)
  document.querySelectorAll('.sorb-pillar .sorb-ph').forEach(function(head){
    head.addEventListener('click',function(){
      var pillar=head.closest('.sorb-pillar');
      if(!pillar)return;
      var open=pillar.classList.contains('is-open');
      // close siblings within the same group for a clean single-open feel
      var group=pillar.parentNode;
      if(group){
        group.querySelectorAll('.sorb-pillar.is-open').forEach(function(p){
          if(p!==pillar){p.classList.remove('is-open');var h=p.querySelector('.sorb-ph');if(h)h.setAttribute('aria-expanded','false');}
        });
      }
      pillar.classList.toggle('is-open',!open);
      head.setAttribute('aria-expanded',String(!open));
    });
  });

  // Pillar motion videos (autoplay muted loop)
  document.querySelectorAll('.pillar video').forEach(function(v){
    v.muted=true; v.setAttribute('muted',''); v.setAttribute('playsinline','');
    v.loop=true; v.play().catch(function(){});
  });

  // Video sound opt-in (autoplay muted -> click to unmute)
  document.querySelectorAll('[data-soundvideo]').forEach(function(container){
    var v=container.querySelector('video');
    var btn=container.querySelector('.sound-toggle');
    if(!v)return;
    v.muted=true; v.play().catch(function(){});
    if(btn){
      btn.addEventListener('click',function(){
        v.muted=!v.muted;
        if(!v.muted){ v.play().catch(function(){}); }
        container.classList.toggle('unmuted',!v.muted);
        btn.setAttribute('aria-pressed',String(!v.muted));
      });
    }
  });
})();

/* ============================================================
   AGENT 5 — GLOBAL DESIGN SYSTEM INTERACTIONS
   modal open/close · marquee pause-on-hover · advisor-form
   validation + success · (scroll reveals + drawer handled above)
   Self-contained IIFE — does not touch accordion or pillar video.
   ============================================================ */
(function(){
  'use strict';

  /* ---------- Marquee: JS safeguard for pause-on-hover (CSS already handles) ---------- */
  document.querySelectorAll('.marquee').forEach(function(m){
    m.addEventListener('mouseenter',function(){m.classList.add('is-paused');});
    m.addEventListener('mouseleave',function(){m.classList.remove('is-paused');});
    // pause when offscreen for performance
    if('IntersectionObserver' in window){
      var track=m.querySelector('.marquee-track');
      if(track){
        new IntersectionObserver(function(es){
          es.forEach(function(e){track.style.animationPlayState=e.isIntersecting?'':'paused';});
        },{threshold:0}).observe(m);
      }
    }
  });

  /* ---------- Advisor modal: open via any [data-advisor] trigger ---------- */
  var modal=document.querySelector('.advisor-modal');
  var lastFocus=null;
  function openModal(){
    if(!modal)return;
    lastFocus=document.activeElement;
    modal.classList.add('open');
    document.body.classList.add('modal-open');
    modal.setAttribute('aria-hidden','false');
    var first=modal.querySelector('input,select,button');
    if(first)setTimeout(function(){first.focus();},60);
  }
  function closeModal(){
    if(!modal)return;
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
    modal.setAttribute('aria-hidden','true');
    if(lastFocus&&lastFocus.focus)lastFocus.focus();
  }
  document.querySelectorAll('[data-advisor]').forEach(function(trigger){
    trigger.addEventListener('click',function(e){e.preventDefault();openModal();});
  });
  if(modal){
    modal.querySelectorAll('.advisor-modal-close,[data-advisor-close]').forEach(function(b){
      b.addEventListener('click',closeModal);
    });
    modal.addEventListener('click',function(e){if(e.target===modal)closeModal();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&modal.classList.contains('open'))closeModal();});
  }

  /* ---------- Advisor form: client-side validation + success state ---------- */
  // NOTE: No backend invented. Falls back to mailto:advisor@eTeacherGroup.com.
  // ▶ TO WIRE A REAL ENDPOINT: replace the mailto block below with a
  //   fetch('https://YOUR-ENDPOINT', {method:'POST', body:new FormData(form)}) call.
  function setError(field,msg){
    field.classList.add('has-error');
    var el=field.querySelector('.err-msg');
    if(el)el.textContent=msg;
  }
  function clearError(field){field.classList.remove('has-error');}

  document.querySelectorAll('.advisor-form').forEach(function(form){
    form.setAttribute('novalidate','');
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var valid=true;
      var name=form.querySelector('[name="name"]');
      var email=form.querySelector('[name="email"]');
      var level=form.querySelector('[name="level"]');
      var time=form.querySelector('[name="time"]');

      [name,email,level,time].forEach(function(inp){if(inp)clearError(inp.closest('.field'));});

      if(name&&!name.value.trim()){setError(name.closest('.field'),'Please enter your name.');valid=false;}
      if(email){
        var ev=email.value.trim();
        if(!ev){setError(email.closest('.field'),'Please enter your email.');valid=false;}
        else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ev)){setError(email.closest('.field'),'Please enter a valid email.');valid=false;}
      }
      if(level&&!level.value){setError(level.closest('.field'),'Please choose your French level.');valid=false;}
      if(time&&!time.value){setError(time.closest('.field'),'Please pick a preferred time.');valid=false;}

      if(!valid){
        var firstErr=form.querySelector('.field.has-error input,.field.has-error select');
        if(firstErr)firstErr.focus();
        return;
      }

      // ----- Submission (mailto fallback — replace with real endpoint) -----
      var subject=encodeURIComponent('French Atelier — Advisor Request');
      var body=encodeURIComponent(
        'Name: '+(name?name.value:'')+'\n'+
        'Email: '+(email?email.value:'')+'\n'+
        'French level: '+(level?level.value:'')+'\n'+
        'Preferred time: '+(time?time.value:'')
      );
      window.location.href='mailto:advisor@eTeacherGroup.com?subject='+subject+'&body='+body;

      // ----- Success state -----
      var card=form.closest('.advisor-card')||form.parentNode;
      if(card){card.classList.add('is-success');}
      form.classList.add('is-success');
      form.reset();
    });

    // clear error as user edits
    form.querySelectorAll('input,select').forEach(function(inp){
      inp.addEventListener('input',function(){clearError(inp.closest('.field'));});
      inp.addEventListener('change',function(){clearError(inp.closest('.field'));});
    });
  });
})();

/* ============================================================
   COURSE PAGES — IIBS-level interactions (.cp-* / .faq-q)
   FAQ accordion · testimonial pause-offscreen · carousel nav
   Self-contained IIFE.
   ============================================================ */
(function(){
  'use strict';

  /* FAQ accordion (.faq-q toggles .faq-item.is-open) */
  document.querySelectorAll('.faq-q').forEach(function(q){
    q.setAttribute('aria-expanded','false');
    q.addEventListener('click',function(){
      var item=q.closest('.faq-item');
      if(!item)return;
      var open=item.classList.contains('is-open');
      item.classList.toggle('is-open',!open);
      q.setAttribute('aria-expanded',String(!open));
    });
  });

  /* FAQ accordion variant (.faq-btn[aria-expanded] toggles .faq-body.open) */
  document.querySelectorAll('.faq-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      var open=btn.getAttribute('aria-expanded')==='true';
      var body=document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded',String(!open));
      if(body)body.classList.toggle('open',!open);
    });
  });

  /* Testimonial marquee: pause when offscreen for perf */
  document.querySelectorAll('.cp-testi').forEach(function(m){
    var track=m.querySelector('.cp-testi-track');
    if(track&&'IntersectionObserver' in window){
      new IntersectionObserver(function(es){
        es.forEach(function(e){track.style.animationPlayState=e.isIntersecting?'':'paused';});
      },{threshold:0}).observe(m);
    }
  });

  /* Horizontal carousels (faculty + syllabus). Prev/next buttons via data-carousel-prev / -next pointing to a track id. */
  function scrollCarousel(id,dir){
    var track=document.getElementById(id);
    if(!track)return;
    var card=track.querySelector(':scope > *');
    var step=card?card.getBoundingClientRect().width+22:340;
    track.scrollBy({left:dir*step*1,behavior:'smooth'});
  }
  document.querySelectorAll('[data-carousel-prev]').forEach(function(b){
    b.addEventListener('click',function(){scrollCarousel(b.getAttribute('data-carousel-prev'),-1);});
  });
  document.querySelectorAll('[data-carousel-next]').forEach(function(b){
    b.addEventListener('click',function(){scrollCarousel(b.getAttribute('data-carousel-next'),1);});
  });
})();
