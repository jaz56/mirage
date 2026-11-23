import { beforeEach, describe, expect, it } from "vitest";
import { TOURS_PAR_PHASE } from "../../src/config/constantes";
import { Avancer, Boire, formaterReplay, Partie } from "../../src/temps";
import { creerPartie } from "./helpers/monde";

describe("Replay de fin de partie", () => {
  beforeEach(() => Partie.reinitialiserInstance());

  it("note chaque action avec son tour, sa phase et son joueur", () => {
    const { partie } = creerPartie();
    partie.executer(new Boire("J1", partie));
    partie.finDeTourJoueur();
    partie.executer(new Avancer("J2", "N", partie));

    expect(partie.replay()).toEqual([
      { tour: 1, phase: "Aube", joueur: "J1", texte: "J1 boit une outre" },
      { tour: 1, phase: "Aube", joueur: "J2", texte: "J2 avance vers le nord" },
    ]);
  });

  it("garde la phase du Soleil au moment de l'action", () => {
    const { partie } = creerPartie();
    for (let i = 0; i < TOURS_PAR_PHASE; i++) {
      partie.finDeTourJoueur();
      partie.finDeTourJoueur();
    }
    partie.executer(new Boire("J1", partie));
    expect(partie.replay()[0]).toMatchObject({ tour: TOURS_PAR_PHASE + 1, phase: "Matin" });
  });

  it("se vide quand on démarre une nouvelle partie", () => {
    const { partie } = creerPartie();
    partie.executer(new Boire("J1", partie));
    expect(creerPartie().partie.replay()).toEqual([]);
  });

  it("se met en forme, manche par manche, avec le vainqueur", () => {
    const { partie } = creerPartie();
    partie.executer(new Boire("J1", partie));
    partie.finDeTourJoueur();
    partie.executer(new Avancer("J2", "N", partie));
    const texte = formaterReplay(partie);
    expect(texte).toContain("REPLAY DE LA PARTIE");
    expect(texte).toContain("-- Tour 1 (Aube) --");
    expect(texte).toContain("J1 boit une outre");
    expect(texte).toContain("J2 avance vers le nord");
  });

  it("dit qu'il n'y a rien à rejouer quand aucune action n'a été jouée", () => {
    const { partie } = creerPartie();
    expect(formaterReplay(partie)).toContain("aucune action jouée");
  });
});
