/* Point d'entree : assemble les modules dans le bon ordre. */

import { initialiserAudio } from "./audio.js";
import { initialiserInterface } from "./ui.js";
import { activerControles } from "./controles.js";

function demarrerApplication() {
  initialiserAudio();
  initialiserInterface();
  activerControles(document.getElementById("scene"));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", demarrerApplication);
} else {
  demarrerApplication();
}

/* Enregistrement du service worker pour le mode hors ligne */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {
      /* Hors ligne indisponible, le jeu reste jouable en ligne */
    });
  });
}