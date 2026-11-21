import type { NomPhase } from "../../contrats";
import type { EtatPhase } from "./EtatPhase";

export class Zenith implements EtatPhase {
  readonly nom = "Zenith" as const;
  readonly description = "Le zénith écrase le lac de chaleur : le sel craquelle.";

  suivante(): NomPhase {
    return "Crepuscule";
  }
}
