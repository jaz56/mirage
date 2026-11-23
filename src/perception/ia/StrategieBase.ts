import type {
  Action,
  DirectionAction,
  EtatPartie,
  FabriqueActions,
  IdJoueur,
  NomEtatSel,
  NomTerrain,
  Position,
  StrategieIA,
  Vue,
} from "../../contrats";

/** Coût de déplacement qu'une IA suppose pour un terrain, d'après ce qu'elle voit. */
const COUT_ESTIME: Record<NomTerrain | "?", number> = {
  croute: 1,
  dune: 2,
  oasis: 1,
  "puits-sec": Infinity,
  "?": 2,
};

/** Danger d'un état du sel (enlisement, panique...). "?" : on ne sait pas, on se méfie un peu. */
const RISQUE_SEL: Record<NomEtatSel | "?", number> = {
  Solide: 0,
  Craquelee: 1,
  CrouteFragile: 2,
  Boue: 3,
  "?": 1,
};

interface Pas {
  readonly direction: DirectionAction;
  readonly dx: number;
  readonly dy: number;
}

const PAS: readonly Pas[] = [
  { direction: "N", dx: 0, dy: -1 },
  { direction: "S", dx: 0, dy: 1 },
  { direction: "E", dx: 1, dy: 0 },
  { direction: "O", dx: -1, dy: 0 },
];

interface EtapeChemin {
  readonly direction: DirectionAction;
  /** Coût de déplacement estimé de cette étape (sans le goût du risque). */
  readonly cout: number;
}

const cle = (p: Position): string => `${p.x},${p.y}`;

/**
 * Stratégie d'ordinateur (patron Strategy). Elle ne regarde le lac qu'à travers la perception de
 * son joueur : elle subit donc brume, chaleur, nuit et mirages comme un humain.
 *
 * Elle prépare tout son tour d'un coup : [carte éventuelle], [boire si assoiffé], puis les pas du
 * chemin le moins coûteux vers l'autre rive.
 */
export abstract class StrategieBase implements StrategieIA {
  constructor(
    protected readonly joueur: IdJoueur,
    protected readonly actions: FabriqueActions,
  ) {}

  /** À quel point cette IA évite les cases dangereuses (0 = téméraire). */
  protected abstract readonly poidsRisque: number;

  /** Carte Mirage à jouer ce tour-ci, s'il y en a une. Par défaut : jamais. */
  protected carte(_etat: EtatPartie, _vue: Vue, _pa: number): Action | undefined {
    return undefined;
  }

  choisirActions(etat: EtatPartie, pa: number): Action[] {
    const caravane = etat.caravane(this.joueur);
    if (caravane.estEnlisee()) {
      return []; // elle ne peut rien faire de plus avant la prochaine phase du Soleil
    }
    const vue = etat.perception(this.joueur).vueActuelle();
    const plan: Action[] = [];
    let reste = pa;

    const carte = this.carte(etat, vue, reste);
    if (carte !== undefined) {
      plan.push(carte);
      reste -= carte.cout;
    }

    let surcout = caravane.coutDeplacement({ nom: "croute", cout: 0, symbole: "" });
    if (caravane.getEtatChameau() === "Assoiffe" && caravane.outres() > 0 && reste > 1) {
      plan.push(this.actions.boire(this.joueur));
      reste -= 1;
      surcout = 0; // boire calme la soif
    }

    for (const etape of this.cheminVersArrivee(etat, vue, caravane.getPosition(), surcout)) {
      if (etape.cout > reste) {
        break;
      }
      plan.push(this.actions.avancer(this.joueur, etape.direction));
      reste -= etape.cout;
    }
    return plan;
  }

  protected adversaire(): IdJoueur {
    return this.joueur === "J1" ? "J2" : "J1";
  }

  protected ligneArrivee(etat: EtatPartie): number {
    return this.joueur === "J1" ? etat.plateau.hauteur - 1 : 0;
  }

  /** Dijkstra sur le lac tel que la perception le montre. Renvoie les pas du meilleur chemin. */
  private cheminVersArrivee(
    etat: EtatPartie,
    vue: Vue,
    depart: Position,
    surcout: number,
  ): EtapeChemin[] {
    const { largeur, hauteur } = etat.plateau;
    const arrivee = this.ligneArrivee(etat);
    const distance = new Map<string, number>([[cle(depart), 0]]);
    const avant = new Map<string, { de: Position; etape: EtapeChemin }>();
    const ouverts: Position[] = [depart];
    const fermes = new Set<string>();
    let but: Position | undefined;

    while (ouverts.length > 0) {
      ouverts.sort((a, b) => (distance.get(cle(a)) ?? 0) - (distance.get(cle(b)) ?? 0));
      const courant = ouverts.shift() as Position;
      if (fermes.has(cle(courant))) {
        continue;
      }
      fermes.add(cle(courant));
      if (courant.y === arrivee) {
        but = courant;
        break;
      }
      for (const pas of PAS) {
        const suivant = { x: courant.x + pas.dx, y: courant.y + pas.dy };
        if (suivant.x < 0 || suivant.y < 0 || suivant.x >= largeur || suivant.y >= hauteur) {
          continue;
        }
        const vu = vue.voir(suivant);
        const base = COUT_ESTIME[vu.terrain];
        if (!Number.isFinite(base)) {
          continue; // puits sec : infranchissable
        }
        const cout = base + surcout;
        const total =
          (distance.get(cle(courant)) ?? 0) + cout + this.poidsRisque * RISQUE_SEL[vu.etat];
        if (total < (distance.get(cle(suivant)) ?? Infinity)) {
          distance.set(cle(suivant), total);
          avant.set(cle(suivant), { de: courant, etape: { direction: pas.direction, cout } });
          ouverts.push(suivant);
        }
      }
    }

    const chemin: EtapeChemin[] = [];
    let courant = but;
    while (courant !== undefined && cle(courant) !== cle(depart)) {
      const precedent = avant.get(cle(courant));
      if (precedent === undefined) {
        break;
      }
      chemin.unshift(precedent.etape);
      courant = precedent.de;
    }
    return chemin;
  }
}
