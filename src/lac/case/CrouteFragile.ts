import type { CaravaneJeu, NomEtatSel, NomPhase } from "../../contrats";
import type { EtatSel } from "./EtatSel";

/** Croûte fragile : elle craque sous les pattes et le chameau panique. Elle redevient solide à l'aube. */

export class CrouteFragile implements EtatSel {
  readonly nom = "CrouteFragile" as const;

  suivant(phase: NomPhase): NomEtatSel {
    return phase == "Aube" ? "Solide" : "CrouteFragile";
  }

  traverser(caravane: CaravaneJeu): void {
    caravane.paniquer();
  }
}
