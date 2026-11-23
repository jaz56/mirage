import type {
  Action,
  CaravaneJeu,
  EtatPartie,
  IdJoueur,
  NomPhase,
  Perception,
  Plateau,
} from "../contrats";
import { PA_PAR_TOUR, TOURS_MAX, TOURS_PAR_PHASE } from "../config/constantes";
import { ActionImpossible } from "./actions/ActionImpossible";
import { Soleil } from "./Soleil";

export type Vainqueur = IdJoueur | "Egalite";

/** Une action jouée, avec le moment où elle l'a été : sert au replay de fin de partie. */
export interface EntreeReplay {
  readonly tour: number;
  readonly phase: NomPhase;
  readonly joueur: IdJoueur;
  readonly texte: string;
}

/** Ce que main.ts fournit à la partie : tout est injecté, rien n'est créé ici. */
export interface ConfigurationPartie {
  readonly plateau: Plateau;
  readonly caravanes: Readonly<Record<IdJoueur, CaravaneJeu>>;
  readonly perceptions: Readonly<Record<IdJoueur, Perception>>;
}

/**
 * La partie : Singleton. Elle garde le tour, le joueur courant et ses points d'action,
 * fait avancer le Soleil et décide de la fin du jeu.
 *
 * Un « tour » est une manche : J1 joue puis J2 joue. Le Soleil avance toutes les
 * TOURS_PAR_PHASE manches. La partie s'arrête à la manche TOURS_MAX (égalité) ou quand une
 * caravane atteint le bord opposé du lac (J1 la dernière ligne, J2 la première).
 */
export class Partie implements EtatPartie {
  private static instance: Partie | undefined;

  private config: ConfigurationPartie | undefined;
  private tourCourant = 1;
  private joueur: IdJoueur = "J1";
  private pa = PA_PAR_TOUR;
  private actionsJouees: string[] = [];
  private entreesReplay: EntreeReplay[] = [];
  private issue: Vainqueur | null = null;

  private constructor() {}

  static getInstance(): Partie {
    if (Partie.instance === undefined) {
      Partie.instance = new Partie();
    }
    return Partie.instance;
  }

  /** Pour les tests : repart d'une instance vierge. */
  static reinitialiserInstance(): void {
    Partie.instance = undefined;
  }

  /** Démarre une nouvelle partie. Les cases, caravanes et perceptions sont abonnés au Soleil. */
  initialiser(config: ConfigurationPartie): void {
    const soleil = Soleil.getInstance();
    soleil.reinitialiser();
    // Ordre voulu : les cases changent d'abord, puis les caravanes, puis les perceptions
    // (une perception est reconstruite à partir de l'état déjà à jour du lac).
    for (const c of config.plateau.toutes()) {
      soleil.abonner(c);
    }
    soleil.abonner(config.caravanes.J1);
    soleil.abonner(config.caravanes.J2);
    soleil.abonner(config.perceptions.J1);
    soleil.abonner(config.perceptions.J2);

    this.config = config;
    this.tourCourant = 1;
    this.joueur = "J1";
    this.pa = PA_PAR_TOUR;
    this.actionsJouees = [];
    this.entreesReplay = [];
    this.issue = null;
  }

  // --- Lecture de la partie (contrat EtatPartie) ---

  get plateau(): Plateau {
    return this.configuration().plateau;
  }

  caravane(j: IdJoueur): CaravaneJeu {
    return this.configuration().caravanes[j];
  }

  perception(j: IdJoueur): Perception {
    return this.configuration().perceptions[j];
  }

  phase(): NomPhase {
    return Soleil.getInstance().getPhase();
  }

  tour(): number {
    return this.tourCourant;
  }

  // --- Déroulement ---

  joueurCourant(): IdJoueur {
    return this.joueur;
  }

  paRestants(): number {
    return this.pa;
  }

  /** Descriptions des actions jouées, dans l'ordre (journal et replay). */
  journal(): readonly string[] {
    return this.actionsJouees;
  }

  /** Toutes les actions jouées avec leur tour et leur phase du Soleil (replay final). */
  replay(): readonly EntreeReplay[] {
    return this.entreesReplay;
  }

  estTerminee(): boolean {
    return this.issue !== null;
  }

  vainqueur(): Vainqueur | null {
    return this.issue;
  }

  /** Exécute une action du joueur courant. Une action refusée ne coûte aucun PA. */
  executer(action: Action): void {
    this.verifierEnCours();
    if (action.joueur !== this.joueur) {
      throw new ActionImpossible(`Ce n'est pas le tour de ${action.joueur}.`);
    }
    if (action.cout > this.pa) {
      throw new ActionImpossible(
        `Pas assez de points d'action : ${action.cout} nécessaires, ${this.pa} restants.`,
      );
    }
    action.executer();
    this.pa -= action.cout;
    const texte = action.description();
    this.actionsJouees.push(texte);
    this.entreesReplay.push({
      tour: this.tourCourant,
      phase: this.phase(),
      joueur: this.joueur,
      texte,
    });
    this.verifierVictoire();
  }

  /** Termine le tour du joueur courant. Après J2, la manche se termine. */
  finDeTourJoueur(): void {
    this.verifierEnCours();
    if (this.joueur === "J1") {
      this.joueur = "J2";
      this.pa = PA_PAR_TOUR;
      return;
    }
    this.finDeManche();
  }

  private finDeManche(): void {
    const config = this.configuration();
    config.perceptions.J1.finDeTour();
    config.perceptions.J2.finDeTour();
    if (this.tourCourant % TOURS_PAR_PHASE === 0) {
      Soleil.getInstance().avancer();
    }
    if (this.tourCourant >= TOURS_MAX) {
      this.issue = "Egalite";
      return;
    }
    this.tourCourant += 1;
    this.joueur = "J1";
    this.pa = PA_PAR_TOUR;
  }

  private verifierVictoire(): void {
    const plateau = this.plateau;
    const ligneBut = this.joueur === "J1" ? plateau.hauteur - 1 : 0;
    if (this.caravane(this.joueur).getPosition().y === ligneBut) {
      this.issue = this.joueur;
    }
  }

  private verifierEnCours(): void {
    if (this.estTerminee()) {
      throw new ActionImpossible("La partie est terminée.");
    }
  }

  private configuration(): ConfigurationPartie {
    if (this.config === undefined) {
      throw new Error("Partie non initialisée : main.ts doit appeler initialiser() d'abord.");
    }
    return this.config;
  }
}
