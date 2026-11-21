import type { CaseVue, NomTerrain, Position, Vue } from "../../contrats";
import { Deformation, memePosition } from "./Deformation";

export class Mirage extends Deformation {
  constructor(
    interne: Vue,
    private readonly cible: Position,
    private readonly faux: NomTerrain,
  ) {
    super(interne);
  }

  override voir(p: Position): CaseVue {
    const v = this.interne.voir(p);
    return memePosition(p, this.cible) ? { ...v, terrain: this.faux } : v;
  }
}
