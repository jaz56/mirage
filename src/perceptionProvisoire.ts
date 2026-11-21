// PROVISOIRE : en attendant le module perception/ de Nour. Quand il sera prêt, remplacer
// PerceptionProvisoire par sa classe Perception (main.ts et web/mainWeb.ts l'utilisent).
import type { CaseVue, Perception, Plateau, Position, Vue } from "./contrats";

export class PerceptionProvisoire implements Perception {
  constructor(private readonly plateau: Plateau) {}

  surPhase(): void {}

  vueActuelle(): Vue {
    return {
      voir: (p: Position): CaseVue => {
        const c = this.plateau.get(p);
        return c === undefined
          ? { terrain: "?", etat: "?", balise: false }
          : { terrain: c.terrain.nom, etat: c.getEtat(), balise: c.aBalise() };
      },
    };
  }

  appliquerCarte(): void {}

  finDeTour(): void {}
}
