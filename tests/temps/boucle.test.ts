import { describe, expect, it } from "vitest";
import {
  ActionImpossible,
  Avancer,
  Boire,
  JouerMirage,
  PoserBalise,
  Sonder,
} from "../../src/temps";
import { creerMonde } from "./helpers/monde";

describe("Avancer", () => {
  it("déplace la caravane d'une case vers le sud", () => {
    const { etat, j1 } = creerMonde();
    new Avancer("J1", "S", etat).executer();
    expect(j1.getPosition()).toEqual({ x: 1, y: 1 });
  });

  it("coûte le coût du terrain d'arrivée", () => {
    const { etat } = creerMonde(["...", ".^.", "..."]);
    expect(new Avancer("J1", "S", etat).cout).toBe(2);
  });

  it("refuse un puits sec sans bouger", () => {
    const { etat, j1 } = creerMonde(["...", ".X.", "..."]);
    expect(() => new Avancer("J1", "S", etat).executer()).toThrow(ActionImpossible);
    expect(j1.getPosition()).toEqual({ x: 1, y: 0 });
  });

  it("refuse de sortir du lac", () => {
    const { etat } = creerMonde();
    expect(() => new Avancer("J1", "N", etat).executer()).toThrow(/sortir/);
  });

  it("refuse de bouger quand la caravane est enlisée", () => {
    const { etat, j1 } = creerMonde();
    j1.enlisee = true;
    expect(() => new Avancer("J1", "S", etat).executer()).toThrow(/enlisée/);
  });

  it("fait traverser la case d'arrivée : la boue enlise", () => {
    const { etat, j1, plateau } = creerMonde(["...", "...", "..."], { etats: { "1,1": "Boue" } });
    new Avancer("J1", "S", etat).executer();
    expect(plateau.caseDeTest({ x: 1, y: 1 }).passages).toBe(1);
    expect(j1.estEnlisee()).toBe(true);
  });

  it("sait avancer dans les 4 directions", () => {
    const { etat, j1 } = creerMonde(["...", "...", "..."], { j1: { x: 1, y: 1 } });
    new Avancer("J1", "N", etat).executer();
    expect(j1.getPosition()).toEqual({ x: 1, y: 0 });
    new Avancer("J1", "E", etat).executer();
    expect(j1.getPosition()).toEqual({ x: 2, y: 0 });
    new Avancer("J1", "S", etat).executer();
    expect(j1.getPosition()).toEqual({ x: 2, y: 1 });
    new Avancer("J1", "O", etat).executer();
    expect(j1.getPosition()).toEqual({ x: 1, y: 1 });
  });

  it("se décrit pour le journal", () => {
    const { etat } = creerMonde();
    const description = new Avancer("J1", "S", etat).description();
    expect(description).toContain("J1");
    expect(description).toContain("sud");
  });
});

describe("Sonder", () => {
  it("révèle le vrai terrain et l'état du sel d'une case voisine", () => {
    const { etat } = creerMonde(["...", ".^.", "..."], { etats: { "1,1": "Boue" } });
    const sonde = new Sonder("J1", "S", etat);
    sonde.executer();
    expect(sonde.rapport).toContain("dune");
    expect(sonde.rapport).toContain("Boue");
  });

  it("sonde la case où l'on se trouve avec « ici »", () => {
    const { etat } = creerMonde();
    const sonde = new Sonder("J1", "ici", etat);
    sonde.executer();
    expect(sonde.rapport).toContain("croute");
  });

  it("n'a pas de rapport avant d'être exécutée", () => {
    const { etat } = creerMonde();
    expect(new Sonder("J1", "ici", etat).rapport).toBeUndefined();
  });

  it("refuse de sonder hors du lac", () => {
    const { etat } = creerMonde();
    expect(() => new Sonder("J1", "N", etat).executer()).toThrow(ActionImpossible);
  });

  it("coûte 1 point d'action", () => {
    const { etat } = creerMonde();
    expect(new Sonder("J1", "ici", etat).cout).toBe(1);
  });
});

describe("PoserBalise", () => {
  it("pose une balise sur la case de la caravane", () => {
    const { etat, plateau } = creerMonde();
    new PoserBalise("J1", etat).executer();
    expect(plateau.get({ x: 1, y: 0 })?.aBalise()).toBe(true);
  });

  it("refuse une deuxième balise au même endroit", () => {
    const { etat } = creerMonde();
    new PoserBalise("J1", etat).executer();
    expect(() => new PoserBalise("J1", etat).executer()).toThrow(/déjà/);
  });

  it("coûte 1 point d'action", () => {
    const { etat } = creerMonde();
    expect(new PoserBalise("J1", etat).cout).toBe(1);
  });
});

describe("Boire", () => {
  it("consomme une outre", () => {
    const { etat, j1 } = creerMonde();
    const avant = j1.outres();
    new Boire("J1", etat).executer();
    expect(j1.outres()).toBe(avant - 1);
  });

  it("refuse quand il n'y a plus d'outre", () => {
    const { etat } = creerMonde(undefined, { outres: 0 });
    expect(() => new Boire("J1", etat).executer()).toThrow(/outre/);
  });

  it("coûte 1 point d'action", () => {
    const { etat } = creerMonde();
    expect(new Boire("J1", etat).cout).toBe(1);
  });
});

describe("JouerMirage", () => {
  it("envoie la carte à la perception de l'adversaire seulement", () => {
    const { etat, p1, p2 } = creerMonde();
    new JouerMirage("J1", "FausseOasis", { x: 2, y: 2 }, etat).executer();
    expect(p2.cartesRecues).toEqual([{ carte: "FausseOasis", cible: { x: 2, y: 2 } }]);
    expect(p1.cartesRecues).toEqual([]);
  });

  it("consomme une carte", () => {
    const { etat, j1 } = creerMonde();
    const avant = j1.cartes();
    new JouerMirage("J1", "DuneFantome", { x: 0, y: 1 }, etat).executer();
    expect(j1.cartes()).toBe(avant - 1);
  });

  it("refuse quand il n'y a plus de carte, sans rien envoyer", () => {
    const { etat, p2 } = creerMonde(undefined, { cartes: 0 });
    expect(() => new JouerMirage("J1", "SelTrompeur", { x: 0, y: 1 }, etat).executer()).toThrow(
      /carte/,
    );
    expect(p2.cartesRecues).toEqual([]);
  });

  it("refuse une cible hors du lac sans consommer de carte", () => {
    const { etat, j1, p2 } = creerMonde();
    const avant = j1.cartes();
    expect(() => new JouerMirage("J1", "FausseOasis", { x: 9, y: 9 }, etat).executer()).toThrow(
      /hors du lac/,
    );
    expect(j1.cartes()).toBe(avant);
    expect(p2.cartesRecues).toEqual([]);
  });

  it("coûte 2 points d'action", () => {
    const { etat } = creerMonde();
    expect(new JouerMirage("J1", "FausseOasis", { x: 0, y: 0 }, etat).cout).toBe(2);
  });
});
