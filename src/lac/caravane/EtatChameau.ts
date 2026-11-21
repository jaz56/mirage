import type { NomEtatChameau, NomPhase } from "../../contrats";
import { Assoiffe } from "./Assoiffe";
import { Panique } from "./Panique";
import { Repose } from "./Repose";

/** Patron State : l'état du chameau change le coût de déplacement et ses réactions. */
export interface EtatChameau {
  readonly nom: NomEtatChameau;
  /** Coût ajouté au coût du terrain. */
  readonly surcout: number;
  /** Nom de l'état après une phase du Soleil, sachant le nombre de tours sans boire. */
  apresPhase(phase: NomPhase, toursSansBoire: number): NomEtatChameau;
  /** Nom de l'état après avoir bu. */
  apresBoire(): NomEtatChameau;
}

export function creerEtatChameau(nom: NomEtatChameau): EtatChameau {
  switch (nom) {
    case "Repose":
      return new Repose();
    case "Assoiffe":
      return new Assoiffe();
    case "Panique":
      return new Panique();
  }
}
