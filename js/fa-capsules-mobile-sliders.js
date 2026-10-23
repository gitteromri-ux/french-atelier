/* Culture Capsules mobile sliders (2026-10-23 v3).
   - Slider marker sits ABOVE each slider (tabs + "Swipe" hint), never only at the bottom.
   - Prices start on the normal package (One capsule); swipe right for All three capsules, then Two.
   - Prices one section higher (before the films) on mobile only. Desktop untouched. */
(function () {
  var mq = window.matchMedia('(max-width: 767px)');
  var offers, watch, homeNext;

  function placeOffers() {
    offers = offers || document.getElementById('offers');
    watch = watch || document.getElementById('watch');
    if (!offers || !watch) return;
    if (homeNext === undefined) homeNext = offers.nextElementSibling;
    if (mq.matches) {
      if (offers.nextElementSibling !== watch) watch.parentNode.insertBefore(offers, watch);
    } else if (homeNext && offers.nextElementSibling !== homeNext) {
      homeNext.parentNode.insertBefore(offers, homeNext);
    }
  }

  function goTo(track, card, smooth) {
    var left = Math.max(0, card.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft || 0));
    if (smooth) { try { track.scrollTo({ left: left, behavior: 'smooth' }); return; } catch (e) {} }
    track.scrollLeft = left;
  }

  function slider(track, labelFor, hint) {
    if (!track || track.getAttribute('data-fa-sl')) return;
    track.setAttribute('data-fa-sl', '1');
    var cards = [].slice.call(track.children);
    var bar = document.createElement('div');
    bar.className = 'fa-sl-bar';
    var tabs = document.createElement('div');
    tabs.className = 'fa-sl-tabs';
    tabs.setAttribute('role', 'tablist');
    var btns = cards.map(function (card, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'fa-sl-tab';
      b.textContent = labelFor(card, i);
      b.addEventListener('click', function () { goTo(track, card, true); });
      tabs.appendChild(b);
      return b;
    });
    var hintEl = document.createElement('div');
    hintEl.className = 'fa-sl-hint';
    hintEl.innerHTML = '<span>' + hint + '</span><span class="fa-sl-arrow" aria-hidden="true">&rarr;</span>';
    bar.appendChild(tabs);
    bar.appendChild(hintEl);
    track.parentNode.insertBefore(bar, track);
    var next = document.createElement('button');
    next.type = 'button';
    next.className = 'fa-sl-next';
    next.setAttribute('aria-label', 'Next');
    next.innerHTML = '&rarr;';
    var wrap = document.createElement('div');
    wrap.className = 'fa-sl-wrap';
    track.parentNode.insertBefore(wrap, track);
    wrap.appendChild(track);
    wrap.appendChild(next);
    function current() {
      var x = track.scrollLeft + 4, best = 0;
      cards.forEach(function (c, i) { if (c.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft || 0) <= x) best = i; });
      return best;
    }
    function sync() {
      var i = current();
      btns.forEach(function (b, j) { b.setAttribute('aria-current', j === i ? 'true' : 'false'); });
      var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      next.style.opacity = atEnd ? '0' : '1';
      next.style.pointerEvents = atEnd ? 'none' : 'auto';
      hintEl.style.opacity = atEnd ? '.45' : '1';
    }
    next.addEventListener('click', function () { var i = current(); if (cards[i + 1]) goTo(track, cards[i + 1], true); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(sync); }, { passive: true });
    track.scrollLeft = 0;
    sync();
  }

  function planLabel(card) {
    var p = card.getAttribute('data-plan') || '';
    if (p === 'capsule-1') return '1 capsule';
    if (p === 'capsule-3') return 'All 3 capsules';
    return '2 capsules';
  }
  function themeLabel(card) {
    var t = card.querySelector('.title');
    return t ? t.textContent.replace(/\s+/g, ' ').trim() : '';
  }
  function teacherLabel(card) {
    var h = card.querySelector('h3');
    return h ? h.textContent.trim().split(' ')[0] : '';
  }

  function init() {
    placeOffers();
    if (!mq.matches) return;
    slider(document.querySelector('#capsules .kps-cards'), themeLabel, 'Swipe for all 3 capsules');
    slider(document.querySelector('#capsule-teachers .cap-faculty-grid'), teacherLabel, 'Swipe to meet all 3');
    slider(document.querySelector('#offers .kpz-grid'), planLabel, 'Swipe to compare packages');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  try { mq.addEventListener('change', function () { placeOffers(); init(); }); } catch (e) {}
})();
