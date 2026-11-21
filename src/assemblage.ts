// Assemblage des trois modules (lac, perception, temps) : crée les objets et les injecte dans
// la partie. Utilisé par la console (main.ts) et par l'interface graphique (web/).
import { FabriqueCaravane, FabriquePlateauAleatoire } from "./lac";
import { Perception } from "./perception";
import { Partie } from "./temps";

/** Démarre une nouvelle partie avec un lac aléatoire et la vraie perception de chaque joueur. */
export function demarrerPartie(): Partie {
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
  return partie;
}
