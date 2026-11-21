import type { Perception, Plateau, Vue } from "../../src/contrats";
import { VueReelle } from "../../src/perception";

/** Perception sans aucune déformation : la vue est toujours la réalité. */
export class PerceptionTransparente implements Perception {
  private readonly vue: Vue;

  constructor(plateau: Plateau) {
    this.vue = new VueReelle(plateau);
  }

  surPhase(): void {}

  vueActuelle(): Vue {
    return this.vue;
  }

  appliquerCarte(): void {}

  finDeTour(): void {}
}