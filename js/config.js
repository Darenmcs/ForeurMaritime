/* Configuration centrale du jeu.
   Toutes les valeurs reglables vivent ici, aucun nombre magique ailleurs. */

/* Types de tuiles du plateau */
export const TUILES = {
  TERRE: "terre",
  ROCHE: "roche",
  OR: "or",
  DIAMANT: "diamant",
  VIDE: "vide"
};

/* Raisons possibles de fin de partie */
export const RAISONS_FIN = {
  OXYGENE: "oxygene",
  BLOQUE: "bloque",
  MANUEL: "manuel"
};

export const CONFIG = {
  grille: {
    /* Nombre de colonnes retenu selon la largeur de la fenetre */
    colonnesParLargeur: [
      { largeurMax: 430, colonnes: 9 },
      { largeurMax: 780, colonnes: 12 },
      { largeurMax: Infinity, colonnes: 15 }
    ],
    lignesVisiblesMin: 8,
    lignesVisiblesMax: 14,
    tuileMin: 20,
    tuileMax: 46,
    ecart: 2,
    /* Marge interieure du plateau, doit correspondre a --pad-plateau en CSS */
    padPlateau: 8,
    /* Le plateau defile quand le foreur arrive a N lignes du bas visible */
    margeDefilement: 3,
    /* Lignes generees d'avance sous la zone visible */
    tamponLignes: 10
  },

  /* Bareme d'origine conserve. Passer parMetre a 10 pour un score positif. */
  score: {
    or: 100,
    diamant: 1000,
    terre: -50,
    vide: -10,
    parMetre: 0
  },

  oxygene: {
    max: 100,
    coutDeplacement: 1,
    coutSonar: 3,
    gainOr: 8,
    gainDiamant: 30,
    seuilCritiquePourcent: 25
  },

  sonar: {
    chargesDepart: 1,
    chargesMax: 3,
    metresParRecharge: 15
  },

  /* Paliers de profondeur, de la surface vers le fond.
     La densite restante est attribuee a la terre. */
  paliers: [
    { profondeurMin: 0, cle: "palier.plateau", densites: { roche: 0.12, or: 0.14, diamant: 0.010 } },
    { profondeurMin: 20, cle: "palier.talus", densites: { roche: 0.18, or: 0.13, diamant: 0.015 } },
    { profondeurMin: 50, cle: "palier.plaine", densites: { roche: 0.24, or: 0.12, diamant: 0.025 } },
    { profondeurMin: 90, cle: "palier.fosse", densites: { roche: 0.30, or: 0.11, diamant: 0.040 } }
  ],

  audio: {
    dossier: "assets/audio/",
    pistes: {
      or: { fichier: "gold.wav", volume: 0.5 },
      diamant: { fichier: "diamond.wav", volume: 0.6 },
      explosion: { fichier: "explosionBig.wav", volume: 0.7 },
      roche: { fichier: "rockHit.wav", volume: 0.4 },
      finJeu: { fichier: "gameOver.wav", volume: 0.7 }
    }
  },

  /* Cles localStorage, prefixees pour eviter tout conflit */
  stockage: {
    record: "foreur.record",
    langue: "foreur.langue",
    theme: "foreur.theme",
    son: "foreur.son"
  },

  themes: { CLAIR: "clair", SOMBRE: "sombre" },
  langues: { FR: "fr", EN: "en" },

  interaction: {
    /* Distance minimale en pixels pour valider un balayage */
    seuilBalayage: 28,
    delaiBanniereMs: 4000
  }
};