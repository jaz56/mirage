import type { NomTerrain } from "../contrats";
import { HAUTEUR, LARGEUR } from "../config/constantes";
import { Case } from "./case/Case";
import { Plateau } from "./Plateau";
import { FabriqueTerrains } from "./terrain/FabriqueTerrains";

/**
 * Patron Factory Method : creer() assemble le plateau, les sous-classes décident
 * quels terrains le composent (genererTerrains). Un plateau sans chemin praticable est refusé.
 */
export abstract class FabriquePlateau {
  constructor(protected readonly terrains: FabriqueTerrains = new FabriqueTerrains()) {}

  /** Méthode de fabrication : grille de noms de terrains, terrains[y][x]. */
  protected abstract genererTerrains(): NomTerrain[][];

  creer(): Plateau {
    const noms = this.genererTerrains();
    const grille = noms.map((ligne, y) =>
      ligne.map((nom, x) => new Case({ x, y }, this.terrains.get(nom))),
    );
    const plateau = new Plateau(grille);
    if (!plateau.existeCheminPraticable()) {
      throw new Error("Plateau invalide : aucun chemin praticable entre le haut et le bas du lac");
    }
    return plateau;
  }
}

/** Répartition des terrains tirés au hasard (poids relatifs). */
const POIDS_TERRAINS: ReadonlyArray<readonly [NomTerrain, number]> = [
  ["croute", 60],
  ["dune", 25],
  ["oasis", 5],
  ["puits-sec", 10],
];

/**
 * Lac aléatoire. Le générateur de hasard est injectable pour obtenir des tests reproductibles.
 * Un chemin de croûte est toujours tracé du haut vers le bas, donc le lac est toujours praticable.
 */
export class FabriquePlateauAleatoire extends FabriquePlateau {
  constructor(
    private readonly alea: () => number = Math.random,
    terrains?: FabriqueTerrains,
    private readonly largeur: number = LARGEUR,
    private readonly hauteur: number = HAUTEUR,
  ) {
    super(terrains);
  }

  protected genererTerrains(): NomTerrain[][] {
    const grille: NomTerrain[][] = [];
    for (let y = 0; y < this.hauteur; y++) {
      const ligne: NomTerrain[] = [];
      for (let x = 0; x < this.largeur; x++) {
        ligne.push(this.terrainAuHasard());
      }
      grille.push(ligne);
    }
    this.tracerCheminGaranti(grille);
    return grille;
  }

  private terrainAuHasard(): NomTerrain {
    const total = POIDS_TERRAINS.reduce((somme, [, poids]) => somme + poids, 0);
    let tirage = this.alea() * total;
    for (const [nom, poids] of POIDS_TERRAINS) {
      if (tirage < poids) {
        return nom;
      }
      tirage -= poids;
    }
    return "croute";
  }

  /** Marche aléatoire du haut vers le bas, qui pose de la croûte sur son passage. */
  private tracerCheminGaranti(grille: NomTerrain[][]): void {
    let x = Math.min(this.largeur - 1, Math.floor(this.alea() * this.largeur));
    for (let y = 0; y < this.hauteur; y++) {
      grille[y][x] = "croute";
      if (y < this.hauteur - 1) {
        const decalage = Math.floor(this.alea() * 3) - 1; // -1, 0 ou +1
        const nx = Math.max(0, Math.min(this.largeur - 1, x + decalage));
        grille[y][nx] = "croute"; // garde la continuité si on se décale sur la même ligne
        x = nx;
      }
    }
  }
}
