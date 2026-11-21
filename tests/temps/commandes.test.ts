import { describe, expect, it } from "vitest";
import type { StrategieIA } from "../../src/contrats";
import { TOURS_PAR_PHASE } from "../../src/config/constantes";
import { Avancer, BoucleDeJeu, type OptionsBoucle } from "../../src/temps";
import { EntreeScript } from "./helpers/EntreeScript";
import { creerPartie } from "./helpers/monde";

const LAC_3x5 = ["...", "...", "...", "...", "..."];

async function lancer(
  script: readonly string[],
  lignes: readonly string[] = ["...", "...", "..."],
  strategies?: OptionsBoucle["strategies"],
) {
  const monde = creerPartie(lignes);
  const sortie: string[] = [];
  const affichages: string[] = [];
  const boucle = new BoucleDeJeu(monde.partie, {
    entree: new EntreeScript(script),
    sortie: (texte) => sortie.push(texte),
    afficher: (_etat, joueur) => affichages.push(joueur),
    strategies,
  });
  const resultat = await boucle.jouer();
  return { ...monde, resultat, sortie, affichages, texte: sortie.join("\n") };
}

describe("BoucleDeJeu", () => {
  it("J1 gagne en descendant : la partie s'arrête et annonce la victoire", async () => {
    const { resultat, texte } = await lancer(["s", "s"]);
    expect(resultat).toBe("J1");
    expect(texte).toContain("Victoire de J1");
  });

  it("« fin » passe la main à l'autre joueur", async () => {
    const { partie, resultat } = await lancer(["fin", "quitter"]);
    expect(resultat).toBe("Abandon");
    expect(partie.joueurCourant()).toBe("J2");
  });

  it("termine le tour automatiquement quand il ne reste plus de PA", async () => {
    const { partie, j1, texte } = await lancer(["s", "s", "s", "quitter"], LAC_3x5);
    expect(j1.getPosition()).toEqual({ x: 1, y: 3 });
    expect(partie.joueurCourant()).toBe("J2");
    expect(texte).toContain("Plus de points d'action");
  });

  it("affiche un message pour une commande inconnue, sans rien dépenser", async () => {
    const { partie, texte } = await lancer(["danser", "quitter"]);
    expect(texte).toMatch(/inconnue/i);
    expect(partie.paRestants()).toBe(3);
  });

  it("affiche l'aide", async () => {
    const { texte } = await lancer(["aide", "quitter"]);
    expect(texte).toContain("boire");
    expect(texte).toContain("mirage");
  });

  it("affiche le motif d'une action impossible sans perdre de PA", async () => {
    const { partie, texte } = await lancer(["n", "quitter"]);
    expect(texte).toContain("sortir du lac");
    expect(partie.paRestants()).toBe(3);
  });

  it("affiche le rapport d'une sonde", async () => {
    const { texte } = await lancer(["sonder ici", "quitter"]);
    expect(texte).toContain("terrain croute");
  });

  it("abandonne quand l'entrée est terminée", async () => {
    const { resultat } = await lancer([]);
    expect(resultat).toBe("Abandon");
  });

  it("annonce la nouvelle phase du Soleil", async () => {
    const passes = Array<string>(2 * TOURS_PAR_PHASE).fill("fin");
    const { texte } = await lancer([...passes, "quitter"]);
    expect(texte).toContain("Phase : Aube");
    expect(texte).toContain("Phase : Matin");
  });

  it("redessine le lac au début du tour puis après chaque action", async () => {
    const { affichages } = await lancer(["s", "boire", "quitter"]);
    expect(affichages.length).toBe(3);
    expect(new Set(affichages)).toEqual(new Set(["J1"]));
  });

  it("une IA joue à la place d'un joueur (patron Strategy)", async () => {
    const ia: StrategieIA = {
      choisirActions: (etat) => [new Avancer("J2", "N", etat), new Avancer("J2", "N", etat)],
    };
    const { j2, texte } = await lancer(["fin"], LAC_3x5, { J2: ia });
    expect(j2.getPosition()).toEqual({ x: 1, y: 2 });
    expect(texte).toContain("(IA)");
  });
});
