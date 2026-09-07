/* Entrees utilisateur : boutons, clavier, balayage tactile et tap sur une case voisine.
   Le module ne connait que des actions, pas la regle de jeu. */

import { CONFIG } from "./config.js";
import { etat, deplacer, utiliserSonar, terminer } from "./jeu.js";
import { RAISONS_FIN } from "./config.js";
import { coordonneesDepuisCible } from "./rendu.js";

/* Les commandes ne repondent que lorsque l'ecran de jeu est actif */
function jeuJouable() {
  return etat.enCours && document.body.dataset.ecran === "jeu";
}

/* Deplace vers une case voisine touchee du doigt */
function allerVers(x, y) {
  const dx = x - etat.joueurX;
  const dy = y - etat.joueurY;
  const estVoisineDirecte = Math.abs(dx) + Math.abs(dy) === 1;
  if (estVoisineDirecte) deplacer(dx, dy);
}

function brancherBoutons() {
  const associations = [
    ["boutonGauche", () => deplacer(-1, 0)],
    ["boutonDroit", () => deplacer(1, 0)],
    ["boutonBas", () => deplacer(0, 1)],
    ["boutonSonar", () => utiliserSonar()],
    ["boutonFin", () => terminer(RAISONS_FIN.MANUEL)]
  ];

  associations.forEach(([identifiant, action]) => {
    const bouton = document.getElementById(identifiant);
    if (!bouton) return;
    bouton.addEventListener("click", () => {
      if (jeuJouable()) action();
    });
  });
}

function brancherClavier() {
  document.addEventListener("keydown", (evenement) => {
    if (!jeuJouable()) return;

    switch (evenement.key) {
      case "ArrowLeft":
        evenement.preventDefault();
        deplacer(-1, 0);
        break;
      case "ArrowRight":
        evenement.preventDefault();
        deplacer(1, 0);
        break;
      case "ArrowDown":
        evenement.preventDefault();
        deplacer(0, 1);
        break;
      case " ":
      case "Spacebar":
        evenement.preventDefault();
        utiliserSonar();
        break;
      default:
        break;
    }
  });
}

/* Balayage : un geste horizontal deplace lateralement, un geste vers le bas creuse */
function brancherBalayage(zone) {
  let depart = null;

  zone.addEventListener("pointerdown", (evenement) => {
    if (!jeuJouable()) return;
    depart = { x: evenement.clientX, y: evenement.clientY, cible: evenement.target };
  });

  zone.addEventListener("pointerup", (evenement) => {
    if (!depart || !jeuJouable()) return;

    const deltaX = evenement.clientX - depart.x;
    const deltaY = evenement.clientY - depart.y;
    const seuil = CONFIG.interaction.seuilBalayage;
    const distance = Math.max(Math.abs(deltaX), Math.abs(deltaY));

    if (distance < seuil) {
      /* Geste trop court : on interprete un tap sur une case voisine */
      const coordonnees = coordonneesDepuisCible(depart.cible, etat.fenetre);
      if (coordonnees) allerVers(coordonnees.x, coordonnees.y);
      depart = null;
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      deplacer(deltaX > 0 ? 1 : -1, 0);
    } else if (deltaY > 0) {
      deplacer(0, 1);
    }

    depart = null;
  });

  zone.addEventListener("pointercancel", () => { depart = null; });
}

export function activerControles(zone) {
  brancherBoutons();
  brancherClavier();
  brancherBalayage(zone);
}