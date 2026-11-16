import { describe, expect, it } from "vitest";
import {
  HAUTEUR,
  LIGNE_ARRIVEE,
  ORDRE_PHASES,
  PA_PAR_TOUR,
  TOURS_PAR_PHASE,
} from "../../src/config/constantes";

describe("constantes partagées", () => {
  it("l'arrivée est la dernière ligne du lac", () => {
    expect(LIGNE_ARRIVEE).toBe(HAUTEUR - 1);
  });

  it("la journée compte 5 phases, dans l'ordre", () => {
    expect(ORDRE_PHASES).toEqual(["Aube", "Matin", "Zenith", "Crepuscule", "Nuit"]);
  });

  it("les valeurs de rythme sont positives", () => {
    expect(PA_PAR_TOUR).toBeGreaterThan(0);
    expect(TOURS_PAR_PHASE).toBeGreaterThan(0);
  });
});
