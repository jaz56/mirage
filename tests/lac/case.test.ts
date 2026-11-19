import { describe, expect, it } from "vitest";
import type { NomEtatSel, NomPhase } from "../../src/contrats";
import { Case, FabriqueTerrains } from "../../src/lac";
import { FausseCaravane } from "../stubs/FausseCaravane";

const terrains = new FabriqueTerrains();

function creerCase(etat: NomEtatSel = "Solide"): Case {
  return new Case({ x: 1, y: 2 }, terrains.get("croute"), etat);
}

describe("Case : état du sel (State)", () => {
  it("démarre en Solide par défaut", () => {
    expect(creerCase().getEtat()).toBe("Solide");
  });

  it("garde sa position et son terrain", () => {
    const c = creerCase();
    expect(c.position).toEqual({ x: 1, y: 2 });
    expect(c.terrain.nom).toBe("croute");
  });

  it("suit un jour complet : Aube, Matin, Zenith, Crepuscule, Nuit, Aube", () => {
    const c = creerCase();
    const attendu: Array<[NomPhase, NomEtatSel]> = [
      ["Aube", "Solide"],
      ["Matin", "Solide"],
      ["Zenith", "Craquelee"],
      ["Crepuscule", "Boue"],
      ["Nuit", "CrouteFragile"],
      ["Aube", "Solide"],
    ];
    for (const [phase, etat] of attendu) {
      c.surPhase(phase);
      expect(c.getEtat(), `après ${phase}`).toBe(etat);
    }
  });

  it("la boue sèche le matin", () => {
    const c = creerCase("Boue");
    c.surPhase("Matin");
    expect(c.getEtat()).toBe("Craquelee");
  });

  it("le sel craquelé durcit à l'aube", () => {
    const c = creerCase("Craquelee");
    c.surPhase("Aube");
    expect(c.getEtat()).toBe("Solide");
  });

  it("ne change pas d'état quand la phase n'a pas d'effet", () => {
    const c = creerCase("Boue");
    c.surPhase("Zenith");
    expect(c.getEtat()).toBe("Boue");
  });
});

describe("Case : traverser", () => {
  it("Solide : sans effet", () => {
    const caravane = new FausseCaravane();
    creerCase("Solide").traverser(caravane);
    expect(caravane.enlisee).toBe(false);
    expect(caravane.paniquee).toBe(false);
  });

  it("Craquelee : sans effet", () => {
    const caravane = new FausseCaravane();
    creerCase("Craquelee").traverser(caravane);
    expect(caravane.enlisee).toBe(false);
    expect(caravane.paniquee).toBe(false);
  });

  it("Boue : enlise la caravane", () => {
    const caravane = new FausseCaravane();
    creerCase("Boue").traverser(caravane);
    expect(caravane.enlisee).toBe(true);
  });

  it("CrouteFragile : fait paniquer le chameau", () => {
    const caravane = new FausseCaravane();
    creerCase("CrouteFragile").traverser(caravane);
    expect(caravane.paniquee).toBe(true);
  });
});

describe("Case : balise", () => {
  it("n'a pas de balise au départ, puis en a une après poserBalise", () => {
    const c = creerCase();
    expect(c.aBalise()).toBe(false);
    c.poserBalise();
    expect(c.aBalise()).toBe(true);
  });
});
