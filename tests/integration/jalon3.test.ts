import { beforeEach, describe, expect, it } from "vitest";
import { demarrerPartie } from "../../src/assemblage";
import { PORTEE_BRUME, TOURS_PAR_PHASE } from "../../src/config/constantes";
import type { IdJoueur, NomCarte, Position } from "../../src/contrats";
import { JouerMirage, Partie, PoserBalise } from "../../src/temps";

/**
 * Jalon 3 : les vrais modules lac/, perception/ et temps/ assemblés ensemble (comme dans
 * main.ts) : phases du Soleil, déformations et cartes Mirage visibles dans la vue des joueurs.
 */
function vrai(partie: Partie, p: Position) {
  const c = partie.plateau.get(p);
  if (c === undefined) throw new Error("case hors du lac");
  return c;
}

function voir(partie: Partie, joueur: IdJoueur, p: Position) {
  return partie.perception(joueur).vueActuelle().voir(p);
}

function manches(partie: Partie, n: number): void {
  for (let i = 0; i < n; i++) {
    partie.finDeTourJoueur();
    partie.finDeTourJoueur();
  }
}

function loinDe(partie: Partie, joueur: IdJoueur, portee: number): Position {
  const { x, y } = partie.caravane(joueur).getPosition();
  const cible = { x, y: y === 0 ? partie.plateau.hauteur - 1 : 0 };
  expect(Math.max(Math.abs(cible.x - x), Math.abs(cible.y - y))).toBeGreaterThan(portee);
  return cible;
}

describe("Jalon 3 : lac + perception + temps assemblés", () => {
  let partie: Partie;

  beforeEach(() => {
    Partie.reinitialiserInstance();
    partie = demarrerPartie();
  });

  it("à l'aube, la brume cache le terrain loin de sa caravane seulement", () => {
    const pos = partie.caravane("J1").getPosition();
    expect(voir(partie, "J1", pos).terrain).toBe(vrai(partie, pos).terrain.nom);
    expect(voir(partie, "J1", loinDe(partie, "J1", PORTEE_BRUME)).terrain).toBe("?");
  });

  it("chaque joueur voit autour de SA caravane, pas de celle de l'autre", () => {
    const posJ2 = partie.caravane("J2").getPosition();
    expect(voir(partie, "J2", posJ2).terrain).toBe(vrai(partie, posJ2).terrain.nom);
    expect(voir(partie, "J1", posJ2).terrain).toBe("?");
  });

  it("le Soleil change la vue : le matin tout est clair, à midi l'état du sel devient flou", () => {
    const loin = loinDe(partie, "J1", PORTEE_BRUME);
    manches(partie, TOURS_PAR_PHASE);
    expect(partie.phase()).toBe("Matin");
    expect(voir(partie, "J1", loin)).toMatchObject({
      terrain: vrai(partie, loin).terrain.nom,
      etat: vrai(partie, loin).getEtat(),
    });
    manches(partie, TOURS_PAR_PHASE);
    expect(partie.phase()).toBe("Zenith");
    expect(voir(partie, "J1", loin).etat).toBe("?");
    expect(voir(partie, "J1", loin).terrain).toBe(vrai(partie, loin).terrain.nom);
  });

  it("la nuit, on ne voit presque rien", () => {
    manches(partie, TOURS_PAR_PHASE * 4);
    expect(partie.phase()).toBe("Nuit");
    expect(voir(partie, "J1", loinDe(partie, "J1", 1))).toMatchObject({ terrain: "?", etat: "?" });
  });

  it("une carte Mirage trompe l'adversaire sans toucher au vrai lac ni à celui qui la joue", () => {
    const cible = partie.caravane("J2").getPosition();
    const reel = vrai(partie, cible).terrain.nom;
    const carte: NomCarte = reel === "oasis" ? "DuneFantome" : "FausseOasis";
    const faux = carte === "FausseOasis" ? "oasis" : "dune";

    partie.executer(new JouerMirage("J1", carte, cible, partie));

    expect(voir(partie, "J2", cible).terrain).toBe(faux);
    expect(vrai(partie, cible).terrain.nom).toBe(reel);
    expect(partie.caravane("J1").cartes()).toBe(2);
  });

  it("une carte Mirage s'efface au bout de quelques tours", () => {
    const cible = partie.caravane("J2").getPosition();
    const reel = vrai(partie, cible).terrain.nom;
    const carte: NomCarte = reel === "oasis" ? "DuneFantome" : "FausseOasis";
    partie.executer(new JouerMirage("J1", carte, cible, partie));
    // Le matin (vue non déformée) : seule la carte peut encore tromper J2.
    manches(partie, TOURS_PAR_PHASE);
    manches(partie, 1);
    expect(voir(partie, "J2", cible).terrain).toBe(reel);
  });

  it("une balise posée est vue par les deux joueurs", () => {
    const pos = partie.caravane("J1").getPosition();
    partie.executer(new PoserBalise("J1", partie));
    expect(voir(partie, "J1", pos).balise).toBe(true);
    expect(voir(partie, "J2", pos).balise).toBe(true);
  });
});
