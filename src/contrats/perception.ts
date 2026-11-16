// CONTRAT PARTAGÉ — modifier seulement par une branche contrat/ validée par les 3.
import type { EtatPartie } from "./partie";
import type { Action, ObservateurSoleil } from "./temps";
import type { CaseVue, NomCarte, Position } from "./types";

/** Composant du Décorateur : ce qu'on voit d'une case. */
export interface Vue {
  voir(p: Position): CaseVue;
}

/** La vue d'un joueur, reconstruite à chaque phase. */
export interface Perception extends ObservateurSoleil {
  vueActuelle(): Vue;
  appliquerCarte(carte: NomCarte, cible: Position): void;
  /** Décompte la durée des cartes actives. */
  finDeTour(): void;
}

/** Adversaire ordinateur (Strategy). */
export interface StrategieIA {
  choisirActions(etat: EtatPartie, pa: number): Action[];
}
