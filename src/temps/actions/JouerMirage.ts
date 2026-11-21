import type { Action, EtatPartie, IdJoueur, NomCarte, Position } from "../../contrats";
import { adversaire } from "../joueurs";
import { ActionImpossible } from "./ActionImpossible";
import { COUT_MIRAGE } from "./couts";

/**
 * Commande : jouer une carte contre l'adversaire. On envoie seulement le NOM de la carte à la
 * perception de l'adversaire, qui construit elle-même la déformation (module de Nour).
 */
export class JouerMirage implements Action {
  readonly cout = COUT_MIRAGE;

  constructor(
    readonly joueur: IdJoueur,
    private readonly carte: NomCarte,
    private readonly cible: Position,
    private readonly etat: EtatPartie,
  ) {}

  executer(): void {
    if (this.etat.plateau.get(this.cible) === undefined) {
      throw new ActionImpossible("La cible est hors du lac.");
    }
    if (!this.etat.caravane(this.joueur).utiliserCarte()) {
      throw new ActionImpossible("Tu n'as plus de carte à jouer.");
    }
    this.etat.perception(adversaire(this.joueur)).appliquerCarte(this.carte, this.cible);
  }

  description(): string {
    return `${this.joueur} joue la carte ${this.carte} sur (${this.cible.x}, ${this.cible.y})`;
  }
}
