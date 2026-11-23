import { StrategieBase } from "./StrategieBase";

/** IA prudente : contourne la boue, la croûte fragile et l'inconnu, quitte à faire un détour. */
export class Prudente extends StrategieBase {
  protected readonly poidsRisque = 3;
}
