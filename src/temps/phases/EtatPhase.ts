import type { NomPhase } from "../../contrats";
import { Aube } from "./Aube";
import { Crepuscule } from "./Crepuscule";
import { Matin } from "./Matin";
import { Nuit } from "./Nuit";
import { Zenith } from "./Zenith";

/** Patron State : chaque phase du Soleil sait quelle phase la suit et se décrit. */
export interface EtatPhase {
  readonly nom: NomPhase;
  readonly description: string;
  /** Nom de la phase suivante dans le cycle du jour. */
  suivante(): NomPhase;
}

export function creerEtatPhase(nom: NomPhase): EtatPhase {
  switch (nom) {
    case "Aube":
      return new Aube();
    case "Matin":
      return new Matin();
    case "Zenith":
      return new Zenith();
    case "Crepuscule":
      return new Crepuscule();
    case "Nuit":
      return new Nuit();
  }
}
