import {
  currentLang,
  setLang,
  mettreAJourScore,
  deplacerJoueur,
  explosion,
  finDuJeu,
  reinitialiserJeu
} from "./jeu.js";

/* ============================
   Bannière PWA
   Intercepte l'événement beforeinstallprompt du navigateur
   pour afficher une bannière d'installation discrète en haut
   ============================ */
let deferredPrompt = null;

/* Le navigateur déclenche cet événement quand l'app est installable */
window.addEventListener("beforeinstallprompt", (e) => {
  /* Empêche le popup natif du navigateur */
  e.preventDefault();
  deferredPrompt = e;

  /* Affiche la bannière après 2 secondes de jeu */
  setTimeout(() => {
    const banner = document.getElementById("pwaBanner");
    if (banner) {
      banner.style.display = "flex";

      /* Clic sur la bannière = déclenche l'installation */
      banner.addEventListener("click", async (evt) => {
        /* Si on clique sur le X, on ferme juste la bannière */
        if (evt.target.id === "pwaBannerClose") {
          banner.style.display = "none";
          return;
        }

        if (!deferredPrompt) return;

        /* Affiche le dialogue natif d'installation */
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        /* Cache la bannière si l'utilisateur a accepté */
        if (outcome === "accepted") banner.style.display = "none";
        deferredPrompt = null;
      });
    }
  }, 2000);
});

/* ============================
   Langue
   Gère la bascule FR/EN sur tous les éléments data-fr/data-en
   ============================ */

/* Applique la langue active sur tous les textes bilingues */
export function appliquerLangueUI() {
  /* Met à jour le bouton de langue */
  const langBtn = document.getElementById("languageSwitch");
  langBtn.innerHTML = currentLang === "fr" ? "🇬🇧 EN" : "🇫🇷 FR";

  /* Parcourt tous les éléments avec data-fr et data-en */
  document.querySelectorAll("[data-fr][data-en]").forEach(elem => {
    elem.innerHTML = elem.getAttribute("data-" + currentLang);
  });

  /* Met à jour les textes de score avec le bon préfixe de langue */
  mettreAJourScore();
}

/* Bascule entre FR et EN */
function switchLanguage() {
  const newLang = currentLang === "fr" ? "en" : "fr";
  setLang(newLang);
  appliquerLangueUI();
}

/* ============================
   Événements boutons et clavier
   Lie chaque bouton à sa fonction de jeu
   ============================ */
export function activerEvents() {
  /* Bouton de langue */
  document.getElementById("languageSwitch").addEventListener("click", switchLanguage);

  /* Boutons de déplacement */
  document.getElementById("boutonGauche").addEventListener("click", () => deplacerJoueur(-1, 0));
  document.getElementById("boutonDroit").addEventListener("click", () => deplacerJoueur(1, 0));
  document.getElementById("boutonBas").addEventListener("click", () => deplacerJoueur(0, 1));

  /* Bouton sonar (explosion autour du joueur) */
  document.getElementById("boutonExplosion").addEventListener("click", explosion);

  /* Bouton fin de partie manuelle */
  document.getElementById("boutonFin").addEventListener("click", finDuJeu);

  /* Bouton nouvelle partie (panneau de fin) */
  document.getElementById("boutonNouvellePartie").addEventListener("click", reinitialiserJeu);

  /* Contrôles clavier : flèches + espace pour le sonar */
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft")  deplacerJoueur(-1, 0);
    if (e.key === "ArrowRight") deplacerJoueur(1, 0);
    if (e.key === "ArrowDown")  deplacerJoueur(0, 1);
    if (e.key === " ") { e.preventDefault(); explosion(); }
  });
}