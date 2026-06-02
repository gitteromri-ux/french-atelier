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
