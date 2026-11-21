import type { Position } from "../../contrats";

export type Direction = "N" | "S" | "E" | "O";

export const NOMS_DIRECTIONS: Record<Direction, string> = {
  N: "nord",
  S: "sud",
  E: "est",
  O: "ouest",
};

/** Case voisine dans une direction. J1 part du haut du lac (y = 0), J2 du bas. */
export function decaler(p: Position, direction: Direction): Position {
  switch (direction) {
    case "N":
      return { x: p.x, y: p.y - 1 };
    case "S":
      return { x: p.x, y: p.y + 1 };
    case "E":
      return { x: p.x + 1, y: p.y };
    case "O":
      return { x: p.x - 1, y: p.y };
  }
}
