// Une partie pilotée par l'interface graphique : même règles que la console (analyserCommande,
// Partie, Soleil), mais l'état est renvoyé en JSON au lieu d'être affiché en texte.
import type { CaseVue, IdJoueur, NomEtatChameau, NomPhase } from "../contrats";
import { FabriqueCaravane, FabriquePlateauAleatoire } from "../lac";
import { PerceptionProvisoire } from "../perceptionProvisoire";
import { ActionImpossible, analyserCommande, Partie, Sonder, Soleil } from "../temps";

export interface InfosCaravane {
  readonly x: number;
  readonly y: number;
  readonly outres: number;
  readonly cartes: number;
  readonly chameau: NomEtatChameau;
  readonly enlisee: boolean;
}

/** Tout ce dont la page a besoin pour dessiner le jeu du point de vue du joueur courant. */
export interface EtatWeb {
  readonly largeur: number;
  readonly hauteur: number;
  readonly tour: number;
  readonly phase: NomPhase;
  readonly descriptionPhase: string;
  readonly joueur: IdJoueur;
  readonly pa: number;
  readonly terminee: boolean;
  readonly vainqueur: IdJoueur | "Egalite" | null;
  readonly grille: readonly (readonly CaseVue[])[];
  readonly caravanes: Readonly<Record<IdJoueur, InfosCaravane>>;
  readonly journal: readonly string[];
}

export interface Reponse {
  readonly ok: boolean;
  /** Messages produits par la dernière commande (erreur, résultat d'une sonde...). */
  readonly messages: readonly string[];
  readonly etat: EtatWeb;
}

const TAILLE_JOURNAL = 60;

export class SessionJeu {
  private partie: Partie = Partie.getInstance();
  private journal: string[] = [];

  constructor() {
    this.nouvelle();
  }

  /** Nouvelle partie : nouveau lac aléatoire, nouvelles caravanes. */
  nouvelle(): void {
    const plateau = new FabriquePlateauAleatoire().creer();
    const fabrique = new FabriqueCaravane();
    this.partie = Partie.getInstance();
    this.partie.initialiser({
      plateau,
      caravanes: { J1: fabrique.creer("J1"), J2: fabrique.creer("J2") },
      perceptions: { J1: new PerceptionProvisoire(plateau), J2: new PerceptionProvisoire(plateau) },
    });
    this.journal = [];
    this.noter(`Phase : ${this.partie.phase()} - ${Soleil.getInstance().getDescription()}`);
  }

  /** Exécute une commande tapée (« n », « sonder s », « boire », « fin »...). */
  commande(texte: string): Reponse {
    const messages: string[] = [];
    const joueur = this.partie.joueurCourant();
    const phaseAvant = this.partie.phase();
    const commande = analyserCommande(texte, joueur, this.partie);
    let ok = true;

    switch (commande.genre) {
      case "erreur":
        messages.push(commande.message);
        ok = false;
        break;
      case "aide":
      case "quitter":
        messages.push("Utilise les boutons : ce jeu se pilote à la souris ou au clavier.");
        ok = false;
        break;
      case "fin":
        try {
          this.finDeTour(messages);
        } catch (erreur) {
          ok = this.refuser(erreur, messages);
        }
        break;
      case "action":
        try {
          this.partie.executer(commande.action);
          messages.push(commande.action.description());
          if (commande.action instanceof Sonder && commande.action.rapport !== undefined) {
            messages.push(commande.action.rapport);
          }
          if (!this.partie.estTerminee() && this.partie.paRestants() === 0) {
            messages.push("Plus de points d'action : fin de ton tour.");
            this.finDeTour(messages);
          }
        } catch (erreur) {
          ok = this.refuser(erreur, messages);
        }
        break;
    }

    this.annoncerPhase(phaseAvant, messages);
    for (const message of messages) {
      if (ok) {
        this.noter(message);
      }
    }
    if (this.partie.estTerminee()) {
      this.noter(this.messageFinal());
    }
    return { ok, messages, etat: this.etat() };
  }

  /** L'état de la partie vu par le joueur courant (sa perception, pas la vérité). */
  etat(): EtatWeb {
    const { partie } = this;
    const joueur = partie.joueurCourant();
    const vue = partie.perception(joueur).vueActuelle();
    const grille: CaseVue[][] = [];
    for (let y = 0; y < partie.plateau.hauteur; y++) {
      const ligne: CaseVue[] = [];
      for (let x = 0; x < partie.plateau.largeur; x++) {
        ligne.push(vue.voir({ x, y }));
      }
      grille.push(ligne);
    }
    return {
      largeur: partie.plateau.largeur,
      hauteur: partie.plateau.hauteur,
      tour: partie.tour(),
      phase: partie.phase(),
      descriptionPhase: Soleil.getInstance().getDescription(),
      joueur,
      pa: partie.paRestants(),
      terminee: partie.estTerminee(),
      vainqueur: partie.vainqueur(),
      grille,
      caravanes: { J1: this.infos("J1"), J2: this.infos("J2") },
      journal: [...this.journal],
    };
  }

  private infos(joueur: IdJoueur): InfosCaravane {
    const caravane = this.partie.caravane(joueur);
    const { x, y } = caravane.getPosition();
    return {
      x,
      y,
      outres: caravane.outres(),
      cartes: caravane.cartes(),
      chameau: caravane.getEtatChameau(),
      enlisee: caravane.estEnlisee(),
    };
  }

  private finDeTour(messages: string[]): void {
    const avant = this.partie.joueurCourant();
    this.partie.finDeTourJoueur();
    if (!this.partie.estTerminee() && this.partie.joueurCourant() !== avant) {
      messages.push(`Au tour de ${this.partie.joueurCourant()}.`);
    }
  }

  private annoncerPhase(avant: NomPhase, messages: string[]): void {
    const phase = this.partie.phase();
    if (phase !== avant) {
      messages.push(`Phase : ${phase} - ${Soleil.getInstance().getDescription()}`);
    }
  }

  private refuser(erreur: unknown, messages: string[]): boolean {
    if (erreur instanceof ActionImpossible) {
      messages.push(erreur.message);
      return false;
    }
    throw erreur;
  }

  private messageFinal(): string {
    return this.partie.vainqueur() === "Egalite"
      ? "Fin de la partie : égalité, personne n'a traversé le lac à temps."
      : `Victoire de ${this.partie.vainqueur()} : sa caravane a traversé le lac !`;
  }

  private noter(message: string): void {
    this.journal.push(message);
    if (this.journal.length > TAILLE_JOURNAL) {
      this.journal.shift();
    }
  }
}
