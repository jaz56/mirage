import { describe, expect, it } from "vitest";
import { PA_PAR_TOUR } from "../../src/config/constantes";
import { SessionJeu } from "../../src/web/SessionJeu";

describe("SessionJeu (interface graphique)", () => {
  it("démarre au tour 1, J1 avec tous ses points d'action", () => {
    const etat = new SessionJeu().etat();
    expect(etat.joueur).toBe("J1");
    expect(etat.pa).toBe(PA_PAR_TOUR);
    expect(etat.grille).toHaveLength(etat.hauteur);
    expect(etat.grille[0]).toHaveLength(etat.largeur);
    expect(etat.terminee).toBe(false);
  });

  it("refuse une commande inconnue sans coûter de PA", () => {
    const session = new SessionJeu();
    const reponse = session.commande("danser");
    expect(reponse.ok).toBe(false);
    expect(reponse.messages.length).toBeGreaterThan(0);
    expect(reponse.etat.pa).toBe(PA_PAR_TOUR);
  });

  it("boire consomme une outre et un PA", () => {
    const session = new SessionJeu();
    const avant = session.etat().caravanes.J1.outres;
    const reponse = session.commande("boire");
    expect(reponse.ok).toBe(true);
    expect(reponse.etat.caravanes.J1.outres).toBe(avant - 1);
    expect(reponse.etat.pa).toBe(PA_PAR_TOUR - 1);
  });

  it("passe la main à J2 à la fin du tour, puis rend le tour à J1", () => {
    const session = new SessionJeu();
    expect(session.commande("fin").etat.joueur).toBe("J2");
    const retour = session.commande("fin").etat;
    expect(retour.joueur).toBe("J1");
    expect(retour.tour).toBe(2);
  });

  it("enchaîne tout seul sur J2 quand les PA sont épuisés", () => {
    const session = new SessionJeu();
    for (let i = 0; i < PA_PAR_TOUR; i++) {
      session.commande("sonder ici");
    }
    expect(session.etat().joueur).toBe("J2");
  });

  it("ne révèle pas la caravane adverse tant qu'elle est dans le brouillard", () => {
    const { caravanes } = new SessionJeu().etat();
    expect(caravanes.J1.visible).toBe(true);
    expect(caravanes.J2.visible).toBe(false);
    expect(caravanes.J2).toMatchObject({ x: -1, y: -1 });
  });

  it("nouvelle() remet la partie à zéro", () => {
    const session = new SessionJeu();
    session.commande("fin");
    session.nouvelle();
    const etat = session.etat();
    expect(etat.joueur).toBe("J1");
    expect(etat.tour).toBe(1);
  });

  describe("contre l'ordinateur", () => {
    it("l'ordinateur joue tout seul le tour de J2 : la main revient à J1", () => {
      const session = new SessionJeu();
      session.nouvelle("prudente");
      const reponse = session.commande("fin");
      expect(reponse.etat.adversaire).toBe("prudente");
      expect(reponse.etat.joueur).toBe("J1");
      expect(reponse.etat.tour).toBe(2);
      expect(reponse.messages.join(" ")).toContain("L'ordinateur (J2) a joué son tour");
    });

    it("fonctionne aussi avec l'ordinateur bluffeur, tour après tour", () => {
      const session = new SessionJeu();
      session.nouvelle("bluffeuse");
      for (let i = 0; i < 6; i++) {
        const etat = session.commande("fin").etat;
        expect(etat.joueur === "J1" || etat.terminee).toBe(true);
      }
    });

    it("garde les actions de l'ordinateur secrètes dans le journal pendant la partie", () => {
      const session = new SessionJeu();
      session.nouvelle("prudente");
      const journal = session.commande("fin").etat.journal.join(" ");
      expect(journal).not.toContain("J2 avance");
    });
  });

  it("donne le replay complet une fois la partie terminée, et seulement alors", () => {
    const session = new SessionJeu();
    session.nouvelle("humain");
    expect(session.commande("boire").etat.replay).toEqual([]);
    let etat = session.etat();
    for (let i = 0; i < 200 && !etat.terminee; i++) {
      etat = session.commande("fin").etat;
    }
    expect(etat.terminee).toBe(true);
    expect(etat.vainqueur).toBe("Egalite");
    expect(etat.replay[0]).toMatchObject({ tour: 1, joueur: "J1", texte: "J1 boit une outre" });
  });

  it("n'enregistre qu'une seule fois la phrase de fin dans le journal", () => {
    const session = new SessionJeu();
    let etat = session.etat();
    for (let i = 0; i < 200 && !etat.terminee; i++) {
      etat = session.commande("fin").etat;
    }
    session.commande("fin"); // refusée : la partie est finie
    const fins = session.etat().journal.filter((ligne) => ligne.includes("Égalité"));
    expect(fins).toHaveLength(1);
  });
});
