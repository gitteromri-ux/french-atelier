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

  // Scroll reveal — lenient: any sliver in view (or near it) reveals + never gets stuck
  var revealEls=[].slice.call(document.querySelectorAll('.reveal'));
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);} });
    },{threshold:0,rootMargin:'0px 0px 18% 0px'});
    revealEls.forEach(function(el){io.observe(el);});
    // Safety net: anything in or above the viewport that hasn't revealed yet gets revealed.
    var sweep=function(){
      var vh=window.innerHeight||800;
      revealEls.forEach(function(el){
        if(el.classList.contains('in'))return;
        var r=el.getBoundingClientRect();
        if(r.top < vh*1.15){ el.classList.add('in'); io.unobserve(el); }
      });
    };
    window.addEventListener('scroll',sweep,{passive:true});
    window.addEventListener('resize',sweep,{passive:true});
    sweep();
    // Absolute fallback: nothing stays invisible forever (fires fast so nothing ever looks broken).
    setTimeout(function(){ revealEls.forEach(function(el){ el.classList.add('in'); }); },1100);
    // Re-collect late-mounted reveal nodes and reveal anything already on-screen.
    setTimeout(function(){
      [].slice.call(document.querySelectorAll('.reveal:not(.in)')).forEach(function(el){ el.classList.add('in'); });
    },1800);
  } else {
    revealEls.forEach(function(el){el.classList.add('in');});
  }

  // Animated number counters (Acadomia power figures)
  var counters=document.querySelectorAll('[data-count]');
  if(counters.length){
    var cio=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting) return;
        var el=e.target; cio.unobserve(el);
        var target=parseFloat(el.getAttribute('data-count'))||0;
        var pre=el.getAttribute('data-prefix')||'', suf=el.getAttribute('data-suffix')||'';
        var dur=1400, start=null;
        function step(ts){
          if(start===null) start=ts;
          var p=Math.min((ts-start)/dur,1);
          var eased=1-Math.pow(1-p,3);
          var val=target<10?(Math.round(target*eased*10)/10):Math.round(target*eased);
          el.textContent=pre+val+suf;
          if(p<1) requestAnimationFrame(step); else el.textContent=pre+target+suf;
        }
        requestAnimationFrame(step);
      });
    },{threshold:.4});
    counters.forEach(function(c){cio.observe(c);});
  }

  // Ambient autoplay-muted videos — play EVERY autoplay/muted video sitewide,
  // including Juliane character clips (.jul-video, .jul-vid-card, .pm-main, .pm-sm),
  // even ones that mount below the fold (IntersectionObserver kicks them off).
  var ambient=[].slice.call(document.querySelectorAll('video[autoplay], video[muted], .video-bg video, .video-frame video, .video-band video, .jul-video-frame video, .jul-vid-card video, .pm-main video, .pm-sm video'));
  ambient.forEach(function(v){ v.muted=true; v.setAttribute('muted',''); v.setAttribute('playsinline',''); v.loop=true; v.play().catch(function(){}); });
  if('IntersectionObserver' in window && ambient.length){
    var vio=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.play().catch(function(){}); } });
    },{threshold:.05});
    ambient.forEach(function(v){ vio.observe(v); });
  }

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

  /* ============================================================
     COURSE CLUSTERS — two clickable header cards reveal a
     horizontal slider. Default: nothing open. Clicking a cluster
     opens its slider; clicking the same one again closes it;
     clicking the other swaps. Smooth animate. Arrows + drag.
     ============================================================ */
  (function initClusters(){
    var btns = document.querySelectorAll('.cls-card[data-cluster]');
    if(!btns.length) return;
    var hint = document.getElementById('cls-hint');
    var active = null;

    function reveal(key){ return document.getElementById('cls-track-'+key); }
    function btn(key){ return document.getElementById('cls-btn-'+key); }

    function closePanel(key){
      var r = reveal(key), b = btn(key);
      if(!r) return;
      r.classList.remove('is-open');
      if(b){ b.classList.remove('is-active'); b.setAttribute('aria-selected','false'); }
      // collapse after transition
      window.setTimeout(function(){ if(!r.classList.contains('is-open')) r.hidden = true; }, 480);
    }
    function openPanel(key){
      var r = reveal(key), b = btn(key);
      if(!r) return;
      r.hidden = false;
      // force reflow so the transition runs from hidden->open
      void r.offsetWidth;
      r.classList.add('is-open');
      if(b){ b.classList.add('is-active'); b.setAttribute('aria-selected','true'); }
      active = key;
      if(hint) hint.classList.add('is-hidden');
      updateArrows(r);
    }

    btns.forEach(function(b){
      b.addEventListener('click', function(){
        var key = b.getAttribute('data-cluster');
        if(active === key){
          // toggle closed
          closePanel(key);
          active = null;
          if(hint) hint.classList.remove('is-hidden');
          return;
        }
        if(active){ closePanel(active); }
        openPanel(key);
      });
    });

    /* ---- Slider: arrows ---- */
    function railOf(id){ return document.getElementById(id); }
    function stepWidth(rail){
      var card = rail.querySelector('.cls-course');
      if(!card) return 320;
      var gap = parseFloat(getComputedStyle(rail).columnGap || getComputedStyle(rail).gap || '0') || 0;
      return card.getBoundingClientRect().width + gap;
    }
    function updateArrows(scope){
      var rail = (scope||document).querySelector('.cls-rail');
      if(!rail) return;
      var slider = rail.closest('.cls-slider');
      if(!slider) return;
      var prev = slider.querySelector('.cls-arrow-prev');
      var next = slider.querySelector('.cls-arrow-next');
      var max = rail.scrollWidth - rail.clientWidth - 2;
      if(prev) prev.disabled = rail.scrollLeft <= 2;
      if(next) next.disabled = rail.scrollLeft >= max;
    }
    document.querySelectorAll('[data-slider-prev]').forEach(function(btn){
      var rail = railOf(btn.getAttribute('data-slider-prev'));
      if(!rail) return;
      btn.addEventListener('click', function(){ rail.scrollBy({left:-stepWidth(rail),behavior:'smooth'}); });
      rail.addEventListener('scroll', function(){ updateArrows(rail.closest('.cls-reveal')||rail.parentNode); }, {passive:true});
    });
    document.querySelectorAll('[data-slider-next]').forEach(function(btn){
      var rail = railOf(btn.getAttribute('data-slider-next'));
      if(!rail) return;
      btn.addEventListener('click', function(){ rail.scrollBy({left:stepWidth(rail),behavior:'smooth'}); });
    });
    window.addEventListener('resize', function(){
      document.querySelectorAll('.cls-reveal.is-open').forEach(updateArrows);
    }, {passive:true});

    /* ---- Slider: pointer drag ---- */
    document.querySelectorAll('.cls-rail').forEach(function(rail){
      var down=false, startX=0, startScroll=0, moved=0;
      rail.addEventListener('pointerdown', function(e){
        down=true; moved=0; startX=e.clientX; startScroll=rail.scrollLeft;
        rail.classList.add('is-dragging');
        try{ rail.setPointerCapture(e.pointerId); }catch(_){}
      });
      rail.addEventListener('pointermove', function(e){
        if(!down) return;
        var dx = e.clientX - startX;
        moved = Math.max(moved, Math.abs(dx));
        rail.scrollLeft = startScroll - dx;
      });
      function end(){
        if(!down) return;
        down=false; rail.classList.remove('is-dragging');
        updateArrows(rail.closest('.cls-reveal')||rail.parentNode);
      }
      rail.addEventListener('pointerup', end);
      rail.addEventListener('pointercancel', end);
      rail.addEventListener('pointerleave', end);
      // prevent click navigation right after a drag
      rail.addEventListener('click', function(e){
        if(moved > 8){ e.preventDefault(); e.stopPropagation(); }
      }, true);
    });
  })();

  /* ============================================================
     HOW IT WORKS — single-row moveable slider (arrows + drag)
     ============================================================ */
  (function(){
    var track = document.getElementById('hiw3-journey');
    if(!track) return;
    var prev = document.querySelector('[data-hiw-prev]');
    var next = document.querySelector('[data-hiw-next]');

    function stepW(){
      var step = track.querySelector('.hiw3-step');
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 0) || 20;
      return step ? (step.getBoundingClientRect().width + gap) : 240;
    }
    function updateArrows(){
      if(!prev || !next) return;
      var max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
      var noScroll = track.scrollWidth <= track.clientWidth + 4;
      prev.style.display = next.style.display = noScroll ? 'none' : '';
    }
    if(prev) prev.addEventListener('click', function(){ track.scrollBy({left:-stepW(),behavior:'smooth'}); });
    if(next) next.addEventListener('click', function(){ track.scrollBy({left:stepW(),behavior:'smooth'}); });
    track.addEventListener('scroll', updateArrows, {passive:true});
    window.addEventListener('resize', updateArrows, {passive:true});
    setTimeout(updateArrows, 60);

    /* pointer drag */
    var down=false, startX=0, startScroll=0, moved=0;
    track.addEventListener('pointerdown', function(e){
      down=true; moved=0; startX=e.clientX; startScroll=track.scrollLeft;
      track.classList.add('is-dragging');
      try{ track.setPointerCapture(e.pointerId); }catch(_){}
    });
    track.addEventListener('pointermove', function(e){
      if(!down) return;
      var dx=e.clientX-startX; moved=Math.max(moved,Math.abs(dx));
      track.scrollLeft = startScroll - dx;
    });
    function end(){ if(!down) return; down=false; track.classList.remove('is-dragging'); updateArrows(); }
    track.addEventListener('pointerup', end);
    track.addEventListener('pointercancel', end);
    track.addEventListener('pointerleave', end);
    track.addEventListener('click', function(e){ if(moved>8){ e.preventDefault(); e.stopPropagation(); } }, true);
  })();
})();
