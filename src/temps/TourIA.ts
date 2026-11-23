import type { IdJoueur, StrategieIA } from "../contrats";
import { ActionImpossible } from "./actions/ActionImpossible";
import type { Partie } from "./Partie";

/**
 * Joue le tour du joueur courant avec une stratégie (patron Strategy) puis termine son tour.
 * Les actions refusées par la partie arrêtent le tour sans coûter de point d'action.
 * Utilisé par la boucle console et par l'interface graphique.
 */
export function jouerTourIA(
  partie: Partie,
  joueur: IdJoueur,
  strategie: StrategieIA,
  sortie: (texte: string) => void,
): void {
  const actions = strategie.choisirActions(partie, partie.paRestants());
  for (const action of actions) {
    if (partie.estTerminee()) {
      break;
    }
    try {
      partie.executer(action);
      sortie(`${joueur} (IA) : ${action.description()}`);
    } catch (erreur) {
      if (erreur instanceof ActionImpossible) {
        sortie(`${joueur} (IA) : action refusée, ${erreur.message}`);
        break;
      }
      throw erreur;
    }
  }
  if (!partie.estTerminee() && partie.joueurCourant() === joueur) {
    partie.finDeTourJoueur();
  }
}
