/* フィード版の Service Worker

   このファイルは /jhvjh/index.html から登録するので、担当する範囲は
   /jhvjh/ の中だけ。本編アプリ（/tiri/）とは置き場所が分かれているので、
   お互いの動きに影響しない。

   やることは2つ ——
     ・圏外でも開けること
     ・つながっているときは必ず最新が出ること */

const VERSION = 'v19';
const CACHE   = 'explog-feed-' + VERSION;

const SHELL = [
  './',
  './index.html',
  './data.js',
  './manifest.webmanifest',
  './katex.min.js',
  './katex.min.css',
  './tex.js',
  './backup.js',
  './fonts/KaTeX_AMS-Regular.woff2',
  './fonts/KaTeX_Caligraphic-Bold.woff2',
  './fonts/KaTeX_Caligraphic-Regular.woff2',
  './fonts/KaTeX_Fraktur-Bold.woff2',
  './fonts/KaTeX_Fraktur-Regular.woff2',
  './fonts/KaTeX_Main-Bold.woff2',
  './fonts/KaTeX_Main-BoldItalic.woff2',
  './fonts/KaTeX_Main-Italic.woff2',
  './fonts/KaTeX_Main-Regular.woff2',
  './fonts/KaTeX_Math-BoldItalic.woff2',
  './fonts/KaTeX_Math-Italic.woff2',
  './fonts/KaTeX_SansSerif-Bold.woff2',
  './fonts/KaTeX_SansSerif-Italic.woff2',
  './fonts/KaTeX_SansSerif-Regular.woff2',
  './fonts/KaTeX_Script-Regular.woff2',
  './fonts/KaTeX_Size1-Regular.woff2',
  './fonts/KaTeX_Size2-Regular.woff2',
  './fonts/KaTeX_Size3-Regular.woff2',
  './fonts/KaTeX_Size4-Regular.woff2',
  './fonts/KaTeX_Typewriter-Regular.woff2',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './icon-apple.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE)
      /* 1つ失敗しただけで全部落とさない */
      .then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{}))))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys()
      /* 消すのは自分のぶんと、前にここにあった英文法アプリの置き土産だけ。
         同じ ahaaaaa34.github.io にある本編アプリ（/tiri/）のキャッシュには手を出さない。 */
      .then(ks=>Promise.all(
        ks.filter(k=>(k.indexOf('explog-feed-')===0 && k!==CACHE) || k==='grammar-040506-v9')
          .map(k=>caches.delete(k))
      ))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== self.location.origin) return;

  /* ページはネットワーク優先。更新があればすぐ反映され、圏外ならキャッシュから開ける。 */
  if(req.mode === 'navigate'){
    e.respondWith(
      fetch(req)
        .then(res=>{
          const copy = res.clone();
          caches.open(CACHE).then(c=>c.put(req, copy)).catch(()=>{});
          return res;
        })
        .catch(()=>caches.match(req).then(r=>r || caches.match('./index.html')))
    );
    return;
  }

  /* 問題データやアイコンはキャッシュを即返しつつ、裏で新しいものを取っておく */
  e.respondWith(
    caches.match(req).then(hit=>{
      const net = fetch(req).then(res=>{
        if(res && res.status===200 && res.type==='basic'){
          const copy = res.clone();
          caches.open(CACHE).then(c=>c.put(req, copy)).catch(()=>{});
        }
        return res;
      }).catch(()=>hit);
      return hit || net;
    })
  );
});
