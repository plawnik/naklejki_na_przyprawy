/* One shared page-view request per published page load; no calls on editor/language changes. */
'use strict';
(() => {
  const badge=document.getElementById('visitorCounterBadge');
  const fallback=document.getElementById('visitorCounterFallback');
  if(!badge||!fallback) return;
  const isPublished=location.hostname==='plawnik.github.io'&&
    (location.pathname==='/naklejki_na_przyprawy'||location.pathname.startsWith('/naklejki_na_przyprawy/'));
  if(!isPublished) return;
  badge.addEventListener('load',()=>{badge.hidden=false;fallback.hidden=true;},{once:true});
  badge.addEventListener('error',()=>{badge.hidden=true;fallback.hidden=false;},{once:true});
  // The provider stores the total. Its SVG response disables caching.
  // A neutral "#" badge keeps one URL for all interface languages.
  badge.src='https://hits.sh/plawnik.github.io/naklejki_na_przyprawy.svg?view=total&style=flat-square&label=%23&color=782d20&labelColor=766b62';
})();
