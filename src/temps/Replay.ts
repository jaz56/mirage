import type { Partie, Vainqueur } from "./Partie";

const NOMS_PHASES = {
  Aube: "Aube",
  Matin: "Matin",
  Zenith: "Zénith",
  Crepuscule: "Crépuscule",
  Nuit: "Nuit",
} as const;

/** Phrase de conclusion de la partie. */
export function texteVainqueur(vainqueur: Vainqueur): string {
  return vainqueur === "Egalite"
    ? "Égalité : personne n'a traversé le lac à temps."
    : `Victoire de ${vainqueur} : sa caravane a traversé le lac !`;
}

/**
 * Le replay final : toutes les actions de la partie, manche par manche, avec la phase du Soleil.
 * Contrairement à l'affichage pendant la partie, il montre tout, y compris les cartes Mirage.
 */
export function formaterReplay(partie: Partie): string {
  const lignes: string[] = ["=== REPLAY DE LA PARTIE ==="];
  let tourPrecedent = 0;
  for (const entree of partie.replay()) {
    if (entree.tour !== tourPrecedent) {
      lignes.push(`-- Tour ${entree.tour} (${NOMS_PHASES[entree.phase]}) --`);
      tourPrecedent = entree.tour;
    }
    lignes.push(`  ${entree.texte}`);
  }
  if (partie.replay().length === 0) {
    lignes.push("  (aucune action jouée)");
  }
  const vainqueur = partie.vainqueur();
  if (vainqueur !== null) {
    lignes.push("", texteVainqueur(vainqueur));
  }
  return lignes.join("\n");
}
