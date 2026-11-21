"use strict";
// Interface graphique de Mirage : dessine le lac en 2.5D sur un <canvas> et envoie les
// commandes au serveur (les règles restent côté serveur, comme dans la version console).

const CW = 62; // largeur d'une case
const CH = 46; // hauteur (profondeur de vue) d'une case
const EPAISSEUR = 9; // épaisseur de la dalle de sel
const MARGE = 28;
const HAUT_RELIEF = 34; // place au-dessus de la première ligne pour les reliefs et les chameaux

const COULEUR_JOUEUR = { J1: "#e8742a", J2: "#1f9db0" };
const NOMS_TERRAIN = {
  croute: "Croûte",
  dune: "Dune",
  oasis: "Oasis",
  "puits-sec": "Puits sec",
  "?": "Inconnu",
};
const NOMS_SEL = {
  Solide: "solide",
  Craquelee: "craquelé",
  Boue: "boue",
  CrouteFragile: "croûte fragile",
  "?": "?",
};
const NOMS_PHASE = {
  Aube: "Aube",
  Matin: "Matin",
  Zenith: "Zénith",
  Crepuscule: "Crépuscule",
  Nuit: "Nuit",
};
const ICONES_PHASE = { Aube: "🌅", Matin: "🌤", Zenith: "☀️", Crepuscule: "🌇", Nuit: "🌙" };
const ORDRE_PHASES = ["Aube", "Matin", "Zenith", "Crepuscule", "Nuit"];
const NOMS_CHAMEAU = { Repose: "Reposé", Assoiffe: "Assoiffé", Panique: "Paniqué" };
const DIRECTIONS = { n: [0, -1], s: [0, 1], e: [1, 0], o: [-1, 0] };

const toile = document.getElementById("lac");
const ctx = toile.getContext("2d");
const el = (id) => document.getElementById(id);

let etat = null; // dernier état reçu du serveur
let attenteEcran = true; // l'écran de passage est affiché : on ne dessine pas la vue du joueur
let carteChoisie = null; // carte Mirage en cours de ciblage
let survol = null; // case sous la souris
const affiche = { J1: null, J2: null }; // positions animées des caravanes
const orientation = { J1: 1, J2: -1 }; // 1 = regarde à droite
const ondes = []; // petits effets visuels (sonde, balise)
let occupe = false;

// ---------------------------------------------------------------------------------------
// Communication avec le serveur
// ---------------------------------------------------------------------------------------

async function appeler(chemin, corps) {
  const reponse = await fetch(chemin, {
    method: corps === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json" },
    body: corps === undefined ? undefined : JSON.stringify(corps),
  });
  return reponse.json();
}

async function envoyer(texte) {
  if (occupe || attenteEcran || !etat || etat.terminee) {
    return;
  }
  occupe = true;
  try {
    const avant = etat;
    const reponse = await appeler("/api/commande", { texte });
    for (const message of reponse.messages) {
      if (!reponse.ok) {
        toast(message, "erreur");
      } else if (message.startsWith("Sonde")) {
        toast(message, "info");
      }
    }
    if (reponse.ok) {
      effetsApres(texte, avant, reponse.etat);
    }
    appliquer(reponse.etat);
  } catch {
    toast("Le serveur ne répond pas.", "erreur");
  } finally {
    occupe = false;
  }
}

function effetsApres(texte, avant, apres) {
  const j = avant.joueur;
  const c = apres.caravanes[j];
  const mot = texte.trim().toLowerCase().split(/\s+/)[0];
  if (DIRECTIONS[mot]) {
    orientation[j] = DIRECTIONS[mot][0] !== 0 ? DIRECTIONS[mot][0] : orientation[j];
  }
  if (mot === "sonder") {
    const d = DIRECTIONS[texte.trim().toLowerCase().split(/\s+/)[1]] || [0, 0];
    ajouterOnde(c.x + d[0], c.y + d[1], "#4fc3f7");
  }
  if (mot === "balise") {
    ajouterOnde(c.x, c.y, "#e53935");
  }
  if (mot === "boire") {
    ajouterOnde(c.x, c.y, "#29b6f6");
  }
}

function ajouterOnde(x, y, couleur) {
  ondes.push({ x, y, couleur, debut: performance.now() });
}

// ---------------------------------------------------------------------------------------
// Mise à jour de l'interface (panneau, ciel, écrans)
// ---------------------------------------------------------------------------------------

function appliquer(nouveau) {
  const premier = etat === null;
  const changementJoueur = etat !== null && nouveau.joueur !== etat.joueur;
  etat = nouveau;

  if (premier) {
    dimensionner();
    for (const j of ["J1", "J2"]) {
      affiche[j] = { x: etat.caravanes[j].x, y: etat.caravanes[j].y };
    }
    orientation.J1 = 1;
    orientation.J2 = -1;
  }

  document.body.dataset.phase = etat.phase;
  mettreAJourPanneau();

  if (etat.terminee) {
    montrerEcran(
      etat.vainqueur === "Egalite" ? "Égalité" : `Victoire de ${etat.vainqueur} !`,
      etat.vainqueur === "Egalite"
        ? "Personne n'a traversé le lac à temps."
        : `${etat.vainqueur} a traversé le lac de sel. Le mirage n'a pas suffi…`,
      "Rejouer",
      nouvellePartie,
    );
    return;
  }
  if (changementJoueur) {
    attenteEcran = true;
    montrerEcran(
      `Au tour de ${etat.joueur}`,
      `Passe l'écran à ${etat.joueur}. Que l'autre joueur ne regarde pas !`,
      `Je suis ${etat.joueur}`,
      () => {
        attenteEcran = false;
        cacherEcran();
      },
    );
  }
}

function mettreAJourPanneau() {
  const j = etat.joueur;
  const moi = etat.caravanes[j];
  const carte = el("carte-joueur");
  carte.dataset.joueur = j;
  el("nom-joueur").textContent = j === "J1" ? "Joueur 1" : "Joueur 2";
  el("tour").textContent = `Tour ${etat.tour}`;
  el("phase-texte").textContent = `${ICONES_PHASE[etat.phase]} ${NOMS_PHASE[etat.phase]}`;
  el("description-phase").textContent = etat.descriptionPhase;

  const PA_MAX = 3;
  el("pa").innerHTML = Array.from(
    { length: Math.max(PA_MAX, etat.pa) },
    (_, i) => `<span class="pip pa${i < etat.pa ? "" : " vide"}"></span>`,
  ).join("");
  el("outres").innerHTML =
    moi.outres > 0
      ? Array.from({ length: moi.outres }, () => '<span class="pip goutte">💧</span>').join("")
      : '<span class="vide-txt">aucune</span>';
  el("cartes").innerHTML =
    moi.cartes > 0
      ? Array.from({ length: moi.cartes }, () => '<span class="pip carte-p">★</span>').join("")
      : '<span class="vide-txt">aucune</span>';

  const badge = el("chameau");
  badge.textContent = NOMS_CHAMEAU[moi.chameau] + (moi.enlisee ? " · enlisé" : "");
  badge.className = `badge ${moi.chameau}${moi.enlisee ? " enlisee" : ""}`;

  el("frise").innerHTML = ORDRE_PHASES.map(
    (p) =>
      `<div class="etape${p === etat.phase ? " actuelle" : ""}"><span>${ICONES_PHASE[p]}</span>${NOMS_PHASE[p]}</div>`,
  ).join("");

  const journal = el("journal");
  journal.innerHTML = etat.journal
    .map((ligne) => {
      const classe = ligne.startsWith("Phase")
        ? "phase"
        : /Victoire|égalité/.test(ligne)
          ? "fin-partie"
          : "";
      return `<li class="${classe}">${echapper(ligne)}</li>`;
    })
    .join("");
  journal.scrollTop = journal.scrollHeight;

  const bloque = etat.terminee || attenteEcran;
  document.querySelectorAll("[data-cmd]").forEach((b) => (b.disabled = bloque));
  document.querySelectorAll("[data-carte]").forEach((b) => {
    b.disabled = bloque || moi.cartes === 0 || etat.pa < 2;
    b.classList.toggle("choisie", b.dataset.carte === carteChoisie);
  });
  el("aide-ciblage").textContent = carteChoisie
    ? "Clique la case du lac à piéger (Échap pour annuler)."
    : "Choisis une carte puis clique une case du lac.";
  toile.classList.toggle("cible", carteChoisie !== null);
}

function echapper(texte) {
  return texte.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
}

function montrerEcran(titre, texte, bouton, action) {
  el("ecran-titre").textContent = titre;
  el("ecran-texte").textContent = texte;
  const b = el("ecran-bouton");
  b.textContent = bouton;
  b.onclick = action;
  el("ecran").classList.add("visible");
}

function cacherEcran() {
  el("ecran").classList.remove("visible");
  mettreAJourPanneau();
}

function toast(message, type = "") {
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.textContent = message;
  el("toasts").appendChild(t);
  setTimeout(() => t.remove(), type === "info" ? 4500 : 3000);
}

async function nouvellePartie() {
  const reponse = await appeler("/api/nouvelle", {});
  etat = null;
  carteChoisie = null;
  attenteEcran = true;
  appliquer(reponse.etat);
  montrerEcran(
    "MIRAGE",
    "Nouvelle partie : un nouveau lac t'attend. Joueur 1 commence.",
    "Commencer",
    () => {
      attenteEcran = false;
      cacherEcran();
    },
  );
}

// ---------------------------------------------------------------------------------------
// Dessin
// ---------------------------------------------------------------------------------------

function dimensionner() {
  const largeur = etat.largeur * CW + 2 * MARGE;
  const hauteur = etat.hauteur * CH + 2 * MARGE + HAUT_RELIEF + EPAISSEUR;
  const ratio = window.devicePixelRatio || 1;
  toile.width = Math.round(largeur * ratio);
  toile.height = Math.round(hauteur * ratio);
  toile.style.aspectRatio = `${largeur} / ${hauteur}`;
  toile.dataset.largeur = String(largeur);
  toile.dataset.hauteur = String(hauteur);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

const origineX = () => MARGE;
const origineY = () => MARGE + HAUT_RELIEF;

function pseudoAlea(x, y, n = 0) {
  const v = Math.sin(x * 127.1 + y * 311.7 + n * 74.7) * 43758.5453;
  return v - Math.floor(v);
}

function reliefDe(caseVue) {
  switch (caseVue.terrain) {
    case "dune":
      return 11;
    case "oasis":
      return 0;
    case "puits-sec":
      return -5;
    default:
      return 0;
  }
}

const COULEURS_TERRAIN = {
  croute: ["#f3eee2", "#d9d2bf"],
  dune: ["#ebbd6a", "#b98a3c"],
  oasis: ["#6cc279", "#3f8f52"],
  "puits-sec": ["#4b3d36", "#2a201c"],
  "?": ["#58647f", "#3a4560"],
};

function dessinerCase(caseVue, x, y, t) {
  const px = origineX() + x * CW;
  const e = reliefDe(caseVue);
  const py = origineY() + y * CH - e;
  const [haut, flanc] = COULEURS_TERRAIN[caseVue.terrain] || COULEURS_TERRAIN["?"];
  const g = 1.5; // petit joint entre les cases

  // Flanc de la dalle
  ctx.fillStyle = flanc;
  ctx.beginPath();
  ctx.roundRect(px + g, py + CH * 0.5, CW - 2 * g, CH * 0.5 + EPAISSEUR + e, 6);
  ctx.fill();

  // Dessus
  const degrade = ctx.createLinearGradient(px, py, px, py + CH);
  degrade.addColorStop(0, haut);
  degrade.addColorStop(1, ombrer(haut, 0.9));
  ctx.fillStyle = degrade;
  ctx.beginPath();
  ctx.roundRect(px + g, py + g, CW - 2 * g, CH - 2 * g, 7);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(px + g, py + g, CW - 2 * g, CH - 2 * g, 7);
  ctx.clip();
  if (caseVue.terrain === "?") {
    dessinerBrume(px, py, x, y, t);
  } else {
    decorTerrain(caseVue, px, py, x, y, t);
    couchePourEtat(caseVue.etat, px, py, x, y, t);
  }
  ctx.restore();

  if (caseVue.balise) {
    dessinerBalise(px + CW * 0.72, py + CH * 0.78, t);
  }
}

function ombrer(hex, facteur) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * facteur);
  const g = Math.round(((n >> 8) & 255) * facteur);
  const b = Math.round((n & 255) * facteur);
  return `rgb(${r},${g},${b})`;
}

function decorTerrain(caseVue, px, py, x, y, t) {
  switch (caseVue.terrain) {
    case "croute": {
      // grains de sel
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(
          px + 6 + pseudoAlea(x, y, i) * (CW - 14),
          py + 5 + pseudoAlea(x, y, i + 9) * (CH - 12),
          2,
          2,
        );
      }
      ctx.strokeStyle = "rgba(160,150,125,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + 8, py + CH * 0.55);
      ctx.lineTo(px + CW * 0.4, py + CH * 0.45);
      ctx.lineTo(px + CW * 0.62, py + CH * 0.6);
      ctx.stroke();
      break;
    }
    case "dune": {
      ctx.strokeStyle = "rgba(255,240,200,0.7)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(px + 6, py + 12 + i * 11);
        ctx.quadraticCurveTo(px + CW / 2, py + 3 + i * 11, px + CW - 6, py + 12 + i * 11);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(120,80,20,0.25)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px + 6, py + 17);
      ctx.quadraticCurveTo(px + CW / 2, py + 8, px + CW - 6, py + 17);
      ctx.stroke();
      break;
    }
    case "oasis": {
      const onde = Math.sin(t / 500 + x + y) * 1.5;
      ctx.fillStyle = "#3aa6d9";
      ctx.beginPath();
      ctx.ellipse(px + CW * 0.42, py + CH * 0.62, 17 + onde * 0.3, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(px + CW * 0.42, py + CH * 0.62, 11 + onde, 5, 0, 0.2, Math.PI * 1.3);
      ctx.stroke();
      dessinerPalmier(px + CW * 0.74, py + CH * 0.62, t, x + y);
      break;
    }
    case "puits-sec": {
      ctx.fillStyle = "#120c0a";
      ctx.beginPath();
      ctx.ellipse(px + CW / 2, py + CH * 0.55, 20, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#8c6a52";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(px + CW / 2, py + CH * 0.55, 20, 12, 0, 0, Math.PI * 2);
      ctx.stroke();
      // fissures
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(px + 4, py + 6);
      ctx.lineTo(px + 15, py + 17);
      ctx.moveTo(px + CW - 4, py + CH - 6);
      ctx.lineTo(px + CW - 16, py + CH - 17);
      ctx.stroke();
      break;
    }
  }
}

function dessinerPalmier(bx, by, t, graine) {
  const bal = Math.sin(t / 700 + graine) * 2;
  ctx.strokeStyle = "#7b5a35";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.quadraticCurveTo(bx + 3, by - 12, bx + bal, by - 22);
  ctx.stroke();
  ctx.fillStyle = "#2f8f46";
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.ellipse(bx + bal + i * 5, by - 22 + Math.abs(i) * 2.5, 7, 2.6, i * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function couchePourEtat(sel, px, py, x, y, t) {
  switch (sel) {
    case "Craquelee": {
      ctx.strokeStyle = "rgba(70,50,30,0.55)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(px + 4, py + CH * 0.3);
      ctx.lineTo(px + CW * 0.35, py + CH * 0.5);
      ctx.lineTo(px + CW * 0.5, py + CH * 0.35);
      ctx.lineTo(px + CW * 0.8, py + CH * 0.7);
      ctx.moveTo(px + CW * 0.35, py + CH * 0.5);
      ctx.lineTo(px + CW * 0.3, py + CH - 5);
      ctx.moveTo(px + CW * 0.8, py + CH * 0.7);
      ctx.lineTo(px + CW - 4, py + CH * 0.6);
      ctx.stroke();
      break;
    }
    case "Boue": {
      ctx.fillStyle = "rgba(96,64,36,0.62)";
      ctx.fillRect(px, py, CW, CH);
      for (let i = 0; i < 3; i++) {
        const phase = (t / 900 + pseudoAlea(x, y, i) * 3) % 1;
        ctx.fillStyle = `rgba(150,110,70,${0.7 - phase * 0.6})`;
        ctx.beginPath();
        ctx.arc(
          px + 12 + pseudoAlea(x, y, i + 3) * (CW - 24),
          py + 10 + pseudoAlea(x, y, i + 6) * (CH - 20),
          2 + phase * 4,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      break;
    }
    case "CrouteFragile": {
      ctx.fillStyle = "rgba(200,230,245,0.45)";
      ctx.fillRect(px, py, CW, CH);
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + 6, py + 8);
      ctx.lineTo(px + CW - 8, py + CH - 10);
      ctx.moveTo(px + CW - 6, py + 10);
      ctx.lineTo(px + 10, py + CH - 8);
      ctx.stroke();
      const eclat = 0.25 + 0.25 * Math.sin(t / 400 + x * 2 + y);
      ctx.fillStyle = `rgba(255,255,255,${eclat})`;
      ctx.fillRect(px, py, CW, CH);
      break;
    }
  }
}

function dessinerBrume(px, py, x, y, t) {
  ctx.fillStyle = "rgba(180,195,230,0.16)";
  for (let i = 0; i < 3; i++) {
    const dx = Math.sin(t / 2200 + x * 0.9 + i * 2) * 8;
    ctx.beginPath();
    ctx.ellipse(px + CW / 2 + dx, py + CH * (0.3 + i * 0.22), 24, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(220,230,255,0.35)";
  ctx.font = "bold 18px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("?", px + CW / 2, py + CH / 2);
}

function dessinerBalise(bx, by, t) {
  ctx.strokeStyle = "#5a3b22";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx, by - 22);
  ctx.stroke();
  const flotte = Math.sin(t / 220) * 2;
  ctx.fillStyle = "#e53935";
  ctx.beginPath();
  ctx.moveTo(bx, by - 22);
  ctx.quadraticCurveTo(bx + 9, by - 22 + flotte, bx + 14, by - 18);
  ctx.quadraticCurveTo(bx + 9, by - 14 - flotte, bx, by - 12);
  ctx.closePath();
  ctx.fill();
}

// ---- Lignes de départ / d'arrivée ----
function dessinerLignesBut() {
  const largeur = etat.largeur * CW;
  const lignes = [
    { y: 0, texte: "▼ départ J1 · arrivée J2 ▲", couleur: COULEUR_JOUEUR.J2 },
    { y: etat.hauteur - 1, texte: "▲ départ J2 · arrivée J1 ▼", couleur: COULEUR_JOUEUR.J1 },
  ];
  for (const ligne of lignes) {
    const py = origineY() + ligne.y * CH;
    ctx.strokeStyle = ligne.couleur;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 6]);
    ctx.strokeRect(origineX() - 3, py - 3, largeur + 6, CH + 6);
    ctx.setLineDash([]);
  }
}

// ---- Caravane (chameau vu de profil) ----
function dessinerCaravane(joueur, pos, info, t) {
  const px = origineX() + pos.x * CW + CW / 2;
  const caseVue = etat.grille[Math.round(pos.y)]?.[Math.round(pos.x)];
  const e = caseVue ? reliefDe(caseVue) : 0;
  let py = origineY() + pos.y * CH + CH * 0.86 - e;
  const sens = orientation[joueur];
  const marche = Math.abs(pos.x - info.x) + Math.abs(pos.y - info.y) > 0.05;
  const rebond = marche
    ? Math.abs(Math.sin(t / 90)) * 4
    : Math.sin(t / 600 + (joueur === "J1" ? 0 : 2)) * 1.2;
  const tremble = info.chameau === "Panique" ? Math.sin(t / 35) * 1.8 : 0;
  const enfonce = info.enlisee ? 9 : 0;
  py += enfonce;

  ctx.save();
  ctx.translate(px + tremble, py);
  ctx.scale(sens, 1);

  // ombre
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 2, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(0, -rebond);
  const poil = info.chameau === "Assoiffe" ? "#b88a52" : "#c99b5e";
  const fonce = "#8d6636";

  // pattes (animées quand ça marche)
  ctx.strokeStyle = fonce;
  ctx.lineCap = "round";
  ctx.lineWidth = 4;
  const pas = marche ? Math.sin(t / 90) * 5 : 0;
  for (const [dx, dec] of [
    [-12, pas],
    [-6, -pas],
    [8, -pas],
    [14, pas],
  ]) {
    ctx.beginPath();
    ctx.moveTo(dx, -13);
    ctx.lineTo(dx + dec * 0.6, 0);
    ctx.stroke();
  }

  // queue
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-19, -22);
  ctx.quadraticCurveTo(-25, -18, -23, -9);
  ctx.stroke();

  // corps
  ctx.fillStyle = poil;
  ctx.beginPath();
  ctx.ellipse(0, -20, 19, 9.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // bosse
  ctx.beginPath();
  ctx.ellipse(-3, -30, 7, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // couverture du joueur
  ctx.fillStyle = COULEUR_JOUEUR[joueur];
  ctx.beginPath();
  ctx.roundRect(-10, -27, 15, 12, 3);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillRect(-10, -22, 15, 2.5);
  // cou et tête
  ctx.strokeStyle = poil;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(14, -23);
  ctx.quadraticCurveTo(22, -30, 22, -38);
  ctx.stroke();
  ctx.fillStyle = poil;
  ctx.beginPath();
  ctx.ellipse(25, -40, 7.5, 4.8, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1b120a";
  ctx.beginPath();
  ctx.arc(26, -41.5, 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // icônes d'état (non retournées)
  const ix = px;
  const iy = py - 58 - rebond;
  ctx.font = "16px Segoe UI Emoji, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (info.chameau === "Panique") ctx.fillText("😱", ix, iy);
  else if (info.chameau === "Assoiffe") ctx.fillText("🥵", ix, iy);
  if (info.enlisee) ctx.fillText("🕳", ix + 18, iy + 4);
}

function dessinerOndes(t) {
  for (let i = ondes.length - 1; i >= 0; i--) {
    const o = ondes[i];
    const age = (t - o.debut) / 700;
    if (age >= 1) {
      ondes.splice(i, 1);
      continue;
    }
    ctx.strokeStyle = o.couleur;
    ctx.globalAlpha = 1 - age;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(
      origineX() + o.x * CW + CW / 2,
      origineY() + o.y * CH + CH / 2,
      10 + age * 40,
      6 + age * 24,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function dessinerSurbrillances(t) {
  if (!etat || etat.terminee || attenteEcran) return;
  const moi = etat.caravanes[etat.joueur];
  const pulse = 0.35 + 0.2 * Math.sin(t / 260);
  if (carteChoisie === null) {
    for (const [dx, dy] of Object.values(DIRECTIONS)) {
      const x = moi.x + dx;
      const y = moi.y + dy;
      if (x < 0 || y < 0 || x >= etat.largeur || y >= etat.hauteur) continue;
      ctx.fillStyle = `rgba(255,255,255,${pulse})`;
      ctx.beginPath();
      ctx.roundRect(origineX() + x * CW + 3, origineY() + y * CH + 3, CW - 6, CH - 6, 7);
      ctx.fill();
    }
  }
  if (survol) {
    ctx.strokeStyle = carteChoisie ? "#7b5ea7" : COULEUR_JOUEUR[etat.joueur];
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(
      origineX() + survol.x * CW + 1,
      origineY() + survol.y * CH + 1,
      CW - 2,
      CH - 2,
      7,
    );
    ctx.stroke();
  }
}

function teinteDuJour() {
  const teintes = {
    Aube: "rgba(255,170,160,0.10)",
    Matin: "rgba(255,255,255,0)",
    Zenith: "rgba(255,240,170,0.13)",
    Crepuscule: "rgba(255,110,60,0.16)",
    Nuit: "rgba(10,20,70,0.40)",
  };
  return teintes[etat.phase];
}

function dessiner(t) {
  const largeur = Number(toile.dataset.largeur);
  const hauteur = Number(toile.dataset.hauteur);
  ctx.clearRect(0, 0, largeur, hauteur);

  // Fond du désert
  const fond = ctx.createLinearGradient(0, 0, 0, hauteur);
  fond.addColorStop(0, "#e6c488");
  fond.addColorStop(1, "#c79a5a");
  ctx.fillStyle = fond;
  ctx.fillRect(0, 0, largeur, hauteur);

  if (!etat || attenteEcran) {
    return;
  }

  // Cases, rangée par rangée (de l'arrière vers l'avant). Une caravane est dessinée après la
  // rangée suivante, sinon le relief d'une dune devant elle lui masquerait les pattes.
  const dessinerCaravanes = (rangee) => {
    for (const j of ["J1", "J2"]) {
      const pos = affiche[j];
      if (pos && Math.round(pos.y) === rangee) {
        dessinerCaravane(j, pos, etat.caravanes[j], t);
      }
    }
  };
  for (let y = 0; y < etat.hauteur; y++) {
    for (let x = 0; x < etat.largeur; x++) {
      dessinerCase(etat.grille[y][x], x, y, t);
    }
    dessinerCaravanes(y - 1);
  }
  dessinerCaravanes(etat.hauteur - 1);

  dessinerLignesBut();
  dessinerSurbrillances(t);
  dessinerOndes(t);

  // Lumière du moment de la journée
  ctx.fillStyle = teinteDuJour();
  ctx.fillRect(0, 0, largeur, hauteur);
  if (etat.phase === "Zenith") {
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const yy = (t / 40 + i * 130) % hauteur;
      ctx.beginPath();
      for (let x = 0; x <= largeur; x += 12) {
        ctx.lineTo(x, yy + Math.sin(x / 18 + t / 300) * 3);
      }
      ctx.stroke();
    }
  }
}

function animer(t) {
  if (etat) {
    for (const j of ["J1", "J2"]) {
      const cible = etat.caravanes[j];
      const a = affiche[j];
      a.x += (cible.x - a.x) * 0.18;
      a.y += (cible.y - a.y) * 0.18;
      if (Math.abs(cible.x - a.x) < 0.01) a.x = cible.x;
      if (Math.abs(cible.y - a.y) < 0.01) a.y = cible.y;
    }
    dessiner(t);
  }
  requestAnimationFrame(animer);
}

// ---------------------------------------------------------------------------------------
// Entrées : souris et clavier
// ---------------------------------------------------------------------------------------

function caseSousLaSouris(evenement) {
  const rect = toile.getBoundingClientRect();
  const echelle = Number(toile.dataset.largeur) / rect.width;
  const mx = (evenement.clientX - rect.left) * echelle;
  const my = (evenement.clientY - rect.top) * echelle;
  const x = Math.floor((mx - origineX()) / CW);
  const y = Math.floor((my - origineY()) / CH);
  if (!etat || x < 0 || y < 0 || x >= etat.largeur || y >= etat.hauteur) return null;
  return { x, y };
}

toile.addEventListener("mousemove", (e) => {
  survol = caseSousLaSouris(e);
  const insp = el("inspecteur");
  if (survol && etat && !attenteEcran) {
    const c = etat.grille[survol.y][survol.x];
    const sel = c.etat === "?" ? "" : ` · sel ${NOMS_SEL[c.etat]}`;
    insp.textContent = `(${survol.x}, ${survol.y}) ${NOMS_TERRAIN[c.terrain]}${sel}${c.balise ? " · 🚩" : ""}`;
  } else {
    insp.textContent = "Survole une case";
  }
});
toile.addEventListener("mouseleave", () => {
  survol = null;
});

toile.addEventListener("click", (e) => {
  const cible = caseSousLaSouris(e);
  if (!cible || !etat || attenteEcran || etat.terminee) return;
  if (carteChoisie) {
    const carte = carteChoisie;
    carteChoisie = null;
    envoyer(`mirage ${carte} ${cible.x} ${cible.y}`);
    mettreAJourPanneau();
    return;
  }
  const moi = etat.caravanes[etat.joueur];
  const dx = cible.x - moi.x;
  const dy = cible.y - moi.y;
  if (Math.abs(dx) + Math.abs(dy) === 1) {
    envoyer(dx === 1 ? "e" : dx === -1 ? "o" : dy === 1 ? "s" : "n");
  } else if (dx === 0 && dy === 0) {
    envoyer("sonder ici");
  } else {
    toast("Tu ne peux avancer que sur une case voisine (N, S, E, O).", "erreur");
  }
});

document
  .querySelectorAll("[data-cmd]")
  .forEach((b) => b.addEventListener("click", () => envoyer(b.dataset.cmd)));
document.querySelectorAll("[data-carte]").forEach((b) =>
  b.addEventListener("click", () => {
    carteChoisie = carteChoisie === b.dataset.carte ? null : b.dataset.carte;
    mettreAJourPanneau();
  }),
);
el("nouvelle").addEventListener("click", () => {
  if (confirm("Abandonner la partie et en recommencer une nouvelle ?")) {
    nouvellePartie();
  }
});

const TOUCHES_DIRECTION = {
  ArrowUp: "n",
  w: "n",
  z: "n",
  ArrowDown: "s",
  s: "s",
  ArrowLeft: "o",
  a: "o",
  q: "o",
  ArrowRight: "e",
  d: "e",
};

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const touche = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (touche === "Escape") {
    carteChoisie = null;
    mettreAJourPanneau();
    return;
  }
  if (touche === "Enter" && el("ecran").classList.contains("visible")) {
    el("ecran-bouton").click();
    return;
  }
  if (attenteEcran) return;

  // Maj + flèche : sonder la case voisine
  if (e.shiftKey && TOUCHES_DIRECTION[e.key] !== undefined) {
    e.preventDefault();
    envoyer(`sonder ${TOUCHES_DIRECTION[e.key]}`);
    return;
  }
  // ZQSD (AZERTY), WASD (QWERTY) ou flèches pour avancer ; X sonde, B balise, R boit
  if (TOUCHES_DIRECTION[touche] !== undefined) {
    e.preventDefault();
    envoyer(TOUCHES_DIRECTION[touche]);
  } else if (touche === "x") {
    envoyer("sonder ici");
  } else if (touche === "b") {
    envoyer("balise");
  } else if (touche === "r") {
    envoyer("boire");
  } else if (touche === "Enter") {
    envoyer("fin");
  }
});

// ---------------------------------------------------------------------------------------
// Démarrage
// ---------------------------------------------------------------------------------------

(async function demarrer() {
  const reponse = await appeler("/api/etat");
  attenteEcran = true;
  appliquer(reponse.etat);
  montrerEcran(
    "MIRAGE",
    "Traverse le lac de sel avant ton adversaire. J1 part du haut, J2 part du bas. Les apparences sont trompeuses…",
    "Commencer",
    () => {
      attenteEcran = false;
      cacherEcran();
    },
  );
  requestAnimationFrame(animer);
})();
