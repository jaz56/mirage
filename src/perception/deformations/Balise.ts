import type { CaseVue, Plateau, Position, Vue } from "../../contrats";
import { Deformation } from "./Deformation";

export class Balise extends Deformation {
  constructor(
    interne: Vue,
    private readonly plateau: Plateau,
  ) {
    super(interne);
  }

  override voir(p: Position): CaseVue {
    const v = this.interne.voir(p);
    return { ...v, balise: this.plateau.get(p)?.aBalise() ?? false };
  }
}
