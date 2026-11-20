import { describe, it, expect } from "vitest";
import { Perception } from "../../src/perception";
import type { CaravaneJeu, CaseLac, Plateau, Position } from "../../src/contrats";
import { DUREE_CARTE } from "../../src/config/constantes";

function fauxPlateau(): Plateau {
  const caseFragile = (position: Position): CaseLac =>
    ({
      position,
      terrain: { nom: "croute", cout: 1, symbole: "." },
      getEtat: () => "CrouteFragile",
      aBalise: () => false,
    }) as unknown as CaseLac;
  return { largeur: 9, hauteur: 13, get: caseFragile } as unknown as Plateau;
}

function fausseCaravane(p: Position): CaravaneJeu {
  return { getPosition: () => p } as unknown as CaravaneJeu;
}

describe("Perception", () => {
  const cible = { x: 4, y: 4 };

  it("montre le sel réel sans déformation (Matin)", () => {
    const perc = new Perception(fauxPlateau(), fausseCaravane({ x: 0, y: 0 }));
    perc.surPhase("Matin");
    expect(perc.vueActuelle().voir(cible).etat).toBe("CrouteFragile");
  });

  it("la brume cache le terrain lointain (Aube)", () => {
    const perc = new Perception(fauxPlateau(), fausseCaravane({ x: 0, y: 0 }));
    perc.surPhase("Aube");
    expect(perc.vueActuelle().voir(cible).terrain).toBe("?");
  });

  it("la chaleur cache l'état des cases lointaines (Zenith)", () => {
    const perc = new Perception(fauxPlateau(), fausseCaravane({ x: 0, y: 0 }));
    perc.surPhase("Zenith");
    expect(perc.vueActuelle().voir(cible).etat).toBe("?");
  });

  it("SelTrompeur affiche Solide, puis la carte expire", () => {
    const perc = new Perception(fauxPlateau(), fausseCaravane({ x: 0, y: 0 }));
    perc.surPhase("Matin");
    perc.appliquerCarte("SelTrompeur", cible);
    expect(perc.vueActuelle().voir(cible).etat).toBe("Solide");

    for (let i = 0; i < DUREE_CARTE; i++) perc.finDeTour();
    expect(perc.vueActuelle().voir(cible).etat).toBe("CrouteFragile");
  });

  it("applique la chaleur puis le mirage (ordre)", () => {
    const perc = new Perception(fauxPlateau(), fausseCaravane({ x: 0, y: 0 }));
    perc.surPhase("Zenith");
    perc.appliquerCarte("FausseOasis", cible);
    const v = perc.vueActuelle().voir(cible);
    expect(v.terrain).toBe("oasis");
    expect(v.etat).toBe("?");
  });
});
