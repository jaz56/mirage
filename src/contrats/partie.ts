// CONTRAT PARTAGÉ — modifier seulement par une branche contrat/ validée par les 3.
import type { CaravaneJeu, Plateau } from "./lac";
import type { Perception } from "./perception";
import type { IdJoueur, NomPhase } from "./types";

/** Ce que tout le monde peut lire de la partie, sans la modifier. */
export interface EtatPartie {
  readonly plateau: Plateau;
  caravane(j: IdJoueur): CaravaneJeu;
  perception(j: IdJoueur): Perception;
  phase(): NomPhase;
  tour(): number;
}
