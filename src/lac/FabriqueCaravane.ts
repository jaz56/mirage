import type { IdJoueur, Position } from "../contrats";
import { CARTES_DEPART, HAUTEUR, LARGEUR, OUTRES_DEPART } from "../config/constantes";
import { Caravane } from "./caravane/Caravane";

/**
 * Patron Factory Method : creer() construit la caravane d'un joueur avec les valeurs de départ
 * des constantes. positionDepart() peut être redéfinie par une sous-classe.
 */
export class FabriqueCaravane {
  creer(joueur: IdJoueur): Caravane {
    return new Caravane(joueur, this.positionDepart(joueur), OUTRES_DEPART, CARTES_DEPART);
  }

  /** J1 part du haut du lac, J2 du bas, au milieu de la largeur. */
  protected positionDepart(joueur: IdJoueur): Position {
    return { x: Math.floor(LARGEUR / 2), y: joueur === "J1" ? 0 : HAUTEUR - 1 };
  }
}
