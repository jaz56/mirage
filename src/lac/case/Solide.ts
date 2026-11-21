import type { CaravaneJeu, NomEtatSel, NomPhase } from "../../contrats";
import type { EtatSel } from "./EtatSel";

/** Sel dur : passage sans risque. La chaleur du zénith le craquelle, la nuit le fragilise. */

export class Solide implements EtatSel {
  readonly nom = "Solide" as const;

  suivant(phase: NomPhase): NomEtatSel {
    switch (phase) {
      case "Zenith":
        return "Craquelee";
      case "Nuit":
        return "CrouteFragile";
      default:
        return "Solide";
    }
  }

  traverser(_caravane: CaravaneJeu): void {}
}
