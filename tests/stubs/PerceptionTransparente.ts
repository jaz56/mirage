import type {
  CaseVue,
  NomCarte,
  NomPhase,
  Perception,
  Plateau,
  Position,
  Vue,
} from "../../src/contrats";

/**
 * Stub du module perception/ (Nour) : une perception sans aucune déformation, qui montre la
 * réalité telle quelle (ou "?" partout si on ne lui donne pas de plateau) et qui note ce qu'on
 * lui envoie, pour que les autres modules puissent le vérifier.
 */
export class PerceptionTransparente implements Perception {
  readonly cartesRecues: Array<{ carte: NomCarte; cible: Position }> = [];
  readonly phasesRecues: NomPhase[] = [];
  finsDeTour = 0;

  constructor(private readonly plateau?: Plateau) {}

  surPhase(phase: NomPhase): void {
    this.phasesRecues.push(phase);
  }

  vueActuelle(): Vue {
    return {
      voir: (p: Position): CaseVue => {
        const c = this.plateau?.get(p);
        return c === undefined
          ? { terrain: "?", etat: "?", balise: false }
          : { terrain: c.terrain.nom, etat: c.getEtat(), balise: c.aBalise() };
      },
    };
  }

  appliquerCarte(carte: NomCarte, cible: Position): void {
    this.cartesRecues.push({ carte, cible });
  }

  finDeTour(): void {
    this.finsDeTour += 1;
  }
}
