/* Campaign-entry filter only. Not authentication: shared URLs and client-side bypass remain possible. */
(function () {
  'use strict';
  var K = 'fa_capsules_campaign_access_v1', TTL = 8 * 60 * 60 * 1000;
  var q = new URLSearchParams(location.search), path = location.pathname.replace(/\/+$/, '');
  var pairs = {'116980:108761':true,'116939:108758':true,'116939:108757':true};
  function one(k) { var a=q.getAll(k); return a.length===1 ? a[0] : ''; }
  var review=one('fa_review')==='capsules' && one('qa')==='1' && one('env')==='staging';
  var entry = !!pairs[one('cid')+':'+one('adGroupID')] &&
    one('utm_source').toLowerCase()==='facebook' && one('cq_src').toLowerCase()==='facebook';
  var grant = null;
  try { grant=JSON.parse(sessionStorage.getItem(K)||'null'); } catch(e) {}
  if (!grant || !pairs[grant.pair] || !Number.isFinite(grant.ts) || Date.now()-grant.ts>TTL || grant.ts>Date.now()) grant=null;
  if (entry && !review) {
    grant={pair:one('cid')+':'+one('adGroupID'),ts:Date.now(),query:location.search.slice(1)};
    try { sessionStorage.setItem(K,JSON.stringify(grant)); } catch(e) {}
  }
  var capsulePage=/(?:^|\/)(?:culture-capsules(?:-enroll)?|capsules)(?:\.html)?$/.test(path);
  var checkout=/(?:^|\/)enroll-checkout(?:\.html)?$/.test(path);
  var capsuleCheckout=checkout && /^capsule-[123]$/.test(q.get('product')||'');
  /* Do not interrupt an already-started payment during rollout. This exception does not grant LP access. */
  var existing=false;
  if (capsuleCheckout) try {
    var ids=JSON.parse(sessionStorage.getItem('fa_ck_ids_v1')||'null');
    existing=!!(ids && ids.env==='production' && ids.product===q.get('product') && ids.stid && ids.orderid &&
      Number.isFinite(ids.ts) && Date.now()-ids.ts>=0 && Date.now()-ids.ts<2*60*60*1000);
  } catch(e) {}
  var denied=(capsulePage||capsuleCheckout) && !grant && !existing && !review;
  window.FA_CAPSULE_ACCESS={allowed:!!grant||review,denied:denied,existingCheckout:existing,preview:review};
  var style=document.createElement('style');
  style.textContent=denied
    ? 'body>*:not(#fa-campaign-access-message){display:none!important}#fa-campaign-access-message{display:flex!important;min-height:100vh;align-items:center;justify-content:center;background:#101c30;color:#f2ede3;padding:32px;box-sizing:border-box;font:18px/1.6 Arial,sans-serif}#fa-campaign-access-message section{max-width:640px}#fa-campaign-access-message h1{font-size:clamp(32px,6vw,54px);line-height:1.12}#fa-campaign-access-message a{color:#8bcdff;text-decoration:underline}'
    : (!grant && !review ? 'a[href*="culture-capsules"],a[href$="/capsules"],a[href$="capsules.html"]{display:none!important}' : '');
  document.head.appendChild(style);
  function ready() {
    if (denied) {
      var node=document.createElement('main'); node.id='fa-campaign-access-message';
      node.innerHTML='<section><h1>Welcome to The French Atelier</h1><p>Discover our French courses, meet our teachers and find the right programme for you.</p><p><a href="/pricing.html">Explore our French courses</a></p><p><a href="/teachers.html">Meet our teachers</a></p></section>';
      document.body.appendChild(node);
    } else if (review) {
      /* Explicit review-only links use the existing QA/staging modes, never ad attribution. */
      function reviewLinks(){ document.querySelectorAll('a[href]').forEach(function(a){
        try { var u=new URL(a.href,location.href);
          if(u.origin!==location.origin || /\.(?:pdf|mp4|png|jpe?g|svg|zip)$/i.test(u.pathname)) return;
          u.searchParams.set('fa_review','capsules');u.searchParams.set('qa','1');u.searchParams.set('env','staging');
          var href=u.pathname+u.search+u.hash;
          if(a.getAttribute('href')!==href) a.href=href;
        } catch(e) {}
      });
        var header=document.querySelector('.site-header');
        if(header) Array.prototype.forEach.call(document.body.children,function(node){
          if(node.getAttribute && node.getAttribute('role')==='alert' &&
            (node.textContent||'').indexOf('TEST MODE:')===0) {
            node.style.marginTop=Math.ceil(header.getBoundingClientRect().height)+'px';
          }
        });
      }
      reviewLinks();
      if(window.MutationObserver) new MutationObserver(reviewLinks).observe(document.body,{childList:true,subtree:true});
    } else if (grant && grant.query) {
      /* Preserve the original raw attribution bytes on capsule back-links, including storage-restricted browsers. */
      document.querySelectorAll('a[href]').forEach(function(a){
        try { var u=new URL(a.href,location.href);
          if(u.origin===location.origin && /\/(?:culture-capsules|capsules)(?:\.html)?\/?$/.test(u.pathname) && !u.search)
            a.href=u.pathname+'?'+grant.query+u.hash;
        } catch(e) {}
      });
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',ready); else ready();
})();
