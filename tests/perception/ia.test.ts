import { beforeEach, describe, expect, it } from "vitest";
import { HAUTEUR, LARGEUR, PA_PAR_TOUR, TOURS_MAX } from "../../src/config/constantes";
import type { IdJoueur, StrategieIA } from "../../src/contrats";
import { FabriqueCaravane } from "../../src/lac";
import { Bluffeuse, Prudente } from "../../src/perception";
import { BoucleDeJeu, FabriqueActionsJeu, jouerTourIA, Partie } from "../../src/temps";
import { demarrerPartie } from "../../src/assemblage";
import { PerceptionTransparente } from "../stubs/PerceptionTransparente";
import { PlateauFixe } from "../stubs/PlateauFixe";
import { EntreeScript } from "../temps/helpers/EntreeScript";

/** Une partie sur un lac fixe, sans déformation : l'IA voit exactement le lac. */
function monter(lignes: readonly string[] = Array<string>(HAUTEUR).fill(".".repeat(LARGEUR))) {
  const plateau = PlateauFixe.depuis(lignes);
  const fabrique = new FabriqueCaravane();
  const caravanes = { J1: fabrique.creer("J1"), J2: fabrique.creer("J2") };
  Partie.reinitialiserInstance();
  const partie = Partie.getInstance();
  partie.initialiser({
    plateau,
    caravanes,
    perceptions: {
      J1: new PerceptionTransparente(plateau),
      J2: new PerceptionTransparente(plateau),
    },
  });
  return { partie, caravanes, actions: new FabriqueActionsJeu(partie) };
}

function tour(partie: Partie, joueur: IdJoueur, strategie: StrategieIA): string[] {
  const sortie: string[] = [];
  jouerTourIA(partie, joueur, strategie, (t) => sortie.push(t));
  return sortie;
}

describe("FabriqueActionsJeu", () => {
  beforeEach(() => Partie.reinitialiserInstance());

  it("prépare plusieurs pas à l'avance et facture chacun au bon coût", () => {
    // Départ de J1 en (4, 0) ; la rangée 1 est faite de dunes (coût 2), la rangée 2 de croûte.
    const lignes = Array<string>(HAUTEUR).fill(".".repeat(LARGEUR));
    lignes[1] = "^".repeat(LARGEUR);
    const { partie, actions } = monter(lignes);
    const plan = [actions.avancer("J1", "S"), actions.avancer("J1", "S")];
    partie.executer(plan[0]);
    expect(partie.paRestants()).toBe(PA_PAR_TOUR - 2); // dune : 2 PA
    partie.executer(plan[1]);
    expect(partie.paRestants()).toBe(PA_PAR_TOUR - 3); // croûte : 1 PA
  });
});

describe("Prudente", () => {
  beforeEach(() => Partie.reinitialiserInstance());

  it("avance vers l'autre rive", () => {
    const { partie, caravanes, actions } = monter();
    tour(partie, "J1", new Prudente("J1", actions));
    expect(caravanes.J1.getPosition().y).toBe(PA_PAR_TOUR);
    expect(partie.joueurCourant()).toBe("J2");
  });

  it("contourne un puits sec qui lui barre la route", () => {
    const lignes = Array<string>(HAUTEUR).fill(".".repeat(LARGEUR));
    const milieu = Math.floor(LARGEUR / 2);
    lignes[1] = lignes[1].slice(0, milieu) + "X" + lignes[1].slice(milieu + 1);
    const { partie, caravanes, actions } = monter(lignes);
    const sortie = tour(partie, "J1", new Prudente("J1", actions));
    expect(sortie.join("\n")).not.toContain("refusée");
    expect(caravanes.J1.getPosition()).not.toEqual({ x: milieu, y: 1 });
    expect(caravanes.J1.getPosition().y).toBeGreaterThan(0);
  });

  it("boit d'abord quand son chameau est assoiffé", () => {
    const { partie, caravanes, actions } = monter();
    for (let i = 0; i < 6 && caravanes.J1.getEtatChameau() !== "Assoiffe"; i++) {
      caravanes.J1.surPhase("Matin");
    }
    expect(caravanes.J1.getEtatChameau()).toBe("Assoiffe");
    const plan = new Prudente("J1", actions).choisirActions(partie, PA_PAR_TOUR);
    expect(plan[0].description()).toContain("boit");
  });

  it("ne fait rien quand sa caravane est enlisée", () => {
    const { partie, caravanes, actions } = monter();
    caravanes.J1.enliser();
    expect(new Prudente("J1", actions).choisirActions(partie, PA_PAR_TOUR)).toEqual([]);
  });

  it("ne joue jamais de carte Mirage", () => {
    const { partie, actions } = monter();
    const plan = new Prudente("J1", actions).choisirActions(partie, PA_PAR_TOUR);
    expect(plan.map((a) => a.description()).join(" ")).not.toContain("carte");
  });
});

describe("Bluffeuse", () => {
  beforeEach(() => Partie.reinitialiserInstance());

  function passerLaManche(partie: Partie): void {
    partie.finDeTourJoueur();
    partie.finDeTourJoueur();
  }

  it("bluffe un tour sur deux avec une carte Mirage, et garde un PA pour avancer", () => {
    const { partie, caravanes, actions } = monter();
    const ia = new Bluffeuse("J1", actions);
    // Tour 1 (impair) : elle avance seulement.
    const tourUn = ia.choisirActions(partie, PA_PAR_TOUR).map((a) => a.description());
    expect(tourUn.join(" ")).not.toContain("carte");
    passerLaManche(partie);
    expect(partie.tour()).toBe(2);
    const sortie = tour(partie, "J1", ia);
    expect(sortie.some((ligne) => ligne.includes("carte"))).toBe(true);
    expect(sortie.join("\n")).not.toContain("refusée");
    expect(caravanes.J1.cartes()).toBe(2);
    expect(caravanes.J1.getPosition().y).toBeGreaterThanOrEqual(1);
  });

  it("n'a plus de bluff quand elle n'a plus de carte", () => {
    const { partie, caravanes, actions } = monter();
    while (caravanes.J1.utiliserCarte()) {
      // vide la main
    }
    passerLaManche(partie);
    const plan = new Bluffeuse("J1", actions).choisirActions(partie, PA_PAR_TOUR);
    expect(plan.map((a) => a.description()).join(" ")).not.toContain("carte");
  });
});

describe("IA contre IA, avec les vrais modules et le brouillard", () => {
  beforeEach(() => Partie.reinitialiserInstance());

  it("une partie va toujours à son terme, et la plupart ont un vainqueur", async () => {
    let avecVainqueur = 0;
    for (let i = 0; i < 8; i++) {
      Partie.reinitialiserInstance();
      const partie = demarrerPartie();
      const actions = new FabriqueActionsJeu(partie);
      const sortie: string[] = [];
      const resultat = await new BoucleDeJeu(partie, {
        entree: new EntreeScript([]),
        sortie: (texte) => sortie.push(texte),
        afficher: () => {},
        strategies: {
          J1: new Prudente("J1", actions),
          J2: new Bluffeuse("J2", actions),
        },
      }).jouer();
      expect(partie.estTerminee()).toBe(true);
      expect(partie.tour()).toBeLessThanOrEqual(TOURS_MAX);
      expect(sortie.join("\n")).toContain("REPLAY DE LA PARTIE");
      if (resultat === "J1" || resultat === "J2") {
        avecVainqueur += 1;
      }
    }
    expect(avecVainqueur).toBeGreaterThanOrEqual(4);
  });
});
