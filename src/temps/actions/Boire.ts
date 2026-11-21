import type { Action, EtatPartie, IdJoueur } from "../../contrats";
import { ActionImpossible } from "./ActionImpossible";
import { COUT_BOIRE } from "./couts";

/** Commande : boire une outre pour calmer la soif du chameau. */
export class Boire implements Action {
  readonly cout = COUT_BOIRE;

  constructor(
    readonly joueur: IdJoueur,
    private readonly etat: EtatPartie,
  ) {}

  executer(): void {
    if (!this.etat.caravane(this.joueur).boire()) {
      throw new ActionImpossible("Tu n'as plus d'outre.");
    }
  }

  description(): string {
    return `${this.joueur} boit une outre`;
  }
}
