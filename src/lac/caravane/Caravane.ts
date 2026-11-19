import type {
  CaravaneJeu,
  IdJoueur,
  NomEtatChameau,
  NomPhase,
  Position,
  TypeTerrain,
} from "../../contrats";
import { TOURS_PAR_PHASE } from "../../config/constantes";
import { creerEtatChameau, type EtatChameau } from "./EtatChameau";

/** La caravane d'un joueur : position, outres, cartes et état du chameau (State). */

export class Caravane implements CaravaneJeu{
    private position:Position;
    private etat :EtatChameau = creerEtatChameau("Repose");
    private nbOutres :number;
    private nbCartes :number;
    private toursSansBoire =0;
    private enlisee =false;

    constructor(
    readonly joueur: IdJoueur,
    positionDepart: Position,
    outres: number,
    cartes: number,
  ) {
    this.position = positionDepart;
    this.nbOutres = outres;
    this.nbCartes = cartes;
  }

  getPosition(): Position {
    return this.position;
  }

  deplacer(p: Position): void {
    this.position = p;
  }

  getEtatChameau(): NomEtatChameau {
    return this.etat.nom;
  }

  coutDeplacement(t: TypeTerrain): number {
    return t.cout + this.etat.surcout;
  }

  estEnlisee(): boolean {
    return this.enlisee;
  }

  enliser(): void {
    this.enlisee = true;
  }

  paniquer(): void {
    this.changerEtat("Panique");
  }

 boire(): boolean {
    if (this.nbOutres <= 0) {
      return false;
    }
    this.nbOutres -= 1;
    this.toursSansBoire = 0;
    this.changerEtat(this.etat.apresBoire());
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

  /** À chaque phase : le temps passe (soif), la caravane se dégage de la boue, le chameau évolue. */
  surPhase(phase: NomPhase): void {
    this.toursSansBoire += TOURS_PAR_PHASE;
    this.enlisee = false;
    this.changerEtat(this.etat.apresPhase(phase, this.toursSansBoire));
  }

  private changerEtat(nom: NomEtatChameau): void {
    if (nom !== this.etat.nom) {
      this.etat = creerEtatChameau(nom);
    }
  }
}

    
