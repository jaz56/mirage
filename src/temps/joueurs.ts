import type { IdJoueur } from "../contrats";

export const JOUEURS: readonly IdJoueur[] = ["J1", "J2"];

export function adversaire(joueur: IdJoueur): IdJoueur {
  return joueur === "J1" ? "J2" : "J1";
}
