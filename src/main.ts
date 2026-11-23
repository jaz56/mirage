// Point d'entrée de la console : l'assemblage des modules est fait par assemblage.ts.
import type { EtatPartie, IdJoueur, NomTerrain } from "./contrats";
import { assemblerPartie, type Adversaire } from "./assemblage";
import { AIDE, BoucleDeJeu, Clavier } from "./temps";

const SYMBOLES: Record<NomTerrain, string> = {
  croute: ".",
  dune: "^",
  oasis: "O",
  "puits-sec": "X",
};

function afficher(etat: EtatPartie, joueur: IdJoueur): void {
  const vue = etat.perception(joueur).vueActuelle();
  const p1 = etat.caravane("J1").getPosition();
  const p2 = etat.caravane("J2").getPosition();
  const lignes: string[] = [];
  for (let y = 0; y < etat.plateau.hauteur; y++) {
    let ligne = "";
    for (let x = 0; x < etat.plateau.largeur; x++) {
      const case_ = vue.voir({ x, y });
      let symbole = case_.terrain === "?" ? "?" : SYMBOLES[case_.terrain];
      if (case_.balise) {
        symbole = "!";
      }
      if (x === p1.x && y === p1.y) {
        symbole = "1";
      }
      if (x === p2.x && y === p2.y) {
        symbole = "2";
      }
      ligne += `${symbole} `;
    }
    lignes.push(ligne);
  }
  const caravane = etat.caravane(joueur);
  console.log(lignes.join("\n"));
  console.log(". croûte  ^ dune  O oasis  X puits sec  ! balise  1 / 2 caravanes");
  console.log(
    `${joueur} : outres ${caravane.outres()} | cartes ${caravane.cartes()} | ` +
      `chameau ${caravane.getEtatChameau()}${caravane.estEnlisee() ? " | ENLISÉE" : ""}`,
  );
}
// ---------------------------------------------------------------------------------------

const CHOIX_ADVERSAIRE: Record<string, Adversaire> = {
  "1": "humain",
  "2": "prudente",
  "3": "bluffeuse",
};

async function choisirAdversaire(clavier: Clavier): Promise<Adversaire | undefined> {
  console.log("Contre qui joues-tu ?");
  console.log("  1  un autre joueur (même clavier)");
  console.log("  2  l'ordinateur prudent");
  console.log("  3  l'ordinateur bluffeur");
  for (;;) {
    const reponse = await clavier.lire("Ton choix (1-3) > ");
    if (reponse === undefined) {
      return undefined;
    }
    const choix = CHOIX_ADVERSAIRE[reponse.trim()];
    if (choix !== undefined) {
      return choix;
    }
    console.log("Tape 1, 2 ou 3.");
  }
}

async function main(): Promise<void> {
  const clavier = new Clavier();
  try {
    console.log("MIRAGE : traverse le lac de sel avant ton adversaire.");
    console.log("J1 part du haut et va vers le bas, J2 part du bas et va vers le haut.\n");
    const adversaire = await choisirAdversaire(clavier);
    if (adversaire === undefined) {
      return;
    }
    const { partie, strategies } = assemblerPartie(adversaire);
    console.log(`\n${AIDE}`);
    await new BoucleDeJeu(partie, {
      entree: clavier,
      sortie: (texte) => console.log(texte),
      afficher,
      strategies,
    }).jouer();
  } finally {
    clavier.fermer();
  }
}

main().catch((erreur: unknown) => {
  console.error(erreur);
  process.exitCode = 1;
});
