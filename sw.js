/* ============================================================
 * Zhi Blog Service Worker（PWA 离线缓存）
 * 更新站点静态资源后，请把 CACHE_VERSION 递增一位（如 v1 -> v2），
 * 访客下次访问即自动刷新缓存。
 * 策略：页面 HTML 优先走网络（保证内容最新），静态资源缓存优先。
 * ============================================================ */
const CACHE_VERSION = 'zhi-blog-v1';

const CORE_ASSETS = [
  '/',
  '/css/custom.css',
  '/js/custom.js',
  '/img/icon-192.png',
  '/img/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      Promise.all(CORE_ASSETS.map((url) =>
        cache.add(url).catch(() => { /* 单个资源缺失不阻塞安装 */ })
      ))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // 只处理同源 GET 请求，一言/不蒜子/CDN 等跨域请求直接放行走网络
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;

  const isPage = request.mode === 'navigate' ||
    (request.headers.get('accept') || '').includes('text/html');

  if (isPage) {
    // 页面：网络优先，失败回退缓存（离线可读）
    event.respondWith(
      fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        return response;
      }).catch(() =>
        caches.match(request).then((cached) => cached || caches.match('/'))
      )
    );
    return;
  }

  // 静态资源：缓存优先，同时后台更新（stale-while-revalidate）
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetching = fetch(request).then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => cached);
      return cached || fetching;
    })
  );
});
