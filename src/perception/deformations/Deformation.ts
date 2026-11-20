import type { CaseVue, Position, Vue } from "../../contrats";

export abstract class Deformation implements Vue {
  constructor(protected readonly interne: Vue) {}
  abstract voir(p: Position): CaseVue;
}

/** Distance en cases (diagonales comprises). */
export function distance(a: Position, b: Position): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

export function memePosition(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}
