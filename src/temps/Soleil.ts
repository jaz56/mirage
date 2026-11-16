// Soleil — trois patrons dans une classe :
//  - Singleton : une seule horloge pour tout le lac (constructeur privé, getInstance()).
//  - State     : le comportement à chaque tour est délégué à la phase courante.
//  - Observer  : sujet ; cases, caravanes et perceptions sont prévenues à chaque changement de phase.
import type { HorlogeSoleil, NomPhase, ObservateurSoleil } from "../contrats";
import { Aube } from "./phases/Aube";
import type { PhaseSoleil } from "./phases/PhaseSoleil";

export class Soleil implements HorlogeSoleil {
  private static instance: Soleil | null = null;

  private phase: PhaseSoleil = new Aube();
  private tours = 0;
  private toursPhase = 0;
  private readonly observateurs = new Set<ObservateurSoleil>();

  private constructor() {}

  static getInstance(): Soleil {
    if (Soleil.instance === null) {
      Soleil.instance = new Soleil();
    }
    return Soleil.instance;
  }

  /** Repart de zéro (nouvelle partie, ou isolation entre deux tests). */
  static reinitialiser(): void {
    Soleil.instance = null;
  }

  // --- Observer : gestion des abonnés ---

  abonner(o: ObservateurSoleil): void {
    this.observateurs.add(o);
  }

  desabonner(o: ObservateurSoleil): void {
    this.observateurs.delete(o);
  }

  nombreAbonnes(): number {
    return this.observateurs.size;
  }

  // --- Lecture ---

  getPhase(): NomPhase {
    return this.phase.nom;
  }

  description(): string {
    return this.phase.description();
  }

  /** Nombre total de tours écoulés depuis le début de la partie. */
  tourCourant(): number {
    return this.tours;
  }

  /** Nombre de tours écoulés dans la phase courante (utilisé par les phases). */
  toursDansPhase(): number {
    return this.toursPhase;
  }

  // --- State : le Soleil délègue à sa phase ---

  /** À appeler une fois par tour complet (les deux joueurs ont joué). */
  tourSuivant(): void {
    this.tours++;
    this.toursPhase++;
    this.phase.tourEcoule(this);
  }

  /** Appelé par une phase quand elle se termine. Notifie tous les abonnés. */
  changerPhase(nouvelle: PhaseSoleil): void {
    this.phase = nouvelle;
    this.toursPhase = 0;
    // Copie : un abonné peut s'abonner ou se désabonner pendant la notification.
    for (const o of [...this.observateurs]) {
      o.surPhase(nouvelle.nom);
    }
  }
}
