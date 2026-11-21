import type { NomEtatChameau, NomPhase } from "../../contrats";
import { SEUIL_SOIF } from "../../config/constantes";
import type { EtatChameau } from "./EtatChameau";

/** Chameau reposé : déplacement au coût normal. Il a soif s'il reste trop longtemps sans boire. */

export class Repose implements EtatChameau {
  readonly nom = "Repose" as const;
  readonly surcout = 0;

  apresPhase(_phase: NomPhase, toursSansBoire: number): NomEtatChameau {
    return toursSansBoire >= SEUIL_SOIF ? "Assoiffe" : "Repose";
  }

  apresBoire(): NomEtatChameau {
    return "Repose";
  }
}
