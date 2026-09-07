import { genererTableauJeu, mettreAJourScore, afficherGrille } from "./jeu.js";
import { activerEvents, appliquerLangueUI } from "./events.js";

// Lancement initial
genererTableauJeu();
mettreAJourScore();
afficherGrille();

// Activer les boutons + clavier + langue
activerEvents();
appliquerLangueUI();
