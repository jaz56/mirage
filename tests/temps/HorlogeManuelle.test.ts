import { describe, expect, it } from "vitest";
import type { NomPhase } from "../../src/contrats";
import { HorlogeManuelle } from "../stubs/HorlogeManuelle";

describe("HorlogeManuelle (stub pour lac/ et perception/)", () => {
  it("commence à la phase demandée", () => {
    expect(new HorlogeManuelle("Nuit").getPhase()).toBe("Nuit");
  });

  it("prévient ses abonnés quand on change la phase à la main", () => {
    const horloge = new HorlogeManuelle();
    const recues: NomPhase[] = [];
    horloge.abonner({ surPhase: (p) => recues.push(p) });
    horloge.passerA("Zenith");
    horloge.passerA("Nuit");
    expect(recues).toEqual(["Zenith", "Nuit"]);
    expect(horloge.getPhase()).toBe("Nuit");
  });
});
