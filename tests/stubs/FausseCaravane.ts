import type {
  CaravaneJeu,
  NomEtatChameau,
  NomPhase,
  Position,
  TypeTerrain,
} from "../../src/contrats";

/** Fausse caravane : enregistre les appels reçus, pour tester une Case sans vraie Caravane. */
export class FausseCaravane implements CaravaneJeu {
  readonly joueur = "J1" as const;
  position: Position = { x: 0, y: 0 };
  enlisee = false;
  paniquee = false;
  phasesRecues: NomPhase[] = [];

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
    return true;
  }
  outres(): number {
    return 3;
  }
  cartes(): number {
    return 3;
  }
  utiliserCarte(): boolean {
    return true;
  }
  surPhase(phase: NomPhase): void {
    this.phasesRecues.push(phase);
  }
}
