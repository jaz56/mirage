import type { NomEtatSel, Position } from "../../../src/contrats";
import { Partie } from "../../../src/temps";
import { PerceptionTransparente } from "../../stubs/PerceptionTransparente";
import { CaravaneDeTest } from "./CaravaneDeTest";
import { PlateauDeTest } from "./PlateauDeTest";
import { EtatPartieFixe } from "./EtatPartieFixe";

export interface OptionsMonde {
  etats?: Record<string, NomEtatSel>;
  j1?: Position;
  j2?: Position;
  outres?: number;
  cartes?: number;
}

/** Un petit monde de test : J1 en haut au milieu, J2 en bas au milieu, perceptions transparentes. */
export function creerMonde(
  lignes: readonly string[] = ["...", "...", "..."],
  options: OptionsMonde = {},
) {
  const plateau = PlateauDeTest.depuis(lignes, options.etats);
  const milieu = Math.floor(lignes[0].length / 2);
  const reserves = { outres: options.outres, cartes: options.cartes };
  const j1 = new CaravaneDeTest("J1", options.j1 ?? { x: milieu, y: 0 }, reserves);
  const j2 = new CaravaneDeTest("J2", options.j2 ?? { x: milieu, y: lignes.length - 1 }, reserves);
  const p1 = new PerceptionTransparente(plateau);
  const p2 = new PerceptionTransparente(plateau);
  const etat = new EtatPartieFixe(plateau, { J1: j1, J2: j2 }, { J1: p1, J2: p2 });
  return { plateau, j1, j2, p1, p2, etat };
}

/** Comme creerMonde, mais avec la vraie Partie initialisée (Singleton remis à zéro). */
export function creerPartie(lignes?: readonly string[], options?: OptionsMonde) {
  const monde = creerMonde(lignes, options);
  Partie.reinitialiserInstance();
  const partie = Partie.getInstance();
  partie.initialiser({
    plateau: monde.plateau,
    caravanes: { J1: monde.j1, J2: monde.j2 },
    perceptions: { J1: monde.p1, J2: monde.p2 },
  });
  return { ...monde, partie };
}

/** Joue n manches complètes sans rien faire : chaque joueur termine son tour. */
export function passerLesTours(partie: Partie, manches: number): void {
  for (let i = 0; i < manches; i++) {
    partie.finDeTourJoueur();
    partie.finDeTourJoueur();
  }
}
