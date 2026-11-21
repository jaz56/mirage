import type { HorlogeSoleil, NomPhase, ObservateurSoleil } from "../../src/contrats";

/** Stub du module temps/ (Yassmine) : un faux Soleil qu'on avance à la main. */
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
