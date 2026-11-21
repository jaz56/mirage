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

  /**
   * Marche aléatoire de la case de départ de J1 (milieu de la première ligne) à celle de J2
   * (milieu de la dernière ligne), qui pose de la croûte sur son passage. Les deux départs
   * sont donc toujours sur un chemin praticable qui les relie.
   */
  private tracerCheminGaranti(grille: NomTerrain[][]): void {
    const milieu = Math.floor(this.largeur / 2);
    let x = milieu;
    for (let y = 0; y < this.hauteur; y++) {
      grille[y][x] = "croute";
      if (y < this.hauteur - 1) {
        // Un décalage d'une colonne par ligne au maximum : il faut garder assez de lignes
        // en dessous pour pouvoir revenir au milieu.
        const candidats = [x - 1, x, x + 1].filter(
          (c) => c >= 0 && c < this.largeur && Math.abs(c - milieu) <= this.hauteur - 2 - y,
        );
        const choix = Math.min(candidats.length - 1, Math.floor(this.alea() * candidats.length));
        x = candidats[choix];
        grille[y][x] = "croute"; // garde la continuité quand on se décale sur la même ligne
      }
    }
  }
}
