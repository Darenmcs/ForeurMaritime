// ============================
// Etat du jeu
// ============================
export let largeur = 15;
export let hauteur = 10;

export let tableauJeu = [];
export let joueurX = Math.floor(largeur / 2);
export let joueurY = 0;

export let score = 0;
export let profondeur = 0;
export let finJeu = false;

export let explosionDisponible = true;
export let meilleurScore = localStorage.getItem("bestScore") || 0;

// ============================
// Sons
// ============================
// jeu.js est dans /js donc on remonte avec ../
// et chez toi le dossier est: assets/audio/
const sonExplosion = new Audio("../assets/audio/explosionBig.wav");
const sonOr = new Audio("../assets/audio/gold.wav");
const sonDiamant = new Audio("../assets/audio/diamond.wav");
const sonGameOver = new Audio("../assets/audio/gameOver.wav");

sonExplosion.volume = 0.7;
sonOr.volume = 0.5;
sonDiamant.volume = 0.6;
sonGameOver.volume = 0.7;

// rejouer proprement
function jouer(son) {
  son.pause();
  son.currentTime = 0;
  son.play().catch((err) => {
    console.log("Son bloqué ou erreur:", err);
  });
}

// ============================
// Langue
// ============================
export let currentLang = "fr";

export const translations = {
  fr:{
    profondeurPrefix:"Profondeur : ",
    scorePrefix:"Score : ",
    meilleurScorePrefix:"Meilleur score : "
  },
  en:{
    profondeurPrefix:"Depth: ",
    scorePrefix:"Score: ",
    meilleurScorePrefix:"Best Score: "
  }
};

export function setLang(lang){
  currentLang = lang;
}

// ============================
// Générer la grille
// ============================
export function genererTableauJeu(){
  tableauJeu = [];

  for(let y=0;y<hauteur;y++){
    let ligne=[];

    for(let x=0;x<largeur;x++){
      let r=Math.random();
      if(r<0.70) ligne.push("terre");
      else if(r<0.85) ligne.push("roche");
      else if(r<0.99) ligne.push("or");
      else ligne.push("diamant");
    }

    tableauJeu.push(ligne);
  }

  tableauJeu[0][joueurX]="vide";
}

// ============================
// Afficher la grille
// ============================
export function afficherGrille(){
  let zone=document.getElementById("zoneJeu");
  zone.innerHTML="";

  for(let y=0;y<hauteur;y++){
    for(let x=0;x<largeur;x++){
      let tuile=document.createElement("div");
      tuile.classList.add("tuile");
      tuile.classList.add(tableauJeu[y][x]);

      if(x===joueurX && y===joueurY){
        tuile.classList.add("joueur");
      }

      zone.appendChild(tuile);
    }
  }
}

// ============================
// Score
// ============================
export function mettreAJourScore(){
  profondeur=joueurY+1;

  document.getElementById("profondeur").innerText=
    translations[currentLang].profondeurPrefix+profondeur;

  document.getElementById("scoreActuel").innerText=
    translations[currentLang].scorePrefix+score;
}

// ============================
// Déplacement
// ============================
export function deplacerJoueur(dx,dy){
  if(finJeu) return;

  let nx=joueurX+dx;
  let ny=joueurY+dy;

  if(nx<0||nx>=largeur) return;
  if(dy<0) return;

  if(ny>=hauteur){
    finDuJeu();
    return;
  }

  if(tableauJeu[ny][nx]==="roche") return;

  if(tableauJeu[ny][nx]==="or"){
    score+=100;
    jouer(sonOr);
  }
  else if(tableauJeu[ny][nx]==="diamant"){
    score+=1000;
    jouer(sonDiamant);
  }
  else if(tableauJeu[ny][nx]==="terre") score-=50;
  else if(tableauJeu[ny][nx]==="vide") score-=10;

  tableauJeu[ny][nx]="vide";
  joueurX=nx;
  joueurY=ny;

  mettreAJourScore();
  afficherGrille();
}

// ============================
// Explosion
// ============================
export function explosion(){
  if(!explosionDisponible||finJeu) return;

  [[joueurX+1,joueurY],[joueurX-1,joueurY],
   [joueurX,joueurY+1],[joueurX,joueurY-1]].forEach(([x,y])=>{
    if(x>=0&&x<largeur&&y>=0&&y<hauteur){
      tableauJeu[y][x]="vide";
    }
  });

  explosionDisponible=false;
  document.getElementById("boutonExplosion").disabled=true;

  jouer(sonExplosion);
  afficherGrille();
}

// ============================
// Fin du jeu
// ============================
export function finDuJeu(){
  finJeu=true;
  jouer(sonGameOver);

  if(score>meilleurScore){
    meilleurScore=score;
    localStorage.setItem("bestScore",meilleurScore);
  }

  document.getElementById("panneauFinJeu").style.display="flex";

  document.getElementById("texteScoreFinal").innerText=
    translations[currentLang].scorePrefix+score;

  document.getElementById("texteMeilleurScore").innerText=
    translations[currentLang].meilleurScorePrefix+meilleurScore;
}

// ============================
// Reset
// ============================
export function reinitialiserJeu(){
  score=0;
  profondeur=0;
  joueurX=Math.floor(largeur/2);
  joueurY=0;
  finJeu=false;
  explosionDisponible=true;

  document.getElementById("boutonExplosion").disabled=false;
  document.getElementById("panneauFinJeu").style.display="none";

  genererTableauJeu();
  mettreAJourScore();
  afficherGrille();
}
