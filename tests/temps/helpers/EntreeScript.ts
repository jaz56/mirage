import type { Entree } from "../../../src/temps";

/** Fausse entrée : rejoue une liste de commandes, puis signale la fin de l'entrée. */
export class EntreeScript implements Entree {
  readonly invites: string[] = [];
  private index = 0;

  constructor(private readonly lignes: readonly string[]) {}

  async lire(invite: string): Promise<string | undefined> {
    this.invites.push(invite);
    const ligne = this.lignes[this.index];
    this.index += 1;
    return ligne;
  }

  fermer(): void {}
}
