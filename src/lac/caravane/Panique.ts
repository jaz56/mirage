import type { NomEtatChameau, NomPhase } from "../../contrats";
import { SEUIL_SOIF } from "../../config/constantes";
import type { EtatChameau } from "./EtatChameau";

/** Chameau paniqué : déplacement très coûteux. Il se calme à l'aube (retour à Reposé ou Assoiffé). */
export class Panique implements EtatChameau{
    readonly nom="Panique" as const;
    readonly surcout=2;


    apresPhase(phase:NomPhase , toursSansBoire :number):NomEtatChameau{
        if(phase !=="Aube"){
            return "Panique";
        }
        return toursSansBoire >= SEUIL_SOIF ? "Assoiffe":"Repose";
    }

    apresBoire(): NomEtatChameau {
    // Boire ne calme pas la panique, seule l'aube le fait.
    return "Panique";
     }

}