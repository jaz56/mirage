import type { Action, EtatPartie, IdJoueur, NomPhase, StrategieIA } from "../contrats";
import { ActionImpossible } from "./actions/ActionImpossible";
import { Sonder } from "./actions/Sonder";
import { AIDE, analyserCommande } from "./console/commandes";
import type { Entree } from "./console/Entree";
import { Partie, type Vainqueur } from "./Partie";
import { Soleil } from "./Soleil";

export type Resultat = Vainqueur | "Abandon";

export interface OptionsBoucle {
  /** D'où viennent les commandes (le clavier, ou un script dans les tests). */
  readonly entree: Entree;
  /** Où écrire les messages (console.log, ou un tableau dans les tests). */
  readonly sortie: (texte: string) => void;
  /** Dessine le lac pour un joueur : fourni par main.ts (rendu console de Nour). */
  readonly afficher: (etat: EtatPartie, joueur: IdJoueur) => void;
  /** Un joueur piloté par une IA (patron Strategy) au lieu du clavier. */
  readonly strategies?: Partial<Record<IdJoueur, StrategieIA>>;
}

/** La boucle de jeu : tour après tour, lit les commandes, les exécute et annonce les phases. */
export class BoucleDeJeu {
  private dernierePhase: NomPhase | undefined;

  constructor(
    private readonly partie: Partie,
    private readonly options: OptionsBoucle,
  ) {}

  async jouer(): Promise<Resultat> {
    const { sortie } = this.options;
    while (!this.partie.estTerminee()) {
      const joueur = this.partie.joueurCourant();
      this.annoncerPhase();
      sortie(`\n=== Tour ${this.partie.tour()} | ${joueur} | ${this.partie.paRestants()} PA ===`);
      const strategie = this.options.strategies?.[joueur];
      const continuer = strategie
        ? this.jouerIA(joueur, strategie)
        : await this.jouerHumain(joueur);
      if (!continuer) {
        sortie("Partie abandonnée.");
        return "Abandon";
      }
    }
    const vainqueur = this.partie.vainqueur() as Vainqueur;
    sortie(
      vainqueur === "Egalite"
        ? "\nFin de la partie : égalité, personne n'a traversé le lac à temps."
        : `\nVictoire de ${vainqueur} : sa caravane a traversé le lac !`,
    );
    return vainqueur;
  }

  private annoncerPhase(): void {
    const phase = this.partie.phase();
    if (phase !== this.dernierePhase) {
      this.options.sortie(`Phase : ${phase} - ${Soleil.getInstance().getDescription()}`);
      this.dernierePhase = phase;
    }
  }

  /** Tour d'un joueur au clavier. Renvoie false si le joueur abandonne. */
  private async jouerHumain(joueur: IdJoueur): Promise<boolean> {
    const { entree, sortie, afficher } = this.options;
    afficher(this.partie, joueur);
    while (!this.partie.estTerminee() && this.partie.joueurCourant() === joueur) {
      const ligne = await entree.lire(`${joueur} (${this.partie.paRestants()} PA) > `);
      if (ligne === undefined) {
        return false;
      }
      const commande = analyserCommande(ligne, joueur, this.partie);
      switch (commande.genre) {
        case "erreur":
          sortie(commande.message);
          break;
        case "aide":
          sortie(AIDE);
          break;
        case "quitter":
          return false;
        case "fin":
          this.partie.finDeTourJoueur();
          break;
        case "action":
          this.executerAction(commande.action, joueur, afficher);
          break;
      }
    }
    return true;
  }

  private executerAction(
    action: Action,
    joueur: IdJoueur,
    afficher: OptionsBoucle["afficher"],
  ): void {
    try {
      this.partie.executer(action);
    } catch (erreur) {
      if (erreur instanceof ActionImpossible) {
        this.options.sortie(erreur.message);
        return;
      }
      throw erreur;
    }
    this.options.sortie(`-> ${action.description()}`);
    if (action instanceof Sonder && action.rapport !== undefined) {
      this.options.sortie(action.rapport);
    }
    if (this.partie.estTerminee()) {
      return;
    }
    if (this.partie.paRestants() === 0) {
      this.options.sortie("Plus de points d'action : fin de ton tour.");
      this.partie.finDeTourJoueur();
    } else {
      afficher(this.partie, joueur);
    }
  }

  /** Tour d'un joueur piloté par une stratégie. */
  private jouerIA(joueur: IdJoueur, strategie: StrategieIA): boolean {
    const actions = strategie.choisirActions(this.partie, this.partie.paRestants());
    for (const action of actions) {
      if (this.partie.estTerminee()) {
        break;
      }
      try {
        this.partie.executer(action);
        this.options.sortie(`${joueur} (IA) : ${action.description()}`);
      } catch (erreur) {
        if (erreur instanceof ActionImpossible) {
          this.options.sortie(`${joueur} (IA) : action refusée, ${erreur.message}`);
          break;
        }
        throw erreur;
      }
    }
    if (!this.partie.estTerminee() && this.partie.joueurCourant() === joueur) {
      this.partie.finDeTourJoueur();
    }
    return true;
  }
}
