import type { CaravaneJeu, NomEtatSel, NomPhase } from "../../contrats";
import type { EtatSel } from "./EtatSel";

export class Craquelee implements EtatSel {
  readonly nom = "Craquelee" as const;

  suivant(phase: NomPhase): NomEtatSel {
    switch (phase) {
      case "Crepuscule":
        return "Boue";
      case "Aube":
      case "Matin":
        return "Solide";
      default:
        return "Craquelee";
    }
  }

  traverser(_caravane: CaravaneJeu): void {
    // Aucun effet.
  }
}
