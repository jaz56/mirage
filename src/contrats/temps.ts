// CONTRAT PARTAGÉ — modifier seulement par une branche contrat/ validée par les 3.
import type { IdJoueur, NomPhase } from "./types";

/** Tout objet qui doit réagir au changement de phase du Soleil (Observer). */
export interface ObservateurSoleil {
  surPhase(phase: NomPhase): void;
}

/** Ce que les autres modules savent du Soleil. */
export interface HorlogeSoleil {
  abonner(o: ObservateurSoleil): void;
  getPhase(): NomPhase;
}

/** Une action de joueur (Command). */
export interface Action {
  readonly cout: number;
  readonly joueur: IdJoueur;
  executer(): void;
  /** Texte lisible, pour le journal et le replay final. */
  description(): string;
}
