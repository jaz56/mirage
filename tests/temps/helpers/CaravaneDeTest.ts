import type {
  CaravaneJeu,
  IdJoueur,
  NomEtatChameau,
  NomPhase,
  Position,
  TypeTerrain,
} from "../../../src/contrats";

/** Fausse caravane pour tester temps/ sans le vrai module lac/. */
export class CaravaneDeTest implements CaravaneJeu {
  enlisee = false;
  paniquee = false;
  phasesRecues: NomPhase[] = [];
  private position: Position;
  private nbOutres: number;
  private nbCartes: number;

  constructor(
    readonly joueur: IdJoueur,
    position: Position,
    options: { outres?: number; cartes?: number } = {},
  ) {
    this.position = position;
    this.nbOutres = options.outres ?? 3;
    this.nbCartes = options.cartes ?? 3;
  }

  getPosition(): Position {
    return this.position;
  }
  deplacer(p: Position): void {
    this.position = p;
  }
  getEtatChameau(): NomEtatChameau {
    return this.paniquee ? "Panique" : "Repose";
  }
  coutDeplacement(t: TypeTerrain): number {
    return t.cout;
  }
  estEnlisee(): boolean {
    return this.enlisee;
  }
  enliser(): void {
    this.enlisee = true;
  }
  paniquer(): void {
    this.paniquee = true;
  }
  boire(): boolean {
    if (this.nbOutres <= 0) {
      return false;
    }
    this.nbOutres -= 1;
    return true;
  }
  outres(): number {
    return this.nbOutres;
  }
  cartes(): number {
    return this.nbCartes;
  }
  utiliserCarte(): boolean {
    if (this.nbCartes <= 0) {
      return false;
    }
    this.nbCartes -= 1;
    return true;
  }
  surPhase(phase: NomPhase): void {
    this.phasesRecues.push(phase);
  }
}
