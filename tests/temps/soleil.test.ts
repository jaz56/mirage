import { beforeEach, describe, expect, it } from "vitest";
import { PA_PAR_TOUR, TOURS_MAX, TOURS_PAR_PHASE } from "../../src/config/constantes";
import { ActionImpossible, Avancer, Boire, JouerMirage, Partie } from "../../src/temps";
import { creerPartie, passerLesTours } from "./helpers/monde";

describe("Partie (Singleton)", () => {
  beforeEach(() => Partie.reinitialiserInstance());

  it("est un Singleton : toujours la même instance", () => {
    expect(Partie.getInstance()).toBe(Partie.getInstance());
  });

  it("refuse d'être lue avant initialiser()", () => {
    expect(() => Partie.getInstance().plateau).toThrow(/initialis/);
  });

  it("démarre au tour 1, à l'Aube, avec J1 et tous ses PA", () => {
    const { partie } = creerPartie();
    expect(partie.tour()).toBe(1);
    expect(partie.phase()).toBe("Aube");
    expect(partie.joueurCourant()).toBe("J1");
    expect(partie.paRestants()).toBe(PA_PAR_TOUR);
    expect(partie.estTerminee()).toBe(false);
    expect(partie.vainqueur()).toBeNull();
  });

  it("donne accès au plateau, aux caravanes et aux perceptions", () => {
    const { partie, plateau, j1, j2, p1, p2 } = creerPartie();
    expect(partie.plateau).toBe(plateau);
    expect(partie.caravane("J1")).toBe(j1);
    expect(partie.caravane("J2")).toBe(j2);
    expect(partie.perception("J1")).toBe(p1);
    expect(partie.perception("J2")).toBe(p2);
  });
});

describe("Partie : points d'action et tours", () => {
  it("une action déduit son coût des PA", () => {
    const { partie } = creerPartie();
    partie.executer(new Avancer("J1", "S", partie));
    expect(partie.paRestants()).toBe(PA_PAR_TOUR - 1);
  });

  it("refuse l'action de l'autre joueur", () => {
    const { partie } = creerPartie();
    expect(() => partie.executer(new Avancer("J2", "N", partie))).toThrow(/pas le tour/);
  });

  it("refuse une action trop chère sans rien dépenser", () => {
    const { partie } = creerPartie(["...", "...", "..."]);
    partie.executer(new JouerMirage("J1", "FausseOasis", { x: 0, y: 0 }, partie)); // coûte 2
    const restants = partie.paRestants();
    expect(() =>
      partie.executer(new JouerMirage("J1", "DuneFantome", { x: 1, y: 1 }, partie)),
    ).toThrow(/points d'action/);
    expect(partie.paRestants()).toBe(restants);
    expect(partie.journal()).toHaveLength(1);
  });

  it("une action impossible ne coûte aucun PA", () => {
    const { partie } = creerPartie();
    expect(() => partie.executer(new Avancer("J1", "N", partie))).toThrow(ActionImpossible);
    expect(partie.paRestants()).toBe(PA_PAR_TOUR);
    expect(partie.journal()).toHaveLength(0);
  });

  it("finDeTourJoueur passe la main à J2 avec tous ses PA, puis revient à J1 au tour suivant", () => {
    const { partie } = creerPartie();
    partie.executer(new Boire("J1", partie));
    partie.finDeTourJoueur();
    expect(partie.joueurCourant()).toBe("J2");
    expect(partie.paRestants()).toBe(PA_PAR_TOUR);
    expect(partie.tour()).toBe(1);
    partie.finDeTourJoueur();
    expect(partie.joueurCourant()).toBe("J1");
    expect(partie.paRestants()).toBe(PA_PAR_TOUR);
    expect(partie.tour()).toBe(2);
  });

  it("garde un journal des actions dans l'ordre", () => {
    const { partie } = creerPartie();
    partie.executer(new Avancer("J1", "S", partie));
    partie.executer(new Boire("J1", partie));
    expect(partie.journal()).toHaveLength(2);
    expect(partie.journal()[0]).toContain("avance");
    expect(partie.journal()[1]).toContain("boit");
  });
});

describe("Partie : le Soleil", () => {
  it("avance toutes les TOURS_PAR_PHASE manches", () => {
    const { partie } = creerPartie();
    passerLesTours(partie, TOURS_PAR_PHASE - 1);
    expect(partie.phase()).toBe("Aube");
    passerLesTours(partie, 1);
    expect(partie.phase()).toBe("Matin");
  });

  it("prévient les cases, les caravanes et les perceptions", () => {
    const { partie, plateau, j1, j2, p1, p2 } = creerPartie();
    passerLesTours(partie, TOURS_PAR_PHASE);
    expect(j1.phasesRecues).toEqual(["Matin"]);
    expect(j2.phasesRecues).toEqual(["Matin"]);
    expect(p1.phasesRecues).toEqual(["Matin"]);
    expect(p2.phasesRecues).toEqual(["Matin"]);
    for (const c of plateau.toutes()) {
      expect(plateau.caseDeTest(c.position).phasesRecues).toEqual(["Matin"]);
    }
  });

  it("prévient les perceptions de la fin de chaque manche", () => {
    const { partie, p1, p2 } = creerPartie();
    passerLesTours(partie, 3);
    expect(p1.finsDeTour).toBe(3);
    expect(p2.finsDeTour).toBe(3);
  });

  it("une nouvelle partie repart de l'Aube", () => {
    const { partie } = creerPartie();
    passerLesTours(partie, TOURS_PAR_PHASE);
    expect(partie.phase()).toBe("Matin");
    const suivante = creerPartie();
    expect(suivante.partie.phase()).toBe("Aube");
  });
});

describe("Partie : fin du jeu", () => {
  it("J1 gagne en atteignant la dernière ligne", () => {
    const { partie } = creerPartie();
    partie.executer(new Avancer("J1", "S", partie));
    expect(partie.estTerminee()).toBe(false);
    partie.executer(new Avancer("J1", "S", partie));
    expect(partie.estTerminee()).toBe(true);
    expect(partie.vainqueur()).toBe("J1");
  });

  it("J2 gagne en atteignant la première ligne", () => {
    const { partie } = creerPartie();
    partie.finDeTourJoueur();
    partie.executer(new Avancer("J2", "N", partie));
    partie.executer(new Avancer("J2", "N", partie));
    expect(partie.vainqueur()).toBe("J2");
  });

  it("plus aucune action n'est acceptée après la fin", () => {
    const { partie } = creerPartie();
    partie.executer(new Avancer("J1", "S", partie));
    partie.executer(new Avancer("J1", "S", partie));
    expect(() => partie.executer(new Boire("J1", partie))).toThrow(/terminée/);
    expect(() => partie.finDeTourJoueur()).toThrow(/terminée/);
  });

  it("égalité à la manche TOURS_MAX", () => {
    const { partie } = creerPartie();
    passerLesTours(partie, TOURS_MAX - 1);
    expect(partie.estTerminee()).toBe(false);
    passerLesTours(partie, 1);
    expect(partie.estTerminee()).toBe(true);
    expect(partie.vainqueur()).toBe("Egalite");
    expect(partie.tour()).toBe(TOURS_MAX);
  });
});
