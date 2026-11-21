import type { Action, EtatPartie, IdJoueur } from "../../contrats";
import { ActionImpossible } from "./ActionImpossible";
import { COUT_SONDER } from "./couts";
import { decaler, NOMS_DIRECTIONS, type Direction } from "./directions";

/**
 * Commande : sonder une case (la sienne ou une voisine) pour connaître son vrai terrain et
 * l'état réel du sel, quelles que soient les déformations de la perception.
 * Le résultat est disponible dans `rapport` après executer().
 */
export class Sonder implements Action {
  readonly cout = COUT_SONDER;
  rapport: string | undefined;

  constructor(
    readonly joueur: IdJoueur,
    private readonly direction: Direction | "ici",
    private readonly etat: EtatPartie,
  ) {}

  executer(): void {
    const origine = this.etat.caravane(this.joueur).getPosition();
    const position = this.direction === "ici" ? origine : decaler(origine, this.direction);
    const c = this.etat.plateau.get(position);
    if (c === undefined) {
      throw new ActionImpossible("Il n'y a rien à sonder hors du lac.");
    }
    const balise = c.aBalise() ? ", balise posée" : "";
    this.rapport = `Sonde (${position.x}, ${position.y}) : terrain ${c.terrain.nom}, sel ${c.getEtat()}${balise}.`;
  }

  description(): string {
    const lieu = this.direction === "ici" ? "sa case" : `le ${NOMS_DIRECTIONS[this.direction]}`;
    return `${this.joueur} sonde ${lieu}`;
  }
}
