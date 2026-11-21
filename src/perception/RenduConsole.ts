import type { CaseVue, NomTerrain, Position, Vue } from "../contrats";
import { HAUTEUR, LARGEUR } from "../config/constantes";

const SYMBOLES: Record<NomTerrain, string> = {
  croute: ".",
  dune: "^",
  oasis: "O",
  "puits-sec": "X",
};

export class RenduConsole {
  constructor(private readonly caravane?: () => Position) {}

  afficher(vue: Vue): string {
    const lignes: string[] = [];
    const pos = this.caravane?.();
    for (let y = 0; y < HAUTEUR; y++) {
      let ligne = "";
      for (let x = 0; x < LARGEUR; x++) {
        ligne += pos && pos.x === x && pos.y === y ? "C" : this.symbole(vue.voir({ x, y }));
        ligne += " ";
      }
      lignes.push(ligne.trimEnd());
    }
    return lignes.join("\n");
  }

  private symbole(v: CaseVue): string {
    if (v.balise) return "B";
    return v.terrain === "?" ? "?" : SYMBOLES[v.terrain];
  }
}
