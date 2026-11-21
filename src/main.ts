// Seul fichier qui assemble les modules. Il crée les objets et les injecte dans la partie.
import type { EtatPartie, IdJoueur, NomTerrain } from "./contrats";
import { FabriqueCaravane, FabriquePlateauAleatoire } from "./lac";
import { PerceptionProvisoire } from "./perceptionProvisoire";
import { AIDE, BoucleDeJeu, Clavier, Partie } from "./temps";

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

async function main(): Promise<void> {
  const plateau = new FabriquePlateauAleatoire().creer();
  const fabrique = new FabriqueCaravane();
  const partie = Partie.getInstance();
  partie.initialiser({
    plateau,
    caravanes: { J1: fabrique.creer("J1"), J2: fabrique.creer("J2") },
    perceptions: { J1: new PerceptionProvisoire(plateau), J2: new PerceptionProvisoire(plateau) },
  });

  console.log("MIRAGE : traverse le lac de sel avant ton adversaire.");
  console.log("J1 part du haut et va vers le bas, J2 part du bas et va vers le haut.\n");
  console.log(AIDE);

  const clavier = new Clavier();
  try {
    await new BoucleDeJeu(partie, {
      entree: clavier,
      sortie: (texte) => console.log(texte),
      afficher,
    }).jouer();
  } finally {
    clavier.fermer();
  }
}

main().catch((erreur: unknown) => {
  console.error(erreur);
  process.exitCode = 1;
});
