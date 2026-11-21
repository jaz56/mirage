import type { CaseVue, Plateau, Position, Vue } from "../contrats";

export class VueReelle implements Vue {
  constructor(private readonly plateau: Plateau) {}

  voir(p: Position): CaseVue {
    const c = this.plateau.get(p);
    if (!c) return { terrain: "?", etat: "?", balise: false };
    return { terrain: c.terrain.nom, etat: c.getEtat(), balise: c.aBalise() };
  }
}
