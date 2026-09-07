const CACHE_NAME = "foreur-maritime-v1";

/* Fichiers mis en cache lors de l'installation */
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/css/style.css",
  "/js/main.js",
  "/js/jeu.js",
  "/js/events.js",
  "/assets/img/diamond.png",
  "/assets/img/gold.png",
  "/assets/img/player.png",
  "/assets/img/rock.png",
  "/assets/img/terre.png",
  "/assets/audio/diamond.wav",
  "/assets/audio/explosionBig.wav",
  "/assets/audio/gameOver.wav",
  "/assets/audio/gold.wav",
  "/assets/audio/rockHit.wav"
];

/* Installation : mise en cache de tous les assets */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

/* Activation : suppression des anciens caches */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* Fetch : cache-first, réseau en fallback */
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(
      (cached) => cached || fetch(event.request)
    )
  );
});