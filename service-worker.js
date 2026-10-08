/**
 * AC ADEXA - Offline Caching Service Worker
 */

const CACHE_NAME = 'ac-adexa-v3';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './attendance.html',
  './sgpa.html',
  './cgpa.html',
  './marks.html',
  './what-if.html',
  './insights.html',
  './reports.html',
  './settings.html',
  './regulation.html',
  './assets/logo.png',
  './assets/favicon.svg',
  './css/style.css',
  './css/components.css',
  './css/responsive.css',
  './js/data/regulations.js',
  './js/core/grading.js',
  './js/core/attendance.js',
  './js/core/marks.js',
  './js/core/sgpa.js',
  './js/core/cgpa.js',
  './js/core/projection.js',
  './js/features/storage.js',
  './js/features/whatif.js',
  './js/features/charts.js',
  './js/features/sharing.js',
  './js/features/reports.js',
  './js/components/navbar.js',
  './js/components/regulation-selector.js',
  './js/components/course-card.js',
  './js/components/result-card.js',
  './js/components/modal.js',
  './js/components/feedback.js',
  './js/pages/home.js',
  './js/pages/attendance.js',
  './js/pages/sgpa.js',
  './js/pages/cgpa.js',
  './js/pages/marks.js',
  './js/pages/what-if.js',
  './js/pages/insights.js',
  './js/pages/reports.js',
  './js/pages/settings.js',
  './js/pages/regulation.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.warn('Cache addAll warning:', err));
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Network-First with Cache Fallback for reliable navigation & live updates
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html') || caches.match('/index.html');
          }
        });
      })
  );
});

