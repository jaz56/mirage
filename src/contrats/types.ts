// CONTRAT PARTAGÉ — modifier seulement par une branche contrat/ validée par les 3.

export interface Position {
  readonly x: number;
  readonly y: number;
}

export type IdJoueur = "J1" | "J2";
export type NomTerrain = "croute" | "dune" | "oasis" | "puits-sec";
export type NomEtatSel = "Solide" | "Craquelee" | "Boue" | "CrouteFragile";
export type NomEtatChameau = "Repose" | "Assoiffe" | "Panique";
export type NomPhase = "Aube" | "Matin" | "Zenith" | "Crepuscule" | "Nuit";
export type NomCarte = "FausseOasis" | "DuneFantome" | "SelTrompeur";

/** Ce qu'un joueur croit voir sur une case. "?" = inconnu. */
export interface CaseVue {
  readonly terrain: NomTerrain | "?";
  readonly etat: NomEtatSel | "?";
  readonly balise: boolean;
}
