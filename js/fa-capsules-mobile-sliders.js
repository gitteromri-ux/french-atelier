/* Culture Capsules mobile sliders (2026-10-23 v3).
   - Slider marker sits ABOVE each slider (tabs + "Swipe" hint), never only at the bottom.
   - 2026-10-30: prices start on All three capsules ($63 a month per capsule, as in the ads); swipe for One, then Two.
   - Prices sit right under the three capsules (before How it works) on mobile only. Desktop untouched. */
(function () {
  var mq = window.matchMedia('(max-width: 767px)');
  var offers, anchor, homeNext, allCard, oneCard;

  /* 2026-10-30 mobile pack: on phones the prices sit directly under the three capsules (before "How it
     works"), and the slider opens on "All three capsules" at $63 a month per capsule, the price the ads
     quote. Desktop order and desktop card order are untouched. */
  function placeOffers() {
    offers = offers || document.getElementById('offers');
    anchor = anchor || document.getElementById('how') || document.getElementById('watch');
    if (!offers || !anchor) return;
    if (homeNext === undefined) homeNext = offers.nextElementSibling;
    allCard = allCard || offers.querySelector('.kpz-card.kpz-all');
    oneCard = oneCard || offers.querySelector('.kpz-card.kpz-one');
    if (mq.matches) {
      if (offers.nextElementSibling !== anchor) anchor.parentNode.insertBefore(offers, anchor);
      if (allCard && oneCard && allCard.nextElementSibling !== oneCard) oneCard.parentNode.insertBefore(allCard, oneCard);
    } else {
      if (homeNext && offers.nextElementSibling !== homeNext) homeNext.parentNode.insertBefore(offers, homeNext);
      if (allCard && oneCard && oneCard.nextElementSibling !== allCard) oneCard.parentNode.insertBefore(allCard, oneCard.nextElementSibling);
    }
    var n = 0; offers.querySelectorAll('.kpz-card .kpz-num').forEach(function (el) { n += 1; el.textContent = (n < 10 ? '0' : '') + n; });
  }

  function goTo(track, card, smooth) {
    var tr = track.getBoundingClientRect(), pad = parseFloat(getComputedStyle(track).paddingLeft || 0);
    var left = Math.max(0, track.scrollLeft + card.getBoundingClientRect().left - tr.left - pad);
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
      /* the card whose left edge is closest to the slider's start edge */
      var tr = track.getBoundingClientRect(), start = tr.left + parseFloat(getComputedStyle(track).paddingLeft || 0);
      var best = 0, bestD = 1e9;
      cards.forEach(function (c, i) { var d = Math.abs(c.getBoundingClientRect().left - start); if (d < bestD) { bestD = d; best = i; } });
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) best = cards.length - 1;
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
