/* Rendu du plateau.
   La grille n'est construite qu'une fois, chaque tour ne repeint que les cases
   dont l'etat a change, ce qui supprime le scintillement et les recalculs inutiles. */

import { CONFIG } from "./config.js";
import { tuileA } from "./grille.js";

/* Etat interne du rendu, remis a zero a chaque reconstruction */
let cellules = [];
let etatPeint = [];
let dimensions = { colonnes: 0, lignes: 0, tuile: 0 };

function borner(valeur, minimum, maximum) {
  return Math.min(Math.max(valeur, minimum), maximum);
}

/* Nombre de colonnes retenu pour une largeur de fenetre donnee */
export function colonnesPourLargeur(largeurFenetre) {
  const palier = CONFIG.grille.colonnesParLargeur.find((entree) => largeurFenetre <= entree.largeurMax);
  return palier ? palier.colonnes : CONFIG.grille.colonnesParLargeur[CONFIG.grille.colonnesParLargeur.length - 1].colonnes;
}

/* Calcule le nombre de colonnes, de lignes et la taille de tuile
   qui remplissent au mieux l'espace reellement disponible */
export function calculerDimensions(largeurFenetre, largeurDisponible, hauteurDisponible) {
  const { ecart, padPlateau, lignesVisiblesMin, lignesVisiblesMax, tuileMin, tuileMax } = CONFIG.grille;
  const colonnes = colonnesPourLargeur(largeurFenetre);

  /* La marge interieure du plateau est retiree de l'espace utile */
  const largeurUtile = Math.max(largeurDisponible - padPlateau * 2, 1);
  const hauteurUtile = Math.max(hauteurDisponible - padPlateau * 2, 1);

  const tuileParLargeur = (largeurUtile - (colonnes - 1) * ecart) / colonnes;
  const estimationLignes = Math.floor((hauteurUtile + ecart) / (Math.max(tuileParLargeur, 1) + ecart));
  const lignes = borner(estimationLignes, lignesVisiblesMin, lignesVisiblesMax);

  const tuileParHauteur = (hauteurUtile - (lignes - 1) * ecart) / lignes;
  const tuile = borner(Math.floor(Math.min(tuileParLargeur, tuileParHauteur)), tuileMin, tuileMax);

  return { colonnes, lignes, tuile };
}

export function dimensionsCourantes() {
  return { ...dimensions };
}

/* Construit la grille une seule fois pour un jeu de dimensions donne */
export function construireGrille(zone, nouvellesDimensions) {
  const identique =
    nouvellesDimensions.colonnes === dimensions.colonnes &&
    nouvellesDimensions.lignes === dimensions.lignes;

  dimensions = { ...nouvellesDimensions };
  zone.style.setProperty("--colonnes", dimensions.colonnes);
  zone.style.setProperty("--lignes", dimensions.lignes);
  zone.style.setProperty("--tuile", dimensions.tuile + "px");
  zone.style.setProperty("--ecart", CONFIG.grille.ecart + "px");
  zone.style.setProperty("--pad-plateau", CONFIG.grille.padPlateau + "px");

  /* Seule la taille de tuile a change, les cellules restent valables */
  if (identique && cellules.length === dimensions.colonnes * dimensions.lignes) return;

  const fragment = document.createDocumentFragment();
  cellules = [];
  etatPeint = [];

  for (let ligne = 0; ligne < dimensions.lignes; ligne += 1) {
    for (let colonne = 0; colonne < dimensions.colonnes; colonne += 1) {
      const cellule = document.createElement("div");
      cellule.className = "tuile";
      cellule.dataset.colonne = String(colonne);
      cellule.dataset.ligne = String(ligne);
      fragment.appendChild(cellule);
      cellules.push(cellule);
      etatPeint.push("");
    }
  }

  zone.textContent = "";
  zone.appendChild(fragment);
}

/* Repeint uniquement les cases dont la classe a change */
export function peindre(plateau, fenetre, joueurX, joueurY) {
  for (let ligne = 0; ligne < dimensions.lignes; ligne += 1) {
    const ligneMonde = fenetre + ligne;

    for (let colonne = 0; colonne < dimensions.colonnes; colonne += 1) {
      const index = ligne * dimensions.colonnes + colonne;
      const estJoueur = colonne === joueurX && ligneMonde === joueurY;
      const type = tuileA(plateau, colonne, ligneMonde);
      const classe = "tuile " + type + (estJoueur ? " joueur" : "");

      if (etatPeint[index] === classe) continue;

      const cellule = cellules[index];
      cellule.className = classe;
      etatPeint[index] = classe;

      /* Relance breve de l'animation d'apparition */
      cellule.classList.remove("tuile--change");
      void cellule.offsetWidth;
      cellule.classList.add("tuile--change");
    }
  }
}

/* Retourne les coordonnees monde de la cellule visee par un evenement, ou null */
export function coordonneesDepuisCible(cible, fenetre) {
  if (!cible || !cible.dataset || cible.dataset.colonne === undefined) return null;
  return {
    x: Number.parseInt(cible.dataset.colonne, 10),
    y: fenetre + Number.parseInt(cible.dataset.ligne, 10)
  };
}