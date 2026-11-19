import { describe, expect, it } from "vitest";
import { FabriqueTerrains, NOMS_TERRAINS, estPraticable } from "../../src/lac";

describe("FabriqueTerrains (Flyweight)", () => {
  it("renvoie le même objet pour un même terrain", () => {
    const fabrique = new FabriqueTerrains();
    expect(fabrique.get("dune")).toBe(fabrique.get("dune"));
  });

  it("ne crée qu'un objet par type, même après de nombreuses demandes", () => {
    const fabrique = new FabriqueTerrains();
    for (let i = 0; i < 100; i++) {
      fabrique.get("croute");
      fabrique.get("dune");
    }
    expect(fabrique.nombreCrees()).toBe(2);
  });

  it("connaît les 4 terrains avec des symboles distincts", () => {
    const fabrique = new FabriqueTerrains();
    const symboles = NOMS_TERRAINS.map((nom) => fabrique.get(nom).symbole);
    expect(new Set(symboles).size).toBe(4);
  });

  it("coûte plus cher de traverser une dune que de la croûte", () => {
    const fabrique = new FabriqueTerrains();
    expect(fabrique.get("dune").cout).toBeGreaterThan(fabrique.get("croute").cout);
  });

  it("seul le puits sec est impraticable", () => {
    const fabrique = new FabriqueTerrains();
    expect(estPraticable(fabrique.get("puits-sec"))).toBe(false);
    expect(estPraticable(fabrique.get("oasis"))).toBe(true);
    expect(estPraticable(fabrique.get("dune"))).toBe(true);
    expect(estPraticable(fabrique.get("croute"))).toBe(true);
  });
});
