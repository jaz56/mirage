import type { CaseVue, Position } from "../../contrats";
import { Deformation } from "./Deformation";

export class Vent extends Deformation {
  override voir(p: Position): CaseVue {
    const v = this.interne.voir(p);
    if ((p.x + p.y) % 2 === 0) return { ...v, terrain: "?", etat: "?" };
    return v;
  }
}
