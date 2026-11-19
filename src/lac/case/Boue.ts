import type { CaravaneJeu, NomEtatSel, NomPhase } from "../../contrats";
import type { EtatSel } from "./EtatSel";

/** Boue : la caravane qui la traverse s'enlise. Elle sèche le matin, la nuit elle gèle en croûte fragile. */
export class Boue implements EtatSel{
    readonly nom="Boue" as const;

    suivant(phase :NomPhase): NomEtatSel{
        switch(phase){
            case "Matin":
                return "Craquelee";
            case "Nuit":
                 return "CrouteFragile";
            default:
                return "Boue";

        }
    }

    traverser(caravane: CaravaneJeu): void {
    caravane.enliser();
  }

}