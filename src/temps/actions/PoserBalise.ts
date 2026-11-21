import type { Action, EtatPartie, IdJoueur } from "../../contrats";
import { ActionImpossible } from "./ActionImpossible";
import { COUT_BALISE } from "./couts";

/** Commande : poser une balise sur la case où se trouve la caravane. */
export class PoserBalise implements Action {
  readonly cout = COUT_BALISE;

  constructor(
    readonly joueur: IdJoueur,
    private readonly etat: EtatPartie,
  ) {}

  executer(): void {
    const position = this.etat.caravane(this.joueur).getPosition();
    const c = this.etat.plateau.get(position);
    if (c === undefined) {
      throw new ActionImpossible("Aucune case sous ta caravane.");
    }
    if (c.aBalise()) {
      throw new ActionImpossible("Il y a déjà une balise ici.");
    }
    c.poserBalise();
  }

  description(): string {
    return `${this.joueur} pose une balise`;
  }
}
