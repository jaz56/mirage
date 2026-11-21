import type {
  CaravaneJeu,
  EtatPartie,
  IdJoueur,
  NomPhase,
  Perception,
  Plateau,
} from "../../../src/contrats";

/** Faux état de partie en lecture seule, pour tester les actions sans la vraie Partie. */
export class EtatPartieFixe implements EtatPartie {
  constructor(
    readonly plateau: Plateau,
    private readonly caravanes: Record<IdJoueur, CaravaneJeu>,
    private readonly perceptions: Record<IdJoueur, Perception>,
    private readonly phaseCourante: NomPhase = "Aube",
    private readonly tourCourant = 1,
  ) {}

  caravane(j: IdJoueur): CaravaneJeu {
    return this.caravanes[j];
  }
  perception(j: IdJoueur): Perception {
    return this.perceptions[j];
  }
  phase(): NomPhase {
    return this.phaseCourante;
  }
  tour(): number {
    return this.tourCourant;
  }
}
