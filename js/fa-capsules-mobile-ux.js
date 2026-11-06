/* Visual overlap prevention only. No analytics, storage, network or form calls. */
(function () {
  function init() {
    [
      ['#how .kps-rail', 'How it works'],
      ['#watch .kpx-vids', 'Meet the programme'],
      ['.kps-trust .row', 'About the school'],
      ['#speakers .kps-steps', 'Inside a class'],
      ['#learn .cols', 'What you will learn'],
      ['.kps-read .grid', 'Read more']
    ].forEach(function (item, index) {
      var track = document.querySelector(item[0]);
      if (!track || track.children.length < 2) return;
      var slides = Array.prototype.slice.call(track.children);
      track.setAttribute('data-fa-mobile-rail', '');
      track.id = track.id || 'fa-mobile-rail-' + index;
      var nav = document.createElement('div');
      nav.className = 'fa-mobile-rail-nav';
      var status = document.createElement('span');
      status.textContent = '1 / ' + slides.length + ' · Swipe to explore';
      var prev = document.createElement('button');
      var next = document.createElement('button');
      [prev, next].forEach(function (button) {
        button.type = 'button';
        button.setAttribute('aria-controls', track.id);
      });
      prev.textContent = '←';
      next.textContent = '→';
      prev.setAttribute('aria-label', 'Previous: ' + item[1]);
      next.setAttribute('aria-label', 'Next: ' + item[1]);
      nav.append(status, prev, next);
      track.parentNode.insertBefore(nav, track);
      var active = 0;
      function update() {
        var start = slides[0].offsetLeft;
        var distance = Infinity;
        slides.forEach(function (slide, i) {
          var delta = Math.abs(slide.offsetLeft - start - track.scrollLeft);
          if (delta < distance) { distance = delta; active = i; }
        });
        status.textContent = (active + 1) + ' / ' + slides.length + ' · Swipe to explore';
        prev.disabled = active === 0;
        next.disabled = active === slides.length - 1;
      }
      function move(delta) {
        var target = Math.max(0, Math.min(slides.length - 1, active + delta));
        track.scrollTo({
          left: slides[target].offsetLeft - slides[0].offsetLeft,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
        });
      }
      prev.addEventListener('click', function () { move(-1); });
      next.addEventListener('click', function () { move(1); });
      track.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update, { passive: true });
      update();
    });
    var hero = document.querySelector('.kps-hero');
    if (!hero) return;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        document.body.classList.toggle('fa-hero-visible', entries[0].isIntersecting);
      }, { threshold: 0 }).observe(hero);
    } else {
      document.body.classList.remove('fa-hero-visible');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
