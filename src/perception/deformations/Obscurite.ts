import type { CaravaneJeu, CaseVue, Position, Vue } from "../../contrats";
import { Deformation, distance } from "./Deformation";

export class Obscurite extends Deformation {
  constructor(
    interne: Vue,
    private readonly caravane: CaravaneJeu,
    private readonly portee: number,
  ) {
    super(interne);
  }

  override voir(p: Position): CaseVue {
    const v = this.interne.voir(p);
    if (distance(this.caravane.getPosition(), p) <= this.portee) return v;
    return { terrain: "?", etat: "?", balise: v.balise };
  }
}
