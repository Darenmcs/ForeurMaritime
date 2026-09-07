/* Modele du plateau.
   Module purement logique, sans aucune dependance au DOM,
   ce qui permet de le tester et de le reutiliser tel quel. */

import { CONFIG, TUILES } from "./config.js";

/* Retourne le palier correspondant a une profondeur donnee, en metres */
export function palierPour(profondeur) {
  let retenu = CONFIG.paliers[0];
  for (const palier of CONFIG.paliers) {
    if (profondeur >= palier.profondeurMin) retenu = palier;
  }
  return retenu;
}

/* Tire une tuile au hasard selon les densites du palier de la ligne */
function tirerTuile(densites) {
  const tirage = Math.random();
  if (tirage < densites.diamant) return TUILES.DIAMANT;
  if (tirage < densites.diamant + densites.or) return TUILES.OR;
  if (tirage < densites.diamant + densites.or + densites.roche) return TUILES.ROCHE;
  return TUILES.TERRE;
}

/* Cree un plateau vide de la largeur demandee */
export function creerPlateau(colonnes) {
  return { colonnes, lignes: [] };
}

/* Genere une ligne complete a l'index demande */
function genererLigne(plateau, indexLigne) {
  const densites = palierPour(indexLigne + 1).densites;
  const ligne = new Array(plateau.colonnes);

  for (let x = 0; x < plateau.colonnes; x += 1) {
    ligne[x] = tirerTuile(densites);
  }
  return ligne;
}

/* Garantit que toutes les lignes jusqu'a l'index demande existent.
   C'est ce qui rend la profondeur illimitee. */
export function assurerLignes(plateau, indexLigneMax) {
  while (plateau.lignes.length <= indexLigneMax) {
    plateau.lignes.push(genererLigne(plateau, plateau.lignes.length));
  }
}

export function tuileA(plateau, x, y) {
  if (x < 0 || x >= plateau.colonnes || y < 0) return null;
  assurerLignes(plateau, y);
  return plateau.lignes[y][x];
}

export function definirTuile(plateau, x, y, valeur) {
  if (x < 0 || x >= plateau.colonnes || y < 0) return;
  assurerLignes(plateau, y);
  plateau.lignes[y][x] = valeur;
}

/* Vrai si le foreur peut entrer sur cette case */
export function estFranchissable(plateau, x, y) {
  const tuile = tuileA(plateau, x, y);
  return tuile !== null && tuile !== TUILES.ROCHE;
}