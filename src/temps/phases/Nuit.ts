import type { NomPhase } from "../../contrats";
import type { EtatPhase } from "./EtatPhase";

export class Nuit implements EtatPhase {
  readonly nom = "Nuit" as const;
  readonly description = "La nuit tombe : on n'y voit presque plus et la croûte devient fragile.";

  suivante(): NomPhase {
    return "Aube";
  }
}
