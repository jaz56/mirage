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

  it("nouvelle() remet la partie à zéro", () => {
    const session = new SessionJeu();
    session.commande("fin");
    session.nouvelle();
    const etat = session.etat();
    expect(etat.joueur).toBe("J1");
    expect(etat.tour).toBe(1);
  });
});
