import { describe, expect, it } from "vitest";
import {
  CARTES_DEPART,
  OUTRES_DEPART,
  SEUIL_SOIF,
  TOURS_PAR_PHASE,
} from "../../src/config/constantes";
import { FabriqueCaravane, FabriqueTerrains } from "../../src/lac";

const dune = new FabriqueTerrains().get("dune"); // coût 2

function nouvelle() {
  return new FabriqueCaravane().creer("J1");
}

/** Nombre de phases nécessaires pour atteindre le seuil de soif. */
const PHASES_AVANT_SOIF = Math.ceil(SEUIL_SOIF / TOURS_PAR_PHASE);

describe("Caravane : départ", () => {
  it("démarre reposée, avec les outres et cartes de départ", () => {
    const c = nouvelle();
    expect(c.getEtatChameau()).toBe("Repose");
    expect(c.outres()).toBe(OUTRES_DEPART);
    expect(c.cartes()).toBe(CARTES_DEPART);
    expect(c.estEnlisee()).toBe(false);
  });

  it("se déplace", () => {
    const c = nouvelle();
    c.deplacer({ x: 3, y: 4 });
    expect(c.getPosition()).toEqual({ x: 3, y: 4 });
  });
});

describe("Caravane : soif et boire", () => {
  it("a soif après le seuil de tours sans boire", () => {
    const c = nouvelle();
    for (let i = 0; i < PHASES_AVANT_SOIF - 1; i++) {
      c.surPhase("Matin");
    }
    expect(c.getEtatChameau()).toBe("Repose");
    c.surPhase("Matin");
    expect(c.getEtatChameau()).toBe("Assoiffe");
  });

  it("boire soulage la soif et consomme une outre", () => {
    const c = nouvelle();
    for (let i = 0; i < PHASES_AVANT_SOIF; i++) {
      c.surPhase("Matin");
    }
    expect(c.boire()).toBe(true);
    expect(c.getEtatChameau()).toBe("Repose");
    expect(c.outres()).toBe(OUTRES_DEPART - 1);
  });

  it("boire remet le compteur de soif à zéro", () => {
    const c = nouvelle();
    c.surPhase("Matin");
    c.boire();
    for (let i = 0; i < PHASES_AVANT_SOIF - 1; i++) {
      c.surPhase("Matin");
    }
    expect(c.getEtatChameau()).toBe("Repose");
  });

  it("boire renvoie false quand il n'y a plus d'outre", () => {
    const c = nouvelle();
    for (let i = 0; i < OUTRES_DEPART; i++) {
      expect(c.boire()).toBe(true);
    }
    expect(c.outres()).toBe(0);
    expect(c.boire()).toBe(false);
  });
});

describe("Caravane : coût de déplacement", () => {
  it("reposé : coût du terrain", () => {
    expect(nouvelle().coutDeplacement(dune)).toBe(dune.cout);
  });

  it("assoiffé : coût du terrain + 1", () => {
    const c = nouvelle();
    for (let i = 0; i < PHASES_AVANT_SOIF; i++) {
      c.surPhase("Matin");
    }
    expect(c.coutDeplacement(dune)).toBe(dune.cout + 1);
  });

  it("paniqué : coût du terrain + 2", () => {
    const c = nouvelle();
    c.paniquer();
    expect(c.coutDeplacement(dune)).toBe(dune.cout + 2);
  });
});

describe("Caravane : panique", () => {
  it("paniquer met le chameau en Panique", () => {
    const c = nouvelle();
    c.paniquer();
    expect(c.getEtatChameau()).toBe("Panique");
  });

  it("la panique dure jusqu'à l'aube", () => {
    const c = nouvelle();
    c.boire(); // remet la soif à zéro
    c.paniquer();
    c.surPhase("Matin");
    c.surPhase("Zenith");
    expect(c.getEtatChameau()).toBe("Panique");
    c.surPhase("Aube");
    expect(c.getEtatChameau()).not.toBe("Panique");
  });

  it("boire ne calme pas la panique", () => {
    const c = nouvelle();
    c.paniquer();
    c.boire();
    expect(c.getEtatChameau()).toBe("Panique");
  });
});

describe("Caravane : enlisement", () => {
  it("s'enlise, puis se dégage à la phase suivante", () => {
    const c = nouvelle();
    c.enliser();
    expect(c.estEnlisee()).toBe(true);
    c.surPhase("Matin");
    expect(c.estEnlisee()).toBe(false);
  });
});

describe("Caravane : cartes", () => {
  it("utiliserCarte consomme une carte puis échoue quand il n'y en a plus", () => {
    const c = nouvelle();
    for (let i = 0; i < CARTES_DEPART; i++) {
      expect(c.utiliserCarte()).toBe(true);
    }
    expect(c.cartes()).toBe(0);
    expect(c.utiliserCarte()).toBe(false);
  });
});
