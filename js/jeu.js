/* Logique de partie.
   Ce module ne touche jamais au DOM : il emet des evenements que l'interface ecoute,
   ce qui garde la regle de jeu independante de l'affichage. */

import { CONFIG, TUILES, RAISONS_FIN } from "./config.js";
import { creerPlateau, assurerLignes, tuileA, definirTuile, estFranchissable, palierPour } from "./grille.js";
import { lireRecord, ecrireRecord } from "./preferences.js";
import { jouer } from "./audio.js";

export const EVENEMENTS = {
  MAJ: "jeu:maj",
  FIN: "jeu:fin",
  SECOUSSE: "jeu:secousse"
};

export const etat = {
  plateau: null,
  colonnes: 0,
  lignesVisibles: 0,
  fenetre: 0,
  joueurX: 0,
  joueurY: 0,
  score: 0,
  profondeur: 1,
  profondeurMax: 1,
  oxygene: CONFIG.oxygene.max,
  sonarCharges: CONFIG.sonar.chargesDepart,
  prochaineRecharge: CONFIG.sonar.metresParRecharge,
  enCours: false,
  raisonFin: null,
  record: 0,
  nouveauRecord: false
};

function emettre(nom, details) {
  document.dispatchEvent(new CustomEvent(nom, { detail: details }));
}

/* Recadre la fenetre visible pour que le foreur reste dans le champ */
function ajusterFenetre() {
  const limiteBasse = etat.lignesVisibles - 1 - CONFIG.grille.margeDefilement;
  if (etat.joueurY - etat.fenetre > limiteBasse) {
    etat.fenetre = etat.joueurY - limiteBasse;
  }
  if (etat.fenetre < 0) etat.fenetre = 0;
  assurerLignes(etat.plateau, etat.fenetre + etat.lignesVisibles + CONFIG.grille.tamponLignes);
}

export function palierCourant() {
  return palierPour(etat.profondeur);
}

/* Demarre une nouvelle partie sur une grille de la taille demandee */
export function demarrer(colonnes, lignesVisibles) {
  etat.colonnes = colonnes;
  etat.lignesVisibles = lignesVisibles;
  etat.plateau = creerPlateau(colonnes);
  etat.fenetre = 0;
  etat.joueurX = Math.floor(colonnes / 2);
  etat.joueurY = 0;
  etat.score = 0;
  etat.profondeur = 1;
  etat.profondeurMax = 1;
  etat.oxygene = CONFIG.oxygene.max;
  etat.sonarCharges = CONFIG.sonar.chargesDepart;
  etat.prochaineRecharge = CONFIG.sonar.metresParRecharge;
  etat.enCours = true;
  etat.raisonFin = null;
  etat.nouveauRecord = false;
  etat.record = lireRecord();

  assurerLignes(etat.plateau, lignesVisibles + CONFIG.grille.tamponLignes);
  definirTuile(etat.plateau, etat.joueurX, 0, TUILES.VIDE);

  emettre(EVENEMENTS.MAJ);
}

/* Adapte la partie en cours a un nouveau nombre de colonnes ou de lignes,
   par exemple lors d'une rotation de l'appareil */
export function redimensionner(colonnes, lignesVisibles) {
  etat.lignesVisibles = lignesVisibles;

  if (etat.plateau && colonnes !== etat.colonnes) {
    const ancienPlateau = etat.plateau;
    const nouveau = creerPlateau(colonnes);

    /* On conserve les lignes deja creusees et on complete la largeur si besoin */
    nouveau.lignes = ancienPlateau.lignes.map((ligne, indexLigne) => {
      const copie = ligne.slice(0, colonnes);
      while (copie.length < colonnes) {
        const modele = creerPlateau(1);
        assurerLignes(modele, indexLigne);
        copie.push(modele.lignes[indexLigne][0]);
      }
      return copie;
    });

    etat.plateau = nouveau;
    etat.colonnes = colonnes;
    etat.joueurX = Math.min(etat.joueurX, colonnes - 1);
    definirTuile(etat.plateau, etat.joueurX, etat.joueurY, TUILES.VIDE);
  }

  if (etat.plateau) ajusterFenetre();
  emettre(EVENEMENTS.MAJ);
}

/* Applique le gain de la case atteinte, bareme d'origine conserve */
function encaisser(tuile) {
  if (tuile === TUILES.OR) {
    etat.score += CONFIG.score.or;
    etat.oxygene = Math.min(CONFIG.oxygene.max, etat.oxygene + CONFIG.oxygene.gainOr);
    jouer("or");
    return;
  }
  if (tuile === TUILES.DIAMANT) {
    etat.score += CONFIG.score.diamant;
    etat.oxygene = Math.min(CONFIG.oxygene.max, etat.oxygene + CONFIG.oxygene.gainDiamant);
    jouer("diamant");
    return;
  }
  if (tuile === TUILES.TERRE) {
    etat.score += CONFIG.score.terre;
    return;
  }
  etat.score += CONFIG.score.vide;
}

/* Recharge le sonar tous les N metres de profondeur inedite */
function verifierRecharge() {
  while (etat.profondeurMax >= etat.prochaineRecharge) {
    etat.sonarCharges = Math.min(CONFIG.sonar.chargesMax, etat.sonarCharges + 1);
    etat.prochaineRecharge += CONFIG.sonar.metresParRecharge;
  }
}

/* Vrai si aucune case adjacente n'est accessible */
function estBloque() {
  const voisins = [
    [etat.joueurX - 1, etat.joueurY],
    [etat.joueurX + 1, etat.joueurY],
    [etat.joueurX, etat.joueurY + 1]
  ];
  return !voisins.some(([x, y]) => estFranchissable(etat.plateau, x, y));
}

export function deplacer(dx, dy) {
  if (!etat.enCours) return false;
  /* Le foreur ne remonte pas, regle d'origine */
  if (dy < 0) return false;

  const nx = etat.joueurX + dx;
  const ny = etat.joueurY + dy;

  if (nx < 0 || nx >= etat.colonnes) return false;

  if (tuileA(etat.plateau, nx, ny) === TUILES.ROCHE) {
    jouer("roche");
    emettre(EVENEMENTS.SECOUSSE, { intensite: "faible" });
    return false;
  }

  encaisser(tuileA(etat.plateau, nx, ny));
  definirTuile(etat.plateau, nx, ny, TUILES.VIDE);

  etat.joueurX = nx;
  etat.joueurY = ny;
  etat.profondeur = ny + 1;

  if (etat.profondeur > etat.profondeurMax) {
    etat.score += CONFIG.score.parMetre * (etat.profondeur - etat.profondeurMax);
    etat.profondeurMax = etat.profondeur;
    verifierRecharge();
  }

  etat.oxygene -= CONFIG.oxygene.coutDeplacement;
  ajusterFenetre();

  if (etat.oxygene <= 0) {
    etat.oxygene = 0;
    terminer(RAISONS_FIN.OXYGENE);
    return true;
  }

  if (estBloque() && etat.sonarCharges <= 0) {
    terminer(RAISONS_FIN.BLOQUE);
    return true;
  }

  emettre(EVENEMENTS.MAJ);
  return true;
}

/* Le sonar pulverise les quatre cases adjacentes */
export function utiliserSonar() {
  if (!etat.enCours || etat.sonarCharges <= 0) return false;

  [
    [etat.joueurX + 1, etat.joueurY],
    [etat.joueurX - 1, etat.joueurY],
    [etat.joueurX, etat.joueurY + 1],
    [etat.joueurX, etat.joueurY - 1]
  ].forEach(([x, y]) => {
    if (x >= 0 && x < etat.colonnes && y >= 0) {
      definirTuile(etat.plateau, x, y, TUILES.VIDE);
    }
  });

  etat.sonarCharges -= 1;
  etat.oxygene = Math.max(0, etat.oxygene - CONFIG.oxygene.coutSonar);

  jouer("explosion");
  emettre(EVENEMENTS.SECOUSSE, { intensite: "forte" });

  if (etat.oxygene <= 0) {
    terminer(RAISONS_FIN.OXYGENE);
    return true;
  }

  emettre(EVENEMENTS.MAJ);
  return true;
}

export function terminer(raison) {
  if (!etat.enCours) return;

  etat.enCours = false;
  etat.raisonFin = raison;

  if (etat.score > etat.record) {
    etat.record = etat.score;
    etat.nouveauRecord = true;
    ecrireRecord(etat.record);
  }

  jouer("finJeu");
  emettre(EVENEMENTS.MAJ);
  emettre(EVENEMENTS.FIN, { raison });
}