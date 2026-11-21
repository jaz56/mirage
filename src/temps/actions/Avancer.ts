import type { Action, EtatPartie, IdJoueur } from "../../contrats";
import { ActionImpossible } from "./ActionImpossible";
import { COUT_PAR_DEFAUT } from "./couts";
import { decaler, NOMS_DIRECTIONS, type Direction } from "./directions";

/** Commande : avancer d'une case. Coûte le coût du terrain d'arrivée, plus le surcoût du chameau. */
export class Avancer implements Action {
  readonly cout: number;

  constructor(
    readonly joueur: IdJoueur,
    private readonly direction: Direction,
    private readonly etat: EtatPartie,
  ) {
    const caravane = etat.caravane(joueur);
    const cible = etat.plateau.get(decaler(caravane.getPosition(), direction));
    this.cout = cible === undefined ? COUT_PAR_DEFAUT : caravane.coutDeplacement(cible.terrain);
  }

  executer(): void {
    const caravane = this.etat.caravane(this.joueur);
    if (caravane.estEnlisee()) {
      throw new ActionImpossible("Ta caravane est enlisée : attends la prochaine phase du Soleil.");
    }
    const cible = this.etat.plateau.get(decaler(caravane.getPosition(), this.direction));
    if (cible === undefined) {
      throw new ActionImpossible("Tu ne peux pas sortir du lac.");
    }
    if (cible.terrain.nom === "puits-sec") {
      throw new ActionImpossible("Un puits sec bloque le passage.");
    }
    caravane.deplacer(cible.position);
    cible.traverser(caravane);
  }

  description(): string {
    return `${this.joueur} avance vers le ${NOMS_DIRECTIONS[this.direction]}`;
  }
}
