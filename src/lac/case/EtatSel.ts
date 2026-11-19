import type { CaravaneJeu, NomEtatSel, NomPhase } from "../../contrats";
import { Boue } from "./Boue";
import { Craquelee } from "./Craquelee";
import { CrouteFragile } from "./CrouteFragile";
import { Solide } from "./Solide";

/** Patron State : l'état du sel décide de la suite et de l'effet d'un passage. */
export interface EtatSel{
    readonly nom:NomEtatSel;
    /** Nom de l'état après l'arrivée d'une phase du Soleil (le même nom = on ne change pas). */
    suivant(phase:NomPhase):NomEtatSel;
    /** Effet sur une caravane qui traverse la case. */
    traverser(caravane:CaravaneJeu):void;
}

export function creerEtatSel(nom: NomEtatSel): EtatSel {
  switch (nom) {
    case "Solide":
      return new Solide();
    case "Craquelee":
      return new Craquelee() as EtatSel;
    case "Boue":
      return new Boue();
    case "CrouteFragile":
      return new CrouteFragile();
    default:
      throw new Error(`État de sel inconnu : ${nom}`);
  }
}