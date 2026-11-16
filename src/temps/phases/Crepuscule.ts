import { Nuit } from "./Nuit";
import { PhaseSoleil } from "./PhaseSoleil";

export class Crepuscule extends PhaseSoleil {
  readonly nom = "Crepuscule" as const;

  suivante(): PhaseSoleil {
    return new Nuit();
  }

  description(): string {
    return "Le crépuscule tombe : le vent se lève et décale les repères.";
  }
}
