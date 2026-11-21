import type { HorlogeSoleil, NomPhase, ObservateurSoleil } from "../contrats";
import { creerEtatPhase, type EtatPhase } from "./phases/EtatPhase";

/**
 * Le Soleil : Singleton et sujet du patron Observer.
 * Les cases, les caravanes et les perceptions s'abonnent et sont prévenues à chaque nouvelle phase.
 */
export class Soleil implements HorlogeSoleil {
  private static instance: Soleil | undefined;

  private observateurs: ObservateurSoleil[] = [];
  private etat: EtatPhase = creerEtatPhase("Aube");

  private constructor() {}

  static getInstance(): Soleil {
    if (Soleil.instance === undefined) {
      Soleil.instance = new Soleil();
    }
    return Soleil.instance;
  }

  abonner(o: ObservateurSoleil): void {
    this.observateurs.push(o);
  }

  getPhase(): NomPhase {
    return this.etat.nom;
  }

  getDescription(): string {
    return this.etat.description;
  }

  /** Passe à la phase suivante et prévient les abonnés, dans l'ordre où ils se sont abonnés. */
  avancer(): NomPhase {
    this.etat = creerEtatPhase(this.etat.suivante());
    for (const observateur of [...this.observateurs]) {
      observateur.surPhase(this.etat.nom);
    }
    return this.etat.nom;
  }

  /** Nouvelle partie : retour à l'Aube, plus aucun abonné. */
  reinitialiser(): void {
    this.observateurs = [];
    this.etat = creerEtatPhase("Aube");
  }
}
