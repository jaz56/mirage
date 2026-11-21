import type { NomPhase } from "../../contrats";
import type { EtatPhase } from "./EtatPhase";

export class Matin implements EtatPhase {
  readonly nom = "Matin" as const;
  readonly description = "Le matin réchauffe doucement le lac.";

  suivante(): NomPhase {
    return "Zenith";
  }
}
