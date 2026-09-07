/* Gestion sonore.
   iOS refuse toute lecture audio tant qu'aucune interaction utilisateur n'a eu lieu,
   les pistes sont donc debloquees au premier geste puis reutilisees. */

import { CONFIG } from "./config.js";
import { lireSon, ecrireSon } from "./preferences.js";

const pistes = new Map();
let sonActif = true;
let debloque = false;

/* Instancie chaque piste declaree dans la configuration */
export function initialiserAudio() {
  sonActif = lireSon();

  Object.entries(CONFIG.audio.pistes).forEach(([nom, definition]) => {
    const element = new Audio(CONFIG.audio.dossier + definition.fichier);
    element.volume = definition.volume;
    element.preload = "auto";
    pistes.set(nom, element);
  });

  /* Premier geste utilisateur : on amorce chaque piste en muet pour lever le verrou */
  const debloquer = () => {
    if (debloque) return;
    debloque = true;

    pistes.forEach((element) => {
      const volumeInitial = element.volume;
      element.volume = 0;
      const lecture = element.play();
      if (lecture && typeof lecture.then === "function") {
        lecture.then(() => {
          element.pause();
          element.currentTime = 0;
          element.volume = volumeInitial;
        }).catch(() => {
          element.volume = volumeInitial;
        });
      } else {
        element.volume = volumeInitial;
      }
    });

    document.removeEventListener("pointerdown", debloquer);
    document.removeEventListener("keydown", debloquer);
  };

  document.addEventListener("pointerdown", debloquer, { once: false });
  document.addEventListener("keydown", debloquer, { once: false });
}

/* Joue une piste depuis le debut, sans jamais faire echouer le tour de jeu */
export function jouer(nom) {
  if (!sonActif) return;

  const element = pistes.get(nom);
  if (!element) return;

  element.pause();
  element.currentTime = 0;
  const lecture = element.play();
  if (lecture && typeof lecture.catch === "function") {
    lecture.catch(() => { /* lecture refusee par le navigateur, sans consequence */ });
  }
}

export function sonEstActif() {
  return sonActif;
}

export function basculerSon() {
  sonActif = !sonActif;
  ecrireSon(sonActif);
  if (!sonActif) {
    pistes.forEach((element) => element.pause());
  }
  return sonActif;
}