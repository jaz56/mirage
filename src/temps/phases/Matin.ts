import { PhaseSoleil } from "./PhaseSoleil";
import { Zenith } from "./Zenith";

export class Matin extends PhaseSoleil {
  readonly nom = "Matin" as const;

  suivante(): PhaseSoleil {
    return new Zenith();
  }

  description(): string {
    return "Le matin est clair : le lac se voit tel qu'il est.";
  }
}
