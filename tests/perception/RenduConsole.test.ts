import { describe, it, expect } from "vitest";
import { RenduConsole } from "../../src/perception";
import type { Vue } from "../../src/contrats";
import { HAUTEUR } from "../../src/config/constantes";

describe("RenduConsole", () => {
  it("affiche une ligne par rangée et '?' pour l'inconnu", () => {
    const vueInconnue: Vue = { voir: () => ({ terrain: "?", etat: "?", balise: false }) };
    const sortie = new RenduConsole().afficher(vueInconnue);
    expect(sortie.split("\n")).toHaveLength(HAUTEUR);
    expect(sortie.startsWith("? ?")).toBe(true);
  });

  it("marque la caravane avec C", () => {
    const vue: Vue = { voir: () => ({ terrain: "croute", etat: "Solide", balise: false }) };
    const sortie = new RenduConsole(() => ({ x: 0, y: 0 })).afficher(vue);
    expect(sortie.startsWith("C .")).toBe(true);
  });
});
