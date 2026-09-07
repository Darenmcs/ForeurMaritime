/* Lecture et ecriture des preferences persistantes.
   Encapsule localStorage pour que le reste du jeu ignore le mode de stockage. */

import { CONFIG } from "./config.js";

/* Certains navigateurs en navigation privee refusent localStorage,
   on degrade silencieusement vers une memoire volatile. */
const memoireVolatile = new Map();

function lire(cle) {
  try {
    return window.localStorage.getItem(cle);
  } catch (err) {
    return memoireVolatile.has(cle) ? memoireVolatile.get(cle) : null;
  }
}

function ecrire(cle, valeur) {
  try {
    window.localStorage.setItem(cle, valeur);
  } catch (err) {
    memoireVolatile.set(cle, valeur);
  }
}

export function lireRecord() {
  const brut = Number.parseInt(lire(CONFIG.stockage.record), 10);
  return Number.isFinite(brut) ? brut : 0;
}

export function ecrireRecord(valeur) {
  ecrire(CONFIG.stockage.record, String(valeur));
}

/* Langue enregistree, sinon deduite de la langue du navigateur */
export function lireLangue() {
  const enregistree = lire(CONFIG.stockage.langue);
  if (enregistree === CONFIG.langues.FR || enregistree === CONFIG.langues.EN) {
    return enregistree;
  }
  const navigateur = (navigator.language || CONFIG.langues.FR).toLowerCase();
  return navigateur.startsWith(CONFIG.langues.FR) ? CONFIG.langues.FR : CONFIG.langues.EN;
}

export function ecrireLangue(valeur) {
  ecrire(CONFIG.stockage.langue, valeur);
}

/* Theme enregistre, sinon celui du systeme d'exploitation */
export function lireTheme() {
  const enregistre = lire(CONFIG.stockage.theme);
  if (enregistre === CONFIG.themes.CLAIR || enregistre === CONFIG.themes.SOMBRE) {
    return enregistre;
  }
  const sombreSysteme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return sombreSysteme ? CONFIG.themes.SOMBRE : CONFIG.themes.CLAIR;
}

export function ecrireTheme(valeur) {
  ecrire(CONFIG.stockage.theme, valeur);
}

export function lireSon() {
  return lire(CONFIG.stockage.son) !== "0";
}

export function ecrireSon(actif) {
  ecrire(CONFIG.stockage.son, actif ? "1" : "0");
}