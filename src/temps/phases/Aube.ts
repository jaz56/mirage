import type { NomPhase } from "../../contrats";
import type { EtatPhase } from "./EtatPhase";

export class Aube implements EtatPhase {
  readonly nom = "Aube" as const;
  readonly description = "L'aube se lève : le sel est dur et frais.";

  suivante(): NomPhase {
    return "Matin";
  }
}
