import { describe, expect, it } from "vitest";
import {
  AIDE,
  analyserCommande,
  Avancer,
  Boire,
  JouerMirage,
  PoserBalise,
  Sonder,
  type Commande,
} from "../../src/temps";
import { creerMonde } from "./helpers/monde";

function analyser(texte: string): Commande {
  const { etat } = creerMonde();
  return analyserCommande(texte, "J1", etat);
}

function actionDe(commande: Commande) {
  if (commande.genre !== "action") {
    throw new Error(`Attendu une action, obtenu ${commande.genre}`);
  }
  return commande.action;
}

describe("analyserCommande", () => {
  it("n, s, e, o avancent", () => {
    for (const lettre of ["n", "s", "e", "o"]) {
      expect(actionDe(analyser(lettre))).toBeInstanceOf(Avancer);
    }
  });

  it("accepte « avancer s » et les noms complets, sans tenir compte de la casse", () => {
    expect(actionDe(analyser("avancer s"))).toBeInstanceOf(Avancer);
    expect(actionDe(analyser("SUD"))).toBeInstanceOf(Avancer);
    expect(actionDe(analyser("  Ouest  "))).toBeInstanceOf(Avancer);
  });

  it("« avancer » sans direction est une erreur", () => {
    expect(analyser("avancer").genre).toBe("erreur");
    expect(analyser("avancer x").genre).toBe("erreur");
  });

  it("sonder : direction, ici, ou ici par défaut", () => {
    expect(actionDe(analyser("sonder e"))).toBeInstanceOf(Sonder);
    expect(actionDe(analyser("sonder ici"))).toBeInstanceOf(Sonder);
    expect(actionDe(analyser("sonder"))).toBeInstanceOf(Sonder);
    expect(analyser("sonder partout").genre).toBe("erreur");
  });

  it("balise et boire", () => {
    expect(actionDe(analyser("balise"))).toBeInstanceOf(PoserBalise);
    expect(actionDe(analyser("boire"))).toBeInstanceOf(Boire);
  });

  it("mirage <carte> <x> <y>", () => {
    expect(actionDe(analyser("mirage FausseOasis 2 1"))).toBeInstanceOf(JouerMirage);
    expect(actionDe(analyser("mirage dunefantome 0 0"))).toBeInstanceOf(JouerMirage);
    expect(actionDe(analyser("mirage SelTrompeur 1 1"))).toBeInstanceOf(JouerMirage);
  });

  it("mirage avec une carte inconnue ou des coordonnées fausses est une erreur", () => {
    expect(analyser("mirage Tempete 1 1").genre).toBe("erreur");
    expect(analyser("mirage FausseOasis").genre).toBe("erreur");
    expect(analyser("mirage FausseOasis 1").genre).toBe("erreur");
    expect(analyser("mirage FausseOasis a b").genre).toBe("erreur");
    expect(analyser("mirage FausseOasis 1.5 2").genre).toBe("erreur");
  });

  it("fin, aide et quitter", () => {
    expect(analyser("fin").genre).toBe("fin");
    expect(analyser("aide").genre).toBe("aide");
    expect(analyser("quitter").genre).toBe("quitter");
  });

  it("une ligne vide ou une commande inconnue est une erreur", () => {
    expect(analyser("").genre).toBe("erreur");
    expect(analyser("   ").genre).toBe("erreur");
    const inconnue = analyser("danser");
    expect(inconnue.genre).toBe("erreur");
    if (inconnue.genre === "erreur") {
      expect(inconnue.message).toContain("danser");
    }
  });

  it("le texte d'aide cite toutes les commandes", () => {
    for (const mot of ["sonder", "balise", "boire", "mirage", "fin", "quitter"]) {
      expect(AIDE).toContain(mot);
    }
  });
});
