import { beforeEach, describe, expect, it } from "vitest";
import { ORDRE_PHASES, TOURS_PAR_PHASE } from "../../src/config/constantes";
import type { NomPhase, ObservateurSoleil } from "../../src/contrats";
import { Soleil } from "../../src/temps";

class Espion implements ObservateurSoleil {
  recues: NomPhase[] = [];
  surPhase(phase: NomPhase): void {
    this.recues.push(phase);
  }
}

const avancer = (soleil: Soleil, tours: number) => {
  for (let i = 0; i < tours; i++) soleil.tourSuivant();
};

beforeEach(() => {
  Soleil.reinitialiser();
});

describe("Soleil — Singleton", () => {
  it("renvoie toujours la même instance", () => {
    expect(Soleil.getInstance()).toBe(Soleil.getInstance());
  });

  it("garde son état entre deux appels à getInstance()", () => {
    avancer(Soleil.getInstance(), TOURS_PAR_PHASE);
    expect(Soleil.getInstance().getPhase()).toBe("Matin");
  });

  it("repart de zéro après reinitialiser()", () => {
    const avant = Soleil.getInstance();
    avancer(avant, TOURS_PAR_PHASE);
    Soleil.reinitialiser();
    const apres = Soleil.getInstance();
    expect(apres).not.toBe(avant);
    expect(apres.getPhase()).toBe("Aube");
    expect(apres.tourCourant()).toBe(0);
  });
});

describe("Soleil — State", () => {
  it("commence à l'Aube", () => {
    expect(Soleil.getInstance().getPhase()).toBe("Aube");
  });

  it("reste dans la même phase tant que sa durée n'est pas écoulée", () => {
    const soleil = Soleil.getInstance();
    avancer(soleil, TOURS_PAR_PHASE - 1);
    expect(soleil.getPhase()).toBe("Aube");
  });

  it("parcourt les 5 phases dans l'ordre puis revient à l'Aube", () => {
    const soleil = Soleil.getInstance();
    const vues: NomPhase[] = [soleil.getPhase()];
    for (let i = 0; i < ORDRE_PHASES.length; i++) {
      avancer(soleil, TOURS_PAR_PHASE);
      vues.push(soleil.getPhase());
    }
    expect(vues).toEqual([...ORDRE_PHASES, "Aube"]);
  });

  it("compte les tours au total et dans la phase", () => {
    const soleil = Soleil.getInstance();
    avancer(soleil, TOURS_PAR_PHASE + 1);
    expect(soleil.tourCourant()).toBe(TOURS_PAR_PHASE + 1);
    expect(soleil.toursDansPhase()).toBe(1);
  });

  it("donne une description propre à chaque phase", () => {
    const soleil = Soleil.getInstance();
    const descriptions = new Set<string>();
    for (let i = 0; i < ORDRE_PHASES.length; i++) {
      descriptions.add(soleil.description());
      avancer(soleil, TOURS_PAR_PHASE);
    }
    expect(descriptions.size).toBe(ORDRE_PHASES.length);
  });
});

describe("Soleil — Observer", () => {
  it("prévient les abonnés à chaque changement de phase, pas à chaque tour", () => {
    const soleil = Soleil.getInstance();
    const espion = new Espion();
    soleil.abonner(espion);
    avancer(soleil, TOURS_PAR_PHASE * 2);
    expect(espion.recues).toEqual(["Matin", "Zenith"]);
  });

  it("prévient tous les abonnés", () => {
    const soleil = Soleil.getInstance();
    const a = new Espion();
    const b = new Espion();
    soleil.abonner(a);
    soleil.abonner(b);
    avancer(soleil, TOURS_PAR_PHASE);
    expect(a.recues).toEqual(["Matin"]);
    expect(b.recues).toEqual(["Matin"]);
  });

  it("n'inscrit pas deux fois le même abonné", () => {
    const soleil = Soleil.getInstance();
    const espion = new Espion();
    soleil.abonner(espion);
    soleil.abonner(espion);
    avancer(soleil, TOURS_PAR_PHASE);
    expect(espion.recues).toEqual(["Matin"]);
    expect(soleil.nombreAbonnes()).toBe(1);
  });

  it("ne prévient plus un abonné désinscrit", () => {
    const soleil = Soleil.getInstance();
    const espion = new Espion();
    soleil.abonner(espion);
    soleil.desabonner(espion);
    avancer(soleil, TOURS_PAR_PHASE);
    expect(espion.recues).toEqual([]);
  });

  it("supporte un abonné qui se désinscrit pendant la notification", () => {
    const soleil = Soleil.getInstance();
    const fin = new Espion();
    const unique: ObservateurSoleil = {
      surPhase: () => soleil.desabonner(unique),
    };
    soleil.abonner(unique);
    soleil.abonner(fin);
    avancer(soleil, TOURS_PAR_PHASE * 2);
    expect(fin.recues).toEqual(["Matin", "Zenith"]);
    expect(soleil.nombreAbonnes()).toBe(1);
  });
});
