import { describe, expect, it } from "vitest";
import { FabriqueCaravane } from "../../src/lac";
import { HorlogeManuelle } from "./helpers/HorlogeManuelle";
import { PlateauFixe } from "../stubs/PlateauFixe";

/** Le module lac/ au complet, avec un faux Soleil à la place du vrai module temps/. */
describe("lac/ avec un Soleil factice", () => {
  it("le Soleil fait évoluer toutes les cases et la caravane", () => {
    const horloge = new HorlogeManuelle();
    const plateau = PlateauFixe.depuis(["...", "...", "..."]);
    const caravane = new FabriqueCaravane().creer("J1");

    plateau.toutes().forEach((c) => horloge.abonner(c));
    horloge.abonner(caravane);

    horloge.avancerA("Zenith");
    expect(plateau.toutes().every((c) => c.getEtat() === "Craquelee")).toBe(true);

    horloge.avancerA("Crepuscule");
    expect(plateau.toutes().every((c) => c.getEtat() === "Boue")).toBe(true);
    expect(caravane.getEtatChameau()).toBe("Assoiffe"); // 2 phases sans boire
  });

  it("une caravane qui traverse de la boue s'enlise, puis se dégage à la phase suivante", () => {
    const horloge = new HorlogeManuelle();
    const plateau = PlateauFixe.depuis(["...", "...", "..."]);
    const caravane = new FabriqueCaravane().creer("J1");
    plateau.toutes().forEach((c) => horloge.abonner(c));
    horloge.abonner(caravane);

    horloge.avancerA("Zenith");
    horloge.avancerA("Crepuscule"); // le sel devient Boue
    const cible = plateau.get({ x: 1, y: 1 });
    cible?.traverser(caravane);
    expect(caravane.estEnlisee()).toBe(true);

    horloge.avancerA("Nuit");
    expect(caravane.estEnlisee()).toBe(false);
  });

  it("une caravane qui traverse la croûte fragile de nuit panique, puis se calme à l'aube", () => {
    const horloge = new HorlogeManuelle();
    const plateau = PlateauFixe.depuis(["...", "...", "..."]);
    const caravane = new FabriqueCaravane().creer("J1");
    plateau.toutes().forEach((c) => horloge.abonner(c));
    horloge.abonner(caravane);

    horloge.avancerA("Nuit");
    plateau.get({ x: 0, y: 0 })?.traverser(caravane);
    expect(caravane.getEtatChameau()).toBe("Panique");

    caravane.boire();
    horloge.avancerA("Aube");
    expect(caravane.getEtatChameau()).not.toBe("Panique");
    expect(plateau.get({ x: 0, y: 0 })?.getEtat()).toBe("Solide");
  });

  it("le coût de déplacement tient compte du terrain et de l'état du chameau", () => {
    const plateau = PlateauFixe.depuis(["^"]);
    const dune = plateau.get({ x: 0, y: 0 })!.terrain;
    const caravane = new FabriqueCaravane().creer("J1");
    expect(caravane.coutDeplacement(dune)).toBe(2);
    caravane.paniquer();
    expect(caravane.coutDeplacement(dune)).toBe(4);
  });
});
