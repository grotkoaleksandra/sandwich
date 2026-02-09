const CACHE_NAME = 'block-shooter-v1';

const PRECACHE_URLS = [
  './',
  './index.html',
  './css/game.css',
  './js/main.js',
  './js/engine/GameEngine.js',
  './js/engine/Renderer.js',
  './js/engine/InputManager.js',
  './js/engine/AudioManager.js',
  './js/engine/AssetFactory.js',
  './js/gameplay/Player.js',
  './js/gameplay/Weapon.js',
  './js/gameplay/Bullet.js',
  './js/gameplay/Enemy.js',
  './js/gameplay/EnemyTypes.js',
  './js/world/Arena.js',
  './js/world/LevelData.js',
  './js/world/LevelManager.js',
  './js/ui/HUD.js',
  './js/ui/MenuScreen.js',
  './js/ui/TouchControls.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// Install — precache all game files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch — cache-first for local files, network-first for CDN
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // For CDN resources (Three.js), try cache then network
  if (url.hostname === 'cdn.jsdelivr.net') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // For local files, cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
