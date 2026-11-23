// Assemblage des trois modules (lac, perception, temps) : crée les objets et les injecte dans
// la partie. Utilisé par la console (main.ts) et par l'interface graphique (web/).
import type { IdJoueur, StrategieIA } from "./contrats";
import { FabriqueCaravane, FabriquePlateauAleatoire } from "./lac";
import { Bluffeuse, Perception, Prudente } from "./perception";
import { FabriqueActionsJeu, Partie } from "./temps";

/** Contre qui joue J1 : un humain sur le même écran, ou l'ordinateur (patron Strategy). */
export type Adversaire = "humain" | "prudente" | "bluffeuse";

export const ADVERSAIRES: readonly Adversaire[] = ["humain", "prudente", "bluffeuse"];

export interface PartieAssemblee {
  readonly partie: Partie;
  /** Les joueurs pilotés par l'ordinateur (vide si deux humains). */
  readonly strategies: Partial<Record<IdJoueur, StrategieIA>>;
}

/** Démarre une nouvelle partie avec un lac aléatoire et la vraie perception de chaque joueur. */
export function assemblerPartie(adversaire: Adversaire = "humain"): PartieAssemblee {
  const plateau = new FabriquePlateauAleatoire().creer();
  const fabrique = new FabriqueCaravane();
  const caravanes = { J1: fabrique.creer("J1"), J2: fabrique.creer("J2") };
  const partie = Partie.getInstance();
  partie.initialiser({
    plateau,
    caravanes,
    perceptions: {
      J1: new Perception(plateau, caravanes.J1),
      J2: new Perception(plateau, caravanes.J2),
    },
  });

  const actions = new FabriqueActionsJeu(partie);
  switch (adversaire) {
    case "prudente":
      return { partie, strategies: { J2: new Prudente("J2", actions) } };
    case "bluffeuse":
      return { partie, strategies: { J2: new Bluffeuse("J2", actions) } };
    case "humain":
      return { partie, strategies: {} };
  }
}

/** Partie à deux joueurs humains. */
export function demarrerPartie(): Partie {
  return assemblerPartie("humain").partie;
}
