/**
 * dsh-boot-animation-settings — host half.
 *
 * Two jobs:
 *
 * 1. The Settings section that picks the intro clip. It owns no state and
 *    registers no route: reads/writes go to dsh-boot-animation-pro's public
 *    endpoints (/dsh-boot-animation-pro/videos.json and /select).
 *
 * 2. A pre-boot cover, injected into the index document. DSH draws its own
 *    `[data-dsh-boot]` kernel page first, and the intro overlay only exists
 *    after the client boots — without a cover the user sees the kernel spinner
 *    (and a flash of the shell) before the clip starts. The cover is painted
 *    black from the first parsed body byte and removed the moment the intro
 *    overlay appears, so EVERY clip starts from black instead of from the
 *    shell. It is clip-agnostic: it keys on the pro overlay's `.dbap-root`.
 *
 *    Removal is triple-guarded so a failure can never leave a black window:
 *      - the injected script removes it when `.dbap-root` shows up,
 *      - the script also removes it after 1.8s even if no intro plays,
 *      - CSS fades it out at 9s by itself if the script never runs.
 */
export const name = 'dsh-boot-animation-settings'

const COVER_ID = 'dsh-intro-cover'

/** Head CSS: black canvas from the first paint plus the script-free failsafe. */
const COVER_CSS = [
  `html:has(#${COVER_ID}){background:#000!important}`,
  `#${COVER_ID}{position:fixed;inset:0;z-index:2147483647;background:#000;pointer-events:none;`,
  'animation:dsh-intro-cover-failsafe 0s linear 9s forwards}',
  '@keyframes dsh-intro-cover-failsafe{to{opacity:0;visibility:hidden}}',
].join('')

/** First body child: the cover itself, so it exists before any app script runs. */
const COVER_HTML = `<div id="${COVER_ID}" aria-hidden="true"></div>`

/**
 * Body script: reveal on the intro overlay, or 1.8s after boot if the intro
 * decided not to play. Kept ES5 and dependency-free — it runs before the app.
 */
const COVER_JS = [
  '(function(){try{',
  `var cover=document.getElementById(${JSON.stringify(COVER_ID)});`,
  'if(!cover)return;',
  'var done=false;',
  'function reveal(){if(done)return;done=true;',
  "cover.style.transition='opacity .18s ease';cover.style.opacity='0';",
  'setTimeout(function(){if(cover.parentNode)cover.parentNode.removeChild(cover);},220);}',
  'function intro(){try{return document.querySelector(\'.dbap-root\')!==null;}catch(e){return false;}}',
  'window.__dshIntroCoverReveal=reveal;',
  'if(intro()){reveal();return;}',
  'try{var mo=new MutationObserver(function(){if(intro()){mo.disconnect();reveal();}});',
  'mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}',
  'setTimeout(reveal,4500);',
  "window.addEventListener('keydown',reveal,true);",
  "window.addEventListener('pointerdown',reveal,true);",
  '}catch(e){}})();',
].join('')

/** @param ctx - host plugin context. */
export function apply(ctx) {
  ctx.on('webserver/index-inject', (table) => {
    table.push({ kind: 'style', text: COVER_CSS })
    table.push({ kind: 'html', placement: 'body', html: COVER_HTML })
    table.push({ kind: 'script', placement: 'body', text: COVER_JS })
  })
}
