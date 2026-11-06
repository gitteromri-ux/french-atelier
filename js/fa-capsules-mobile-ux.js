/* Visual overlap prevention only. No analytics, storage, network or form calls. */
(function () {
  function init() {
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
