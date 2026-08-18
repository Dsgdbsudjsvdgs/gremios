const CACHE_NAME = 'gremio-v3';
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
  if (e.request.url.includes('supabase.co')) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    if (res.status === 200) {
      const clone = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
    }
    return res;
  }).catch(() => caches.match('/gremios/index.html'))));
});
