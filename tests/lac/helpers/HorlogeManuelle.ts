import type { HorlogeSoleil, NomPhase, ObservateurSoleil } from "../../../src/contrats";

/** Faux Soleil : on avance le temps à la main et tous les abonnés sont prévenus. */
export class HorlogeManuelle implements HorlogeSoleil {
  private readonly observateurs: ObservateurSoleil[] = [];

  constructor(private phase: NomPhase = "Aube") {}

  abonner(o: ObservateurSoleil): void {
    this.observateurs.push(o);
  }

  getPhase(): NomPhase {
    return this.phase;
  }

  avancerA(phase: NomPhase): void {
    this.phase = phase;
    for (const o of this.observateurs) {
      o.surPhase(phase);
    }
  }
}
