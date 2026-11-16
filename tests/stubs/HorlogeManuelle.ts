// Stub fourni par Yassmine (module temps/) pour Malek et Nour.
// Remplace le vrai Soleil dans les tests : on choisit la phase à la main.
//
//   const horloge = new HorlogeManuelle();
//   horloge.abonner(maCase);
//   horloge.passerA("Zenith");   // maCase.surPhase("Zenith") est appelé
import type { HorlogeSoleil, NomPhase, ObservateurSoleil } from "../../src/contrats";

export class HorlogeManuelle implements HorlogeSoleil {
  private phase: NomPhase;
  private readonly observateurs: ObservateurSoleil[] = [];

  constructor(phaseInitiale: NomPhase = "Aube") {
    this.phase = phaseInitiale;
  }

  abonner(o: ObservateurSoleil): void {
    this.observateurs.push(o);
  }

  getPhase(): NomPhase {
    return this.phase;
  }

  /** Change la phase et prévient tous les abonnés, comme le ferait le Soleil. */
  passerA(phase: NomPhase): void {
    this.phase = phase;
    for (const o of [...this.observateurs]) {
      o.surPhase(phase);
    }
  }
}
