import type { CaseLac, Plateau as ContratPlateau, Position } from "../contrats";
import { estPraticable } from "./terrain/FabriqueTerrains";


/** Grille du lac. grille[y][x] : y de 0 (haut) à hauteur-1 (bas), x de 0 à largeur-1. */
export class Plateau implements ContratPlateau{
    readonly largeur:number;
    readonly hauteur:number;

    constructor(private readonly grille: readonly (readonly CaseLac[])[]) {
    this.hauteur = grille.length;
    this.largeur = grille.length > 0 ? grille[0].length : 0;
  }

  get(p: Position): CaseLac | undefined {
    if (p.x < 0 || p.y < 0 || p.x >= this.largeur || p.y >= this.hauteur) {
      return undefined;
    }
    return this.grille[p.y]?.[p.x];
  }

 /** Les 4 voisines directes (haut, droite, bas, gauche) qui existent. */
  voisins(p: Position): CaseLac[] {
    const candidates: Position[] = [
      { x: p.x, y: p.y - 1 },
      { x: p.x + 1, y: p.y },
      { x: p.x, y: p.y + 1 },
      { x: p.x - 1, y: p.y },
    ];
    const resultat: CaseLac[] = [];
    for (const candidate of candidates) {
      const voisine = this.get(candidate);
      if (voisine !== undefined) {
        resultat.push(voisine);
      }
    }
    return resultat;
  }

  toutes(): CaseLac[] {
    return this.grille.flat();
  }
  /**
   * Vrai s'il existe un chemin de cases praticables (sans puits sec) entre la première
   * ligne et la dernière ligne du lac (parcours en largeur).
   */

existeCheminPraticable(): boolean {
    if (this.largeur === 0 || this.hauteur === 0) {
      return false;
    }
    const cle = (p: Position): string => `${p.x},${p.y}`;
    const vues = new Set<string>();
    const file: CaseLac[] = [];

    for (let x = 0; x < this.largeur; x++) {
      const depart = this.get({ x, y: 0 });
      if (depart !== undefined && estPraticable(depart.terrain)) {
        vues.add(cle(depart.position));
        file.push(depart);
      }
    }

    while (file.length > 0) {
      const courante = file.shift() as CaseLac;
      if (courante.position.y === this.hauteur - 1) {
        return true;
      }
      for (const voisine of this.voisins(courante.position)) {
        const k = cle(voisine.position);
        if (!vues.has(k) && estPraticable(voisine.terrain)) {
          vues.add(k);
          file.push(voisine);
        }
      }
    }
    return false;
  }
}
