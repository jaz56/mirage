// CONTRAT PARTAGÉ — modifier seulement par une branche contrat/ validée par les 3.
import type { ObservateurSoleil } from "./temps";
import type { IdJoueur, NomEtatChameau, NomEtatSel, NomTerrain, Position } from "./types";

/** Données partagées d'un type de terrain (Flyweight, état intrinsèque). */
export interface TypeTerrain {
  readonly nom: NomTerrain;
  readonly cout: number;
  readonly symbole: string;
}

export interface CaseLac extends ObservateurSoleil {
  readonly position: Position;
  readonly terrain: TypeTerrain;
  getEtat(): NomEtatSel;
  aBalise(): boolean;
  poserBalise(): void;
  traverser(c: CaravaneJeu): void;
}

export interface Plateau {
  readonly largeur: number;
  readonly hauteur: number;
  get(p: Position): CaseLac | undefined;
  voisins(p: Position): CaseLac[];
  toutes(): CaseLac[];
}

export interface CaravaneJeu extends ObservateurSoleil {
  readonly joueur: IdJoueur;
  getPosition(): Position;
  deplacer(p: Position): void;
  getEtatChameau(): NomEtatChameau;
  coutDeplacement(t: TypeTerrain): number;
  estEnlisee(): boolean;
  enliser(): void;
  paniquer(): void;
  /** false s'il n'y a plus d'outre. */
  boire(): boolean;
  outres(): number;
  cartes(): number;
  /** false s'il n'y a plus de carte Mirage. */
  utiliserCarte(): boolean;
}
