import type { Action, CaseVue, EtatPartie, NomCarte, Position, Vue } from "../../contrats";
import { StrategieBase } from "./StrategieBase";

/**
 * IA bluffeuse : prend plus de risques pour aller vite et, un tour sur deux, joue une carte
 * Mirage pour tromper l'adversaire sur la case qu'il s'apprête à traverser.
 */
export class Bluffeuse extends StrategieBase {
  protected readonly poidsRisque = 1;

  protected override carte(etat: EtatPartie, vue: Vue, pa: number): Action | undefined {
    if (etat.caravane(this.joueur).cartes() <= 0 || etat.tour() % 2 !== 0) {
      return undefined;
    }
    const cible = this.cibleDuBluff(etat, vue);
    const action = this.actions.jouerMirage(this.joueur, this.choisirCarte(vue.voir(cible)), cible);
    return action.cout < pa ? action : undefined; // il doit rester un point d'action pour avancer
  }

  /** La case devant l'adversaire s'il est visible, sinon le milieu du lac, que tous traversent. */
  private cibleDuBluff(etat: EtatPartie, vue: Vue): Position {
    const { largeur, hauteur } = etat.plateau;
    const adversaire = etat.caravane(this.adversaire()).getPosition();
    if (vue.voir(adversaire).terrain !== "?") {
      const devant = adversaire.y + (this.adversaire() === "J1" ? 1 : -1);
      return { x: adversaire.x, y: Math.min(hauteur - 1, Math.max(0, devant)) };
    }
    return { x: Math.floor(largeur / 2), y: Math.floor(hauteur / 2) };
  }

  /** Cache un danger, ou fait passer un terrain pénible pour une oasis (et inversement). */
  private choisirCarte(vu: CaseVue): NomCarte {
    if (vu.etat === "Craquelee" || vu.etat === "CrouteFragile") {
      return "SelTrompeur";
    }
    if (vu.terrain === "dune" || vu.terrain === "puits-sec") {
      return "FausseOasis";
    }
    return "DuneFantome";
  }
}
