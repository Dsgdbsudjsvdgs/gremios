const CACHE_NAME = 'gremio-v29';
const URLS_TO_CACHE = [
  '/gremios/',
  '/gremios/index.html',
  '/gremios/manifest.json',
  '/gremios/assets/css/variables.css',
  '/gremios/assets/css/style.css',
  '/gremios/assets/js/config.js',
  '/gremios/assets/js/utils.js',
  '/gremios/assets/js/auth.js',
  '/gremios/assets/js/nav-component.js',
  '/gremios/assets/js/dashboard.js',
  '/gremios/assets/icons/icon-192.png',
  '/gremios/assets/icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(URLS_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // FIX v2.5.1: bypass TOTAL para requests fora da origem do app.
  // Antes o SW interceptava o fetch do suporte.js pro Hermes Gateway
  // (chat.dsgdbsudbvgs.online) e, ao falhar, respondia com index.html —
  // o chat recebia HTML no lugar do JSON e quebrava ("Erro ao conectar").
  // Também cacheava respostas POST da API. Regra: só intervm em GET
  // same-origin (assets locais do PWA). APIs externas nunca passam por aqui.
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return; // cross-origin: deixa o browser cuidar
  if (e.request.method !== 'GET') return;           // POST/PUT/DELETE: nunca cachear
  if (url.pathname.startsWith('/v1/')) return;      // rotas de API local: bypass
  if (e.request.url.includes('supabase.co')) return; // legado: mantém bypass do Supabase
  if (url.pathname.includes('/assets/js/suporte')) return; // nunca cachear o próprio suporte.js (endpoint pode mudar)
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    if (res.status === 200) {
      const clone = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
    }
    return res;
  }).catch(() => caches.match('/gremios/index.html'))));
});
