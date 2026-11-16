import { Matin } from "./Matin";
import { PhaseSoleil } from "./PhaseSoleil";

export class Aube extends PhaseSoleil {
  readonly nom = "Aube" as const;

  suivante(): PhaseSoleil {
    return new Matin();
  }

  description(): string {
    return "L'aube se lève : la brume limite la vue, la croûte de sel durcit.";
  }
}
