import type {
  CaseVue,
  NomCarte,
  NomPhase,
  Perception,
  Plateau,
  Position,
  Vue,
} from "../../src/contrats";
import { VueReelle } from "../../src/perception";

/**
 * Perception sans aucune déformation : la vue est toujours la réalité (ou "?" partout si on ne
 * donne pas de plateau). Elle note aussi ce qu'on lui envoie, pour que les autres modules
 * (temps/) puissent le vérifier dans leurs tests.
 */
export class PerceptionTransparente implements Perception {
  readonly cartesRecues: Array<{ carte: NomCarte; cible: Position }> = [];
  readonly phasesRecues: NomPhase[] = [];
  finsDeTour = 0;

  private readonly vue: Vue;

  constructor(plateau?: Plateau) {
    this.vue =
      plateau === undefined
        ? { voir: (): CaseVue => ({ terrain: "?", etat: "?", balise: false }) }
        : new VueReelle(plateau);
  }

  surPhase(phase: NomPhase): void {
    this.phasesRecues.push(phase);
  }

  vueActuelle(): Vue {
    return this.vue;
  }

  appliquerCarte(carte: NomCarte, cible: Position): void {
    this.cartesRecues.push({ carte, cible });
  }

  finDeTour(): void {
    this.finsDeTour += 1;
  }
}
