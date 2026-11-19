import type { NomEtatChameau, NomPhase } from "../../contrats";
import type { EtatChameau } from "./EtatChameau";

/** Chameau assoiffé : chaque déplacement coûte plus cher. Seul boire le soulage. */

export class Assoiffe implements EtatChameau{
    readonly nom="Assoiffe" as const;
    readonly surcout=1;

    apresPhase(_phase: NomPhase, _toursSansBoire: number):NomEtatChameau{
        return "Assoiffe";
    }

    apresBoire(): NomEtatChameau {
    return "Repose";
    }

}