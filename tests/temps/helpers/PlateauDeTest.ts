import type {
  CaravaneJeu,
  CaseLac,
  NomEtatSel,
  NomPhase,
  Plateau,
  Position,
  TypeTerrain,
} from "../../../src/contrats";

const TERRAINS: Record<string, TypeTerrain> = {
  ".": { nom: "croute", cout: 1, symbole: "." },
  "^": { nom: "dune", cout: 2, symbole: "^" },
  O: { nom: "oasis", cout: 1, symbole: "O" },
  X: { nom: "puits-sec", cout: 1, symbole: "X" },
};

/** Fausse case : un état fixé à la main, et un compteur de passages. */
export class CaseDeTest implements CaseLac {
  passages = 0;
  phasesRecues: NomPhase[] = [];
  private balise = false;

  constructor(
    readonly position: Position,
    readonly terrain: TypeTerrain,
    private readonly etat: NomEtatSel = "Solide",
  ) {}

  getEtat(): NomEtatSel {
    return this.etat;
  }
  aBalise(): boolean {
    return this.balise;
  }
  poserBalise(): void {
    this.balise = true;
  }
  traverser(c: CaravaneJeu): void {
    this.passages += 1;
    if (this.etat === "Boue") {
      c.enliser();
    }
  }
  surPhase(phase: NomPhase): void {
    this.phasesRecues.push(phase);
  }
}

/**
 * Faux plateau construit depuis des chaînes ("." croûte, "^" dune, "O" oasis, "X" puits sec).
 * `etats` fixe l'état du sel de certaines cases, par exemple { "1,1": "Boue" }.
 */
export class PlateauDeTest implements Plateau {
  readonly largeur: number;
  readonly hauteur: number;
  private readonly grille: CaseDeTest[][];

  private constructor(grille: CaseDeTest[][]) {
    this.grille = grille;
    this.hauteur = grille.length;
    this.largeur = grille[0].length;
  }

  static depuis(
    lignes: readonly string[],
    etats: Record<string, NomEtatSel> = {},
  ): PlateauDeTest {
    const grille = lignes.map((ligne, y) =>
      [...ligne].map((caractere, x) => {
        const terrain = TERRAINS[caractere];
        if (terrain === undefined) {
          throw new Error(`Code de terrain inconnu "${caractere}"`);
        }
        return new CaseDeTest({ x, y }, terrain, etats[`${x},${y}`] ?? "Solide");
      }),
    );
    return new PlateauDeTest(grille);
  }

  get(p: Position): CaseLac | undefined {
    if (p.x < 0 || p.y < 0 || p.x >= this.largeur || p.y >= this.hauteur) {
      return undefined;
    }
    return this.grille[p.y][p.x];
  }

  voisins(p: Position): CaseLac[] {
    return [
      { x: p.x, y: p.y - 1 },
      { x: p.x + 1, y: p.y },
      { x: p.x, y: p.y + 1 },
      { x: p.x - 1, y: p.y },
    ]
      .map((q) => this.get(q))
      .filter((c): c is CaseLac => c !== undefined);
  }

  toutes(): CaseLac[] {
    return this.grille.flat();
  }

  caseDeTest(p: Position): CaseDeTest {
    return this.grille[p.y][p.x];
  }
}
