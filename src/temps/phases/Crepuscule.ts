import type { NomPhase } from "../../contrats";
import type { EtatPhase } from "./EtatPhase";

export class Crepuscule implements EtatPhase {
  readonly nom = "Crepuscule" as const;
  readonly description = "Le crépuscule adoucit la lumière : le sel se ramollit en boue.";

  suivante(): NomPhase {
    return "Nuit";
  }
}
