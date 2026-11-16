import { Crepuscule } from "./Crepuscule";
import { PhaseSoleil } from "./PhaseSoleil";

export class Zenith extends PhaseSoleil {
  readonly nom = "Zenith" as const;

  suivante(): PhaseSoleil {
    return new Crepuscule();
  }

  description(): string {
    return "Le soleil est au zénith : la chaleur trouble l'horizon, le sel craquelé devient boue.";
  }
}
