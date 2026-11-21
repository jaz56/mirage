import type {
  CaravaneJeu,
  CaseLac,
  NomEtatSel,
  NomPhase,
  Position,
  TypeTerrain,
} from "../../contrats";
import { creerEtatSel, type EtatSel } from "./EtatSel";

/** Une case du lac : un terrain partagé (Flyweight) et un état du sel (State). */

export class Case implements CaseLac {
  private etat: EtatSel;
  private balise = false;

  constructor(
    readonly position: Position,
    readonly terrain: TypeTerrain,
    etatInitial: NomEtatSel = "Solide",
  ) {
    this.etat = creerEtatSel(etatInitial);
  }

  getEtat(): NomEtatSel {
    return this.etat.nom;
  }

  aBalise(): boolean {
    return this.balise;
  }

  poserBalise(): void {
    this.balise = true;
  }

  traverser(c: CaravaneJeu): void {
    this.etat.traverser(c);
  }

  surPhase(phase: NomPhase): void {
    const suivant = this.etat.suivant(phase);
    if (suivant != this.etat.nom) {
      this.etat = creerEtatSel(suivant);
    }
  }
}
