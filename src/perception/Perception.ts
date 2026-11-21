import type {
  CaravaneJeu,
  NomCarte,
  NomPhase,
  Perception as PerceptionContrat,
  Plateau,
  Position,
  Vue,
} from "../contrats";
import { DUREE_CARTE, PORTEE_BRUME, PORTEE_CHALEUR, PORTEE_NUIT } from "../config/constantes";
import { VueReelle } from "./VueReelle";
import { Chaleur } from "./deformations/Chaleur";
import { Brume } from "./deformations/Brume";
import { Vent } from "./deformations/Vent";
import { Obscurite } from "./deformations/Obscurite";
import { Mirage } from "./deformations/Mirage";
import { SelTrompeur } from "./deformations/SelTrompeur";
import { Balise } from "./deformations/Balise";

interface CarteActive {
  readonly carte: NomCarte;
  readonly cible: Position;
  toursRestants: number;
}

/**
 * La vue d'UN joueur. Les décorateurs sont empilés dans un ordre unique :
 * VueReelle -> déformation de phase -> cartes jouées -> Balise.
 */
export class Perception implements PerceptionContrat {
  private phase: NomPhase = "Aube";
  private cartes: CarteActive[] = [];
  private vue: Vue;

  constructor(
    private readonly plateau: Plateau,
    private readonly caravane: CaravaneJeu,
  ) {
    this.vue = this.construire();
  }

  surPhase(phase: NomPhase): void {
    this.phase = phase;
    this.vue = this.construire();
  }

  vueActuelle(): Vue {
    return this.vue;
  }

  appliquerCarte(carte: NomCarte, cible: Position): void {
    this.cartes.push({ carte, cible, toursRestants: DUREE_CARTE });
    this.vue = this.construire();
  }

  finDeTour(): void {
    for (const c of this.cartes) c.toursRestants -= 1;
    this.cartes = this.cartes.filter((c) => c.toursRestants > 0);
    this.vue = this.construire();
  }

  /** Seul endroit où l'ordre des décorateurs est décidé. */
  private construire(): Vue {
    let vue: Vue = new VueReelle(this.plateau);
    vue = this.deformationDePhase(vue);
    for (const c of this.cartes) vue = this.deformationDeCarte(vue, c);
    return new Balise(vue, this.plateau);
  }

  private deformationDePhase(vue: Vue): Vue {
    switch (this.phase) {
      case "Aube":
        return new Brume(vue, this.caravane, PORTEE_BRUME);
      case "Zenith":
        return new Chaleur(vue, this.caravane, PORTEE_CHALEUR);
      case "Crepuscule":
        return new Vent(vue);
      case "Nuit":
        return new Obscurite(vue, this.caravane, PORTEE_NUIT);
      case "Matin":
        return vue;
    }
  }

  private deformationDeCarte(vue: Vue, c: CarteActive): Vue {
    switch (c.carte) {
      case "FausseOasis":
        return new Mirage(vue, c.cible, "oasis");
      case "DuneFantome":
        return new Mirage(vue, c.cible, "dune");
      case "SelTrompeur":
        return new SelTrompeur(vue, c.cible);
    }
  }
}
