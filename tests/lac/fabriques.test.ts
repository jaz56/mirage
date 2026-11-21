import { describe, expect, it } from "vitest";
import type { NomTerrain } from "../../src/contrats";
import {
  CARTES_DEPART,
  HAUTEUR,
  LARGEUR,
  OUTRES_DEPART,
} from "../../src/config/constantes";
import { FabriqueCaravane, FabriquePlateau, FabriquePlateauAleatoire } from "../../src/lac";
import { aleaAvecGraine } from "./helpers/alea";

function dessiner(plateau: ReturnType<FabriquePlateauAleatoire["creer"]>): string {
  const lignes: string[] = [];
  for (let y = 0; y < plateau.hauteur; y++) {
    let ligne = "";
    for (let x = 0; x < plateau.largeur; x++) {
      ligne += plateau.get({ x, y })?.terrain.symbole ?? "?";
    }
    lignes.push(ligne);
  }
  return lignes.join("\n");
}

describe("FabriquePlateauAleatoire", () => {
  it("crée un plateau de la taille des constantes", () => {
    const plateau = new FabriquePlateauAleatoire(aleaAvecGraine(1)).creer();
    expect(plateau.largeur).toBe(LARGEUR);
    expect(plateau.hauteur).toBe(HAUTEUR);
    expect(plateau.toutes()).toHaveLength(LARGEUR * HAUTEUR);
  });

  it("garantit un chemin praticable, quelle que soit la graine (500 essais)", () => {
    for (let graine = 0; graine < 500; graine++) {
      const plateau = new FabriquePlateauAleatoire(aleaAvecGraine(graine)).creer();
      expect(plateau.existeCheminPraticable(), `graine ${graine}`).toBe(true);
    }
  });

  it("relie toujours les deux cases de départ par un chemin praticable (500 essais)", () => {
    const milieu = Math.floor(LARGEUR / 2);
    const departJ1 = { x: milieu, y: 0 };
    const departJ2 = { x: milieu, y: HAUTEUR - 1 };
    for (let graine = 0; graine < 500; graine++) {
      const plateau = new FabriquePlateauAleatoire(aleaAvecGraine(graine)).creer();
      expect(plateau.get(departJ1)?.terrain.nom, `graine ${graine}`).toBe("croute");
      expect(plateau.get(departJ2)?.terrain.nom, `graine ${graine}`).toBe("croute");
      expect(plateau.existeCheminEntre(departJ1, departJ2), `graine ${graine}`).toBe(true);
    }
  });

  it("garantit un chemin même si le hasard ne tire que des puits secs", () => {
    const toujoursZero = () => 0.999999;
    const plateau = new FabriquePlateauAleatoire(toujoursZero).creer();
    expect(plateau.existeCheminPraticable()).toBe(true);
  });

  it("est reproductible : même graine, même lac", () => {
    const a = dessiner(new FabriquePlateauAleatoire(aleaAvecGraine(42)).creer());
    const b = dessiner(new FabriquePlateauAleatoire(aleaAvecGraine(42)).creer());
    expect(a).toBe(b);
  });

  it("varie selon la graine", () => {
    const a = dessiner(new FabriquePlateauAleatoire(aleaAvecGraine(1)).creer());
    const b = dessiner(new FabriquePlateauAleatoire(aleaAvecGraine(2)).creer());
    expect(a).not.toBe(b);
  });

  it("démarre toutes les cases en Solide", () => {
    const plateau = new FabriquePlateauAleatoire(aleaAvecGraine(7)).creer();
    expect(plateau.toutes().every((c) => c.getEtat() === "Solide")).toBe(true);
  });

  it("donne à chaque case sa propre position", () => {
    const plateau = new FabriquePlateauAleatoire(aleaAvecGraine(7)).creer();
    for (const c of plateau.toutes()) {
      expect(plateau.get(c.position)).toBe(c);
    }
  });
});

describe("FabriquePlateau : Factory Method", () => {
  class FabriqueBloquee extends FabriquePlateau {
    protected genererTerrains(): NomTerrain[][] {
      return [
        ["croute", "croute"],
        ["puits-sec", "puits-sec"],
        ["croute", "croute"],
      ];
    }
  }

  it("refuse de créer un plateau sans chemin praticable", () => {
    expect(() => new FabriqueBloquee().creer()).toThrow(/chemin praticable/);
  });
});

describe("FabriqueCaravane", () => {
  const fabrique = new FabriqueCaravane();

  it("crée une caravane pour chaque joueur avec les valeurs de départ", () => {
    const j1 = fabrique.creer("J1");
    const j2 = fabrique.creer("J2");
    expect(j1.joueur).toBe("J1");
    expect(j2.joueur).toBe("J2");
    expect(j1.outres()).toBe(OUTRES_DEPART);
    expect(j2.cartes()).toBe(CARTES_DEPART);
  });

  it("place J1 en haut et J2 en bas, au milieu", () => {
    expect(fabrique.creer("J1").getPosition()).toEqual({ x: Math.floor(LARGEUR / 2), y: 0 });
    expect(fabrique.creer("J2").getPosition()).toEqual({
      x: Math.floor(LARGEUR / 2),
      y: HAUTEUR - 1,
    });
  });

  it("crée des caravanes indépendantes", () => {
    const a = fabrique.creer("J1");
    const b = fabrique.creer("J1");
    a.boire();
    expect(b.outres()).toBe(OUTRES_DEPART);
  });
});
