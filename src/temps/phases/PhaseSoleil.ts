// Patron State — état abstrait du Soleil.
// Chaque phase décide elle-même quand elle se termine et quelle phase vient après :
// Soleil ne contient aucun if/switch sur la phase courante.
import { TOURS_PAR_PHASE } from "../../config/constantes";
import type { NomPhase } from "../../contrats";
import type { Soleil } from "../Soleil";

export abstract class PhaseSoleil {
  abstract readonly nom: NomPhase;

  /** Phase qui suit celle-ci dans la journée. */
  abstract suivante(): PhaseSoleil;

  /** Texte affiché au joueur quand la phase commence. */
  abstract description(): string;

  /** Nombre de tours que dure la phase. Une phase peut le redéfinir. */
  duree(): number {
    return TOURS_PAR_PHASE;
  }

  /** Appelé par le Soleil à chaque tour : la phase décide de la transition. */
  tourEcoule(soleil: Soleil): void {
    if (soleil.toursDansPhase() >= this.duree()) {
      soleil.changerPhase(this.suivante());
    }
  }
}
