import type {
  Action,
  DirectionAction,
  EtatPartie,
  FabriqueActions,
  IdJoueur,
  NomCarte,
  Position,
} from "../contrats";
import { Avancer } from "./actions/Avancer";
import { Boire } from "./actions/Boire";
import { JouerMirage } from "./actions/JouerMirage";

/**
 * Un déplacement dont le coût est calculé au moment où la partie le lit, et non à sa création :
 * une stratégie peut ainsi préparer plusieurs pas d'avance (le coût du 2e pas dépend du terrain
 * où l'on sera après le 1er).
 */
class AvancerPlanifie implements Action {
  /** Coût figé à l'exécution : la partie le relit après coup, depuis la nouvelle case. */
  private coutFige: number | undefined;

  constructor(
    readonly joueur: IdJoueur,
    private readonly direction: DirectionAction,
    private readonly etat: EtatPartie,
  ) {}

  get cout(): number {
    return this.coutFige ?? this.reel().cout;
  }

  executer(): void {
    const reel = this.reel();
    this.coutFige = reel.cout;
    reel.executer();
  }

  description(): string {
    return this.reel().description();
  }

  private reel(): Avancer {
    return new Avancer(this.joueur, this.direction, this.etat);
  }
}

/** Fabrique d'actions donnée aux stratégies d'IA (le module perception/ n'importe pas temps/). */
export class FabriqueActionsJeu implements FabriqueActions {
  constructor(private readonly etat: EtatPartie) {}

  avancer(joueur: IdJoueur, direction: DirectionAction): Action {
    return new AvancerPlanifie(joueur, direction, this.etat);
  }

  boire(joueur: IdJoueur): Action {
    return new Boire(joueur, this.etat);
  }

  jouerMirage(joueur: IdJoueur, carte: NomCarte, cible: Position): Action {
    return new JouerMirage(joueur, carte, cible, this.etat);
  }
}
