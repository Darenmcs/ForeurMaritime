/* Interface : ecrans, tableau de bord, theme, langue, bannière d'installation.
   C'est le seul module qui manipule le DOM du jeu. */

import { CONFIG } from "./config.js";
import { t, definirLangue, langueCourante, appliquerTraductions } from "./i18n.js";
import { lireLangue, ecrireLangue, lireTheme, ecrireTheme, lireRecord } from "./preferences.js";
import { sonEstActif, basculerSon } from "./audio.js";
import { etat, demarrer, redimensionner, palierCourant, EVENEMENTS } from "./jeu.js";
import { calculerDimensions, construireGrille, peindre } from "./rendu.js";

const ECRANS = { ACCUEIL: "accueil", JEU: "jeu", FIN: "fin" };

let elements = {};
let promptInstallation = null;

/* Regroupe les references DOM une seule fois */
function collecterElements() {
  const identifiants = [
    "scene", "zoneJeu", "plateauConteneur",
    "valeurProfondeur", "valeurScore", "valeurSonar", "barreOxygene", "nomPalier",
    "ecranAccueil", "recordAccueil", "boutonJouer",
    "panneauFinJeu", "scoreFinal", "recordFinal", "profondeurFinale", "raisonFin",
    "badgeRecord", "boutonRejouer", "boutonAccueil",
    "boutonLangue", "boutonTheme", "boutonSon", "boutonPause",
    "pwaBanner", "pwaBannerClose", "boutonSonar"
  ];

  elements = identifiants.reduce((accumulateur, identifiant) => {
    accumulateur[identifiant] = document.getElementById(identifiant);
    return accumulateur;
  }, {});
}

function afficherEcran(nom) {
  document.body.dataset.ecran = nom;
}

/* Applique le theme sur la racine du document et met a jour le bouton */
function appliquerTheme(theme) {
  document.documentElement.dataset.theme = theme;
  ecrireTheme(theme);
  if (elements.boutonTheme) {
    elements.boutonTheme.dataset.etat = theme;
  }
}

function appliquerLangue(langue) {
  definirLangue(langue);
  ecrireLangue(langue);
  document.documentElement.lang = langue;
  appliquerTraductions(document);

  if (elements.boutonLangue) {
    elements.boutonLangue.textContent = langue === CONFIG.langues.FR ? "EN" : "FR";
  }
  rafraichirTableauDeBord();
  rafraichirAccueil();
}

function appliquerEtatSon() {
  if (elements.boutonSon) {
    elements.boutonSon.dataset.etat = sonEstActif() ? "actif" : "coupe";
  }
}

/* Met a jour les compteurs et la jauge d'oxygene */
export function rafraichirTableauDeBord() {
  if (!elements.valeurProfondeur) return;

  elements.valeurProfondeur.textContent = etat.profondeur + " " + t("hud.metres");
  elements.valeurScore.textContent = etat.score.toLocaleString(langueCourante());
  elements.valeurSonar.textContent = String(etat.sonarCharges);
  elements.nomPalier.textContent = t(palierCourant().cle);

  const pourcentage = Math.max(0, Math.min(100, (etat.oxygene / CONFIG.oxygene.max) * 100));
  elements.barreOxygene.style.width = pourcentage + "%";
  const jauge = elements.barreOxygene.parentElement;
  jauge.setAttribute("aria-valuenow", String(Math.round(pourcentage)));
  jauge.dataset.critique = pourcentage <= CONFIG.oxygene.seuilCritiquePourcent ? "1" : "0";

  if (elements.boutonSonar) {
    elements.boutonSonar.disabled = etat.sonarCharges <= 0 || !etat.enCours;
  }

  document.body.dataset.palier = palierCourant().cle;
}

function rafraichirAccueil() {
  if (elements.recordAccueil) {
    elements.recordAccueil.textContent = lireRecord().toLocaleString(langueCourante());
  }
}

/* Recalcule la taille du plateau et le reconstruit si necessaire */
function adapterPlateau(demarrerPartie = false) {
  if (!elements.plateauConteneur) return;

  const zoneDisponible = elements.plateauConteneur.getBoundingClientRect();
  const dimensions = calculerDimensions(
    window.innerWidth,
    zoneDisponible.width,
    zoneDisponible.height
  );

  construireGrille(elements.zoneJeu, dimensions);

  if (demarrerPartie || !etat.plateau) {
    demarrer(dimensions.colonnes, dimensions.lignes);
  } else {
    redimensionner(dimensions.colonnes, dimensions.lignes);
  }

  peindre(etat.plateau, etat.fenetre, etat.joueurX, etat.joueurY);
}

function lancerPartie() {
  afficherEcran(ECRANS.JEU);
  /* L'ecran de jeu doit etre visible avant de mesurer sa hauteur reelle */
  requestAnimationFrame(() => adapterPlateau(true));
}

function afficherFin(raison) {
  elements.scoreFinal.textContent = etat.score.toLocaleString(langueCourante());
  elements.recordFinal.textContent = etat.record.toLocaleString(langueCourante());
  elements.profondeurFinale.textContent = etat.profondeurMax + " " + t("hud.metres");
  elements.raisonFin.textContent = t("fin.raison." + raison);
  elements.badgeRecord.hidden = !etat.nouveauRecord;
  afficherEcran(ECRANS.FIN);
  rafraichirAccueil();
}

/* Secousse breve de la scene lors d'un sonar ou d'un choc sur la roche */
function secouer(intensite) {
  if (!elements.scene) return;
  const classe = intensite === "forte" ? "scene--secousse-forte" : "scene--secousse-faible";
  elements.scene.classList.remove("scene--secousse-forte", "scene--secousse-faible");
  void elements.scene.offsetWidth;
  elements.scene.classList.add(classe);
  window.setTimeout(() => elements.scene.classList.remove(classe), 320);
}

function brancherBarreOutils() {
  elements.boutonLangue.addEventListener("click", () => {
    appliquerLangue(langueCourante() === CONFIG.langues.FR ? CONFIG.langues.EN : CONFIG.langues.FR);
  });

  elements.boutonTheme.addEventListener("click", () => {
    const actuel = document.documentElement.dataset.theme;
    appliquerTheme(actuel === CONFIG.themes.SOMBRE ? CONFIG.themes.CLAIR : CONFIG.themes.SOMBRE);
  });

  elements.boutonSon.addEventListener("click", () => {
    basculerSon();
    appliquerEtatSon();
  });

  elements.boutonPause.addEventListener("click", () => {
    afficherEcran(ECRANS.ACCUEIL);
    rafraichirAccueil();
  });
}

function brancherEcrans() {
  elements.boutonJouer.addEventListener("click", lancerPartie);
  elements.boutonRejouer.addEventListener("click", lancerPartie);
  elements.boutonAccueil.addEventListener("click", () => {
    afficherEcran(ECRANS.ACCUEIL);
    rafraichirAccueil();
  });
}

/* Bannière d'installation, affichee seulement si le navigateur la propose */
function brancherInstallation() {
  window.addEventListener("beforeinstallprompt", (evenement) => {
    evenement.preventDefault();
    promptInstallation = evenement;
    window.setTimeout(() => { elements.pwaBanner.hidden = false; }, CONFIG.interaction.delaiBanniereMs);
  });

  elements.pwaBanner.addEventListener("click", async (evenement) => {
    if (evenement.target === elements.pwaBannerClose) {
      elements.pwaBanner.hidden = true;
      return;
    }
    if (!promptInstallation) return;

    promptInstallation.prompt();
    const { outcome } = await promptInstallation.userChoice;
    if (outcome === "accepted") elements.pwaBanner.hidden = true;
    promptInstallation = null;
  });
}

/* Le redimensionnement est observe sur le conteneur du plateau,
   ce qui couvre la rotation et l'apparition de la barre d'URL mobile */
function observerRedimensionnement() {
  let attente = null;

  const replanifier = () => {
    if (attente) window.clearTimeout(attente);
    attente = window.setTimeout(() => {
      if (document.body.dataset.ecran === ECRANS.JEU) adapterPlateau(false);
    }, 120);
  };

  if (typeof ResizeObserver === "function") {
    new ResizeObserver(replanifier).observe(elements.plateauConteneur);
  }
  window.addEventListener("orientationchange", replanifier);
  window.addEventListener("resize", replanifier);
}

export function initialiserInterface() {
  collecterElements();

  appliquerTheme(lireTheme());
  appliquerLangue(lireLangue());
  appliquerEtatSon();
  afficherEcran(ECRANS.ACCUEIL);
  rafraichirAccueil();

  brancherBarreOutils();
  brancherEcrans();
  brancherInstallation();
  observerRedimensionnement();

  document.addEventListener(EVENEMENTS.MAJ, () => {
    if (etat.plateau) peindre(etat.plateau, etat.fenetre, etat.joueurX, etat.joueurY);
    rafraichirTableauDeBord();
  });

  document.addEventListener(EVENEMENTS.FIN, (evenement) => afficherFin(evenement.detail.raison));
  document.addEventListener(EVENEMENTS.SECOUSSE, (evenement) => secouer(evenement.detail.intensite));
}