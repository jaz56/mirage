/** Une action refusée par les règles du jeu (pas une erreur de programmation). */
export class ActionImpossible extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionImpossible";
  }
}
