import type { NomTerrain } from "../../src/contrats";
import { Case, FabriqueTerrains, Plateau } from "../../src/lac";

const CODES: Record<string, NomTerrain> = {
  ".": "croute",
  "^": "dune",
  O: "oasis",
  X: "puits-sec",
};

/**
 * Stub du module lac/ : construit un plateau fixe depuis un tableau de chaînes.
 * Codes : "." croûte, "^" dune, "O" oasis, "X" puits sec. Toutes les cases démarrent en Solide.
 */
export const PlateauFixe = {
  depuis(lignes: readonly string[], terrains: FabriqueTerrains = new FabriqueTerrains()): Plateau {
    const grille = lignes.map((ligne, y) =>
      [...ligne].map((caractere, x) => {
        const nom = CODES[caractere];
        if (nom === undefined) {
          throw new Error(`Code de terrain inconnu "${caractere}" en (${x}, ${y})`);
        }
        return new Case({ x, y }, terrains.get(nom));
      }),
    );
    return new Plateau(grille);
  },
};
