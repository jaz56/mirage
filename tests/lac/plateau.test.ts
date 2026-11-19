import { describe, expect, it } from "vitest";
import { PlateauFixe } from "../stubs/PlateauFixe";

describe("Plateau", () => {
  const plateau = PlateauFixe.depuis([
    "..^",
    "XO.",
    "^..",
  ]);

  it("connaît ses dimensions", () => {
    expect(plateau.largeur).toBe(3);
    expect(plateau.hauteur).toBe(3);
  });

  it("get renvoie la bonne case, avec sa position", () => {
    const c = plateau.get({ x: 1, y: 1 });
    expect(c?.terrain.nom).toBe("oasis");
    expect(c?.position).toEqual({ x: 1, y: 1 });
  });

  it("get renvoie undefined hors du plateau", () => {
    expect(plateau.get({ x: -1, y: 0 })).toBeUndefined();
    expect(plateau.get({ x: 0, y: -1 })).toBeUndefined();
    expect(plateau.get({ x: 3, y: 0 })).toBeUndefined();
    expect(plateau.get({ x: 0, y: 3 })).toBeUndefined();
  });

  it("voisins : 2 dans un coin, 3 sur un bord, 4 au centre", () => {
    expect(plateau.voisins({ x: 0, y: 0 })).toHaveLength(2);
    expect(plateau.voisins({ x: 1, y: 0 })).toHaveLength(3);
    expect(plateau.voisins({ x: 1, y: 1 })).toHaveLength(4);
  });

  it("toutes renvoie les 9 cases", () => {
    expect(plateau.toutes()).toHaveLength(9);
  });

  it("partage les mêmes objets terrain entre cases identiques", () => {
    const a = plateau.get({ x: 0, y: 0 })?.terrain;
    const b = plateau.get({ x: 1, y: 0 })?.terrain;
    expect(a).toBe(b);
  });

  it("refuse un code de terrain inconnu", () => {
    expect(() => PlateauFixe.depuis(["?"])).toThrow();
  });
});

describe("Plateau : chemin praticable", () => {
  it("trouve un chemin quand il existe", () => {
    expect(PlateauFixe.depuis(["X.X", "X.X", "X.X"]).existeCheminPraticable()).toBe(true);
  });

  it("trouve un chemin qui contourne un obstacle", () => {
    expect(PlateauFixe.depuis([".X.", ".X.", "..."]).existeCheminPraticable()).toBe(true);
  });

  it("refuse un lac bloqué par une ligne de puits secs", () => {
    expect(PlateauFixe.depuis(["...", "XXX", "..."]).existeCheminPraticable()).toBe(false);
  });

  it("refuse un lac dont la première ligne est entièrement bloquée", () => {
    expect(PlateauFixe.depuis(["XXX", "...", "..."]).existeCheminPraticable()).toBe(false);
  });

  it("n'accepte pas les passages en diagonale", () => {
    expect(PlateauFixe.depuis([".X", "X."]).existeCheminPraticable()).toBe(false);
  });
});
