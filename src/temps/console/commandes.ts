import type { Action, EtatPartie, IdJoueur, NomCarte } from "../../contrats";
import { Avancer } from "../actions/Avancer";
import { Boire } from "../actions/Boire";
import { COUT_BALISE, COUT_BOIRE, COUT_MIRAGE, COUT_SONDER } from "../actions/couts";
import type { Direction } from "../actions/directions";
import { JouerMirage } from "../actions/JouerMirage";
import { PoserBalise } from "../actions/PoserBalise";
import { Sonder } from "../actions/Sonder";

export type Commande =
  | { readonly genre: "action"; readonly action: Action }
  | { readonly genre: "fin" }
  | { readonly genre: "aide" }
  | { readonly genre: "quitter" }
  | { readonly genre: "erreur"; readonly message: string };

export const AIDE = [
  "Commandes :",
  "  n / s / e / o            avancer vers le nord, le sud, l'est ou l'ouest",
  `  sonder [n|s|e|o|ici]     révéler le vrai terrain et l'état du sel (${COUT_SONDER} PA)`,
  `  balise                   poser une balise sur ta case (${COUT_BALISE} PA)`,
  `  boire                    boire une outre (${COUT_BOIRE} PA)`,
  `  mirage <carte> <x> <y>   jouer une carte contre l'adversaire (${COUT_MIRAGE} PA)`,
  "                           cartes : FausseOasis, DuneFantome, SelTrompeur",
  "  fin                      terminer ton tour",
  "  aide                     afficher cette aide",
  "  quitter                  abandonner la partie",
].join("\n");

const DIRECTIONS = new Map<string, Direction>([
  ["n", "N"],
  ["nord", "N"],
  ["s", "S"],
  ["sud", "S"],
  ["e", "E"],
  ["est", "E"],
  ["o", "O"],
  ["ouest", "O"],
]);

const CARTES = new Map<string, NomCarte>([
  ["fausseoasis", "FausseOasis"],
  ["dunefantome", "DuneFantome"],
  ["seltrompeur", "SelTrompeur"],
]);

function erreur(message: string): Commande {
  return { genre: "erreur", message };
}

function action(a: Action): Commande {
  return { genre: "action", action: a };
}

/** Transforme une ligne tapée par le joueur en commande. Ne touche pas à la partie. */
export function analyserCommande(texte: string, joueur: IdJoueur, etat: EtatPartie): Commande {
  const mots = texte
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((mot) => mot.length > 0);
  if (mots.length === 0) {
    return erreur("Commande vide. Tape « aide » pour la liste des commandes.");
  }

  const [verbe, ...arguments_] = mots;

  const directionSeule = DIRECTIONS.get(verbe);
  if (directionSeule !== undefined) {
    return action(new Avancer(joueur, directionSeule, etat));
  }

  switch (verbe) {
    case "avancer": {
      const direction = DIRECTIONS.get(arguments_[0] ?? "");
      return direction === undefined
        ? erreur("Avancer vers où ? Utilise n, s, e ou o.")
        : action(new Avancer(joueur, direction, etat));
    }
    case "sonder": {
      const demande = arguments_[0] ?? "ici";
      if (demande === "ici") {
        return action(new Sonder(joueur, "ici", etat));
      }
      const direction = DIRECTIONS.get(demande);
      return direction === undefined
        ? erreur("Sonder où ? Utilise n, s, e, o ou ici.")
        : action(new Sonder(joueur, direction, etat));
    }
    case "balise":
      return action(new PoserBalise(joueur, etat));
    case "boire":
      return action(new Boire(joueur, etat));
    case "mirage": {
      const carte = CARTES.get(arguments_[0] ?? "");
      if (carte === undefined) {
        return erreur("Carte inconnue. Cartes : FausseOasis, DuneFantome, SelTrompeur.");
      }
      const x = Number(arguments_[1]);
      const y = Number(arguments_[2]);
      if (arguments_.length < 3 || !Number.isInteger(x) || !Number.isInteger(y)) {
        return erreur("Il faut deux coordonnées entières : mirage <carte> <x> <y>.");
      }
      return action(new JouerMirage(joueur, carte, { x, y }, etat));
    }
    case "fin":
      return { genre: "fin" };
    case "aide":
      return { genre: "aide" };
    case "quitter":
      return { genre: "quitter" };
    default:
      return erreur(`Commande inconnue « ${texte.trim()} ». Tape « aide » pour la liste.`);
  }
}
