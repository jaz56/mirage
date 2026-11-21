import { beforeEach, describe, expect, it } from "vitest";
import { HAUTEUR, LARGEUR, TOURS_MAX } from "../../src/config/constantes";
import { FabriqueCaravane } from "../../src/lac";
import { BoucleDeJeu, Partie } from "../../src/temps";
import { PerceptionTransparente } from "../stubs/PerceptionTransparente";
import { PlateauFixe } from "../stubs/PlateauFixe";
import { EntreeScript } from "../temps/helpers/EntreeScript";

/**
 * Intégration : le vrai module lac/ et le vrai module temps/ ensemble, avec une perception
 * factice à la place de celle de Nour.
 */
function monter() {
  const plateau = PlateauFixe.depuis(Array<string>(HAUTEUR).fill(".".repeat(LARGEUR)));
  const fabrique = new FabriqueCaravane();
  const caravanes = { J1: fabrique.creer("J1"), J2: fabrique.creer("J2") };
  const perceptions = {
    J1: new PerceptionTransparente(plateau),
    J2: new PerceptionTransparente(plateau),
  };
  Partie.reinitialiserInstance();
  const partie = Partie.getInstance();
  partie.initialiser({ plateau, caravanes, perceptions });
  return { plateau, caravanes, perceptions, partie };
}

async function jouer(partie: Partie, script: readonly string[]) {
  const sortie: string[] = [];
  const resultat = await new BoucleDeJeu(partie, {
    entree: new EntreeScript(script),
    sortie: (texte) => sortie.push(texte),
    afficher: () => {},
  }).jouer();
  return { resultat, texte: sortie.join("\n") };
}

describe("Partie complète : lac/ + temps/", () => {
  beforeEach(() => Partie.reinitialiserInstance());

  it("J1 traverse tout le lac en 4 tours et gagne", async () => {
    const { partie, caravanes } = monter();
    // 12 pas vers le sud, 3 PA par tour : 3 pas puis J2 passe, et ainsi de suite.
    const script = [
      ...["s", "s", "s", "fin"],
      ...["s", "s", "s", "fin"],
      ...["s", "s", "s", "fin"],
      ...["s", "s", "s"],
    ];
    const { resultat, texte } = await jouer(partie, script);
    expect(resultat).toBe("J1");
    expect(texte).toContain("Victoire de J1");
    expect(caravanes.J1.getPosition()).toEqual({ x: Math.floor(LARGEUR / 2), y: HAUTEUR - 1 });
    expect(partie.tour()).toBe(4);
    expect(partie.phase()).toBe("Matin");
    expect(partie.journal()).toHaveLength(12);
  });

  it("personne ne bouge : égalité après TOURS_MAX tours, le Soleil a fait 4 jours", async () => {
    const { partie, plateau, caravanes } = monter();
    const { resultat } = await jouer(partie, Array<string>(2 * TOURS_MAX).fill("fin"));
    expect(resultat).toBe("Egalite");
    expect(partie.tour()).toBe(TOURS_MAX);
    // 20 phases = 4 jours complets : le Soleil est revenu à l'Aube, le sel est dur.
    expect(partie.phase()).toBe("Aube");
    expect(plateau.toutes().every((c) => c.getEtat() === "Solide")).toBe(true);
    // Sans boire pendant tout ce temps, les chameaux ont soif.
    expect(caravanes.J1.getEtatChameau()).toBe("Assoiffe");
    expect(caravanes.J2.getEtatChameau()).toBe("Assoiffe");
  });

  it("le sel change au fil des phases pendant la partie", async () => {
    const { partie, plateau } = monter();
    const etatDuMilieu = () => plateau.get({ x: 4, y: 6 })?.getEtat();
    // Après 2 manches : Matin (Solide). Après 4 : Zénith (Craquelé). Après 6 : Crépuscule (Boue).
    const attendus = ["Solide", "Craquelee", "Boue"];
    const observes: Array<string | undefined> = [];
    for (let i = 0; i < attendus.length; i++) {
      for (let manche = 0; manche < 2; manche++) {
        partie.finDeTourJoueur();
        partie.finDeTourJoueur();
      }
      observes.push(etatDuMilieu());
    }
    expect(observes).toEqual(attendus);
  });

  it("une carte Mirage est envoyée à l'adversaire et consomme une carte de la vraie caravane", async () => {
    const { partie, caravanes, perceptions } = monter();
    const cartesAvant = caravanes.J1.cartes();
    const { resultat } = await jouer(partie, ["mirage FausseOasis 3 3", "quitter"]);
    expect(resultat).toBe("Abandon");
    expect(perceptions.J2.cartesRecues).toEqual([{ carte: "FausseOasis", cible: { x: 3, y: 3 } }]);
    expect(perceptions.J1.cartesRecues).toEqual([]);
    expect(caravanes.J1.cartes()).toBe(cartesAvant - 1);
    expect(partie.paRestants()).toBe(1);
  });

  it("boire consomme une outre de la vraie caravane", async () => {
    const { partie, caravanes } = monter();
    const avant = caravanes.J1.outres();
    await jouer(partie, ["boire", "quitter"]);
    expect(caravanes.J1.outres()).toBe(avant - 1);
  });

  it("la boue enlise la vraie caravane qui la traverse, jusqu'à la phase suivante", async () => {
    const { partie, plateau, caravanes } = monter();
    // On fait passer le Soleil jusqu'au crépuscule : toutes les cases deviennent de la boue.
    for (let manche = 0; manche < 6; manche++) {
      partie.finDeTourJoueur();
      partie.finDeTourJoueur();
    }
    expect(plateau.get({ x: 4, y: 1 })?.getEtat()).toBe("Boue");
    await jouer(partie, ["s", "s", "quitter"]);
    // Le premier pas arrive dans la boue : la caravane s'enlise et le second pas est refusé.
    expect(caravanes.J1.estEnlisee()).toBe(true);
    expect(caravanes.J1.getPosition()).toEqual({ x: Math.floor(LARGEUR / 2), y: 1 });
  });
});
