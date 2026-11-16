import { Aube } from "./Aube";
import { PhaseSoleil } from "./PhaseSoleil";

export class Nuit extends PhaseSoleil {
  readonly nom = "Nuit" as const;

  suivante(): PhaseSoleil {
    return new Aube();
  }

  description(): string {
    return "La nuit tombe : on ne voit plus qu'à une case, la boue se reforme en croûte fragile.";
  }
}
