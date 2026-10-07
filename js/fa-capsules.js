/* Culture Capsules page — hero theme rotation, capsule reveals, lazy motion. */
(function () {
  'use strict';
  [].slice.call(document.querySelectorAll('.kps-hero video')).forEach(function (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); });

  /* ---- capsule cards → reveal (one open at a time) ---- */
  var cards = [].slice.call(document.querySelectorAll('.kps-card[data-pack]'));
  var reveals = [].slice.call(document.querySelectorAll('.kps-reveal[data-pack]'));
  function openPack(id, scroll) {
    cards.forEach(function (c) { var on = c.getAttribute('data-pack') === id; c.classList.toggle('is-open', on); c.setAttribute('aria-expanded', on ? 'true' : 'false'); });
    reveals.forEach(function (r) {
      var on = r.getAttribute('data-pack') === id; r.classList.toggle('is-open', on);
      var v = r.querySelector('video'); if (!v) return;
      if (on) {
        var s = v.querySelector('source[data-src]'); if (s) { s.src = s.getAttribute('data-src'); s.removeAttribute('data-src'); v.load(); }
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      } else { try { v.pause(); } catch (e) {} }
    });
    if (scroll) {
      var target = document.getElementById('kps-reveal-' + id);
      if (target) setTimeout(function () { var y = target.getBoundingClientRect().top + window.pageYOffset - 80; window.scrollTo({ top: y, behavior: 'smooth' }); }, 60);
    }
    try { history.replaceState(null, '', id ? '#capsule-' + id : location.pathname + location.search); } catch (e) {}
  }
  cards.forEach(function (c) {
    function toggle() { var id = c.getAttribute('data-pack'); openPack(c.classList.contains('is-open') ? null : id, !c.classList.contains('is-open')); }
    c.addEventListener('click', toggle);
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });
  var m = /#capsule-(fashion|gastro|cinema)/.exec(location.hash);
  if (m) openPack(m[1], true);

  /* ---- hero/final video autoplay guard (iOS low-power) ---- */
  [].slice.call(document.querySelectorAll('.kps-final video')).forEach(function (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); });
})();
