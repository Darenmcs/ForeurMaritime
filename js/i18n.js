/* Dictionnaire bilingue.
   Toute chaine affichee passe par ce module, aucun texte en dur dans le DOM. */

import { CONFIG } from "./config.js";

export const TEXTES = {
  fr: {
    "app.titre": "Le Foreur Maritime",
    "app.tagline": "Descendez le plus profond possible, ramassez l'or et les diamants avant de manquer d'oxygène.",

    "accueil.jouer": "Commencer la plongée",
    "accueil.reprendre": "Reprendre",
    "accueil.record": "Meilleur score",
    "accueil.legende": "Ce que vous allez croiser",
    "accueil.commandes": "Balayez l'écran ou utilisez les commandes. Au clavier : flèches pour creuser, barre d'espace pour le sonar.",

    "legende.terre": "Sédiment",
    "legende.terre.desc": "Se creuse librement",
    "legende.roche": "Roche",
    "legende.roche.desc": "Infranchissable, utilisez le sonar",
    "legende.or": "Or",
    "legende.or.desc": "Points et un peu d'oxygène",
    "legende.diamant": "Diamant",
    "legende.diamant.desc": "Gros gain et recharge d'oxygène",
    "legende.joueur": "Foreur",
    "legende.joueur.desc": "Votre position",

    "hud.profondeur": "Profondeur",
    "hud.score": "Score",
    "hud.sonar": "Sonar",
    "hud.oxygene": "Oxygène",
    "hud.metres": "m",

    "palier.plateau": "Plateau continental",
    "palier.talus": "Talus",
    "palier.plaine": "Plaine abyssale",
    "palier.fosse": "Fosse",

    "ctrl.gauche": "Ouest",
    "ctrl.droite": "Est",
    "ctrl.bas": "Descendre",
    "ctrl.sonar": "Sonar",
    "ctrl.fin": "Terminer la partie",
    "ctrl.pause": "Pause",
    "ctrl.son": "Son",
    "ctrl.theme": "Thème",
    "ctrl.langue": "Passer en anglais",

    "fin.titre": "Fin de la plongée",
    "fin.record": "Meilleur score",
    "fin.profondeur": "Profondeur atteinte",
    "fin.nouveauRecord": "Nouveau record",
    "fin.rejouer": "Replonger",
    "fin.accueil": "Retour à l'accueil",
    "fin.raison.oxygene": "Réserve d'oxygène épuisée.",
    "fin.raison.bloque": "Foreur bloqué, plus aucune issue ni charge de sonar.",
    "fin.raison.manuel": "Remontée volontaire.",

    "pwa.installer": "Installer Le Foreur Maritime sur votre appareil",
    "pwa.fermer": "Fermer",

    "footer.propulse": "Propulsé par"
  },

  en: {
    "app.titre": "The Maritime Driller",
    "app.tagline": "Dig as deep as you can, collect gold and diamonds before your oxygen runs out.",

    "accueil.jouer": "Start the dive",
    "accueil.reprendre": "Resume",
    "accueil.record": "Best score",
    "accueil.legende": "What you will run into",
    "accueil.commandes": "Swipe the screen or use the controls. On keyboard: arrow keys to dig, spacebar for sonar.",

    "legende.terre": "Sediment",
    "legende.terre.desc": "Digs freely",
    "legende.roche": "Rock",
    "legende.roche.desc": "Impassable, use the sonar",
    "legende.or": "Gold",
    "legende.or.desc": "Points and a little oxygen",
    "legende.diamant": "Diamond",
    "legende.diamant.desc": "Big gain and oxygen refill",
    "legende.joueur": "Driller",
    "legende.joueur.desc": "Your position",

    "hud.profondeur": "Depth",
    "hud.score": "Score",
    "hud.sonar": "Sonar",
    "hud.oxygene": "Oxygen",
    "hud.metres": "m",

    "palier.plateau": "Continental shelf",
    "palier.talus": "Continental slope",
    "palier.plaine": "Abyssal plain",
    "palier.fosse": "Trench",

    "ctrl.gauche": "West",
    "ctrl.droite": "East",
    "ctrl.bas": "Dig down",
    "ctrl.sonar": "Sonar",
    "ctrl.fin": "End game",
    "ctrl.pause": "Pause",
    "ctrl.son": "Sound",
    "ctrl.theme": "Theme",
    "ctrl.langue": "Switch to French",

    "fin.titre": "Dive over",
    "fin.record": "Best score",
    "fin.profondeur": "Depth reached",
    "fin.nouveauRecord": "New record",
    "fin.rejouer": "Dive again",
    "fin.accueil": "Back to home",
    "fin.raison.oxygene": "Oxygen reserve depleted.",
    "fin.raison.bloque": "Driller stuck, no way out and no sonar charge left.",
    "fin.raison.manuel": "Voluntary ascent.",

    "pwa.installer": "Install The Maritime Driller on your device",
    "pwa.fermer": "Close",

    "footer.propulse": "Powered by"
  }
};

/* Langue active du module */
let langueActive = CONFIG.langues.FR;

export function definirLangue(langue) {
  langueActive = TEXTES[langue] ? langue : CONFIG.langues.FR;
}

export function langueCourante() {
  return langueActive;
}

/* Retourne le texte associe a la cle, ou la cle elle meme si elle est absente */
export function t(cle) {
  const dictionnaire = TEXTES[langueActive] || TEXTES[CONFIG.langues.FR];
  return dictionnaire[cle] !== undefined ? dictionnaire[cle] : cle;
}

/* Applique les traductions sur tous les elements porteurs d'un attribut data-i18n.
   data-i18n remplit le texte, data-i18n-aria remplit aria-label et title. */
export function appliquerTraductions(racine = document) {
  racine.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.getAttribute("data-i18n"));
  });

  racine.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    const texte = t(element.getAttribute("data-i18n-aria"));
    element.setAttribute("aria-label", texte);
    element.setAttribute("title", texte);
  });
}