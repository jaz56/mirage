import { createInterface, type Interface } from "node:readline";
import type { Entree } from "./Entree";

/** Lecture des commandes au clavier (entrée standard). Fonctionne aussi avec une entrée redirigée. */
export class Clavier implements Entree {
  private readonly interface_: Interface = createInterface({ input: process.stdin });
  private readonly lignes = this.interface_[Symbol.asyncIterator]();

  async lire(invite: string): Promise<string | undefined> {
    process.stdout.write(invite);
    const suivante = await this.lignes.next();
    return suivante.done ? undefined : suivante.value;
  }

  fermer(): void {
    this.interface_.close();
  }
}
