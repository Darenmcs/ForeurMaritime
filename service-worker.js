/* Service worker du Foreur Maritime.
   Les pages sont servies en priorite depuis le reseau pour recevoir les mises a jour,
   les ressources statiques sont servies depuis le cache pour la rapidite et le hors ligne. */

const VERSION = "foreur-maritime-v2";

const RESSOURCES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/main.js",
  "./js/config.js",
  "./js/i18n.js",
  "./js/preferences.js",
  "./js/audio.js",
  "./js/grille.js",
  "./js/rendu.js",
  "./js/jeu.js",
  "./js/controles.js",
  "./js/ui.js",
  "./assets/img/icone-192.png",
  "./assets/img/icone-512.png",
  "./assets/audio/diamond.wav",
  "./assets/audio/explosionBig.wav",
  "./assets/audio/gameOver.wav",
  "./assets/audio/gold.wav",
  "./assets/audio/rockHit.wav"
];

/* Installation : mise en cache des ressources du jeu */
self.addEventListener("install", (evenement) => {
  evenement.waitUntil(
    caches.open(VERSION)
      .then((cache) => cache.addAll(RESSOURCES))
      .then(() => self.skipWaiting())
  );
});

/* Activation : suppression des caches des versions precedentes */
self.addEventListener("activate", (evenement) => {
  evenement.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((cle) => cle !== VERSION).map((cle) => caches.delete(cle))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evenement) => {
  const requete = evenement.request;
  if (requete.method !== "GET") return;

  /* Navigation : reseau d'abord, cache en secours hors ligne */
  if (requete.mode === "navigate") {
    evenement.respondWith(
      fetch(requete)
        .then((reponse) => {
          const copie = reponse.clone();
          caches.open(VERSION).then((cache) => cache.put("./index.html", copie));
          return reponse;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  /* Ressources statiques : cache d'abord, reseau en secours */
  evenement.respondWith(
    caches.match(requete).then((enCache) => enCache || fetch(requete).then((reponse) => {
      if (reponse.ok && new URL(requete.url).origin === self.location.origin) {
        const copie = reponse.clone();
        caches.open(VERSION).then((cache) => cache.put(requete, copie));
      }
      return reponse;
    }).catch(() => enCache))
  );
});