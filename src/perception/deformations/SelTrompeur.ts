import type { CaseVue, Position, Vue } from "../../contrats";
import { Deformation, memePosition } from "./Deformation";

export class SelTrompeur extends Deformation {
  constructor(
    interne: Vue,
    private readonly cible: Position,
  ) {
    super(interne);
  }

  override voir(p: Position): CaseVue {
    const v = this.interne.voir(p);
    if (memePosition(p, this.cible) && (v.etat === "Craquelee" || v.etat === "CrouteFragile")) {
      return { ...v, etat: "Solide" };
    }
    return v;
  }
}
