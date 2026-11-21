// CONTRAT PARTAGÉ — modifier seulement par une branche contrat/ validée par les 3.
import type { Action } from "./temps";
import type { IdJoueur, NomCarte, Position } from "./types";

export type DirectionAction = "N" | "S" | "E" | "O";

/** Fabrique d'actions fournie par temps/ (via main/assemblage) à ceux qui doivent en créer. */
export interface FabriqueActions {
  avancer(joueur: IdJoueur, direction: DirectionAction): Action;
  boire(joueur: IdJoueur): Action;
  jouerMirage(joueur: IdJoueur, carte: NomCarte, cible: Position): Action;
}
