/** Source des commandes du joueur : le clavier en vrai, un script dans les tests. */
export interface Entree {
  /** Affiche l'invite puis renvoie la ligne tapée, ou undefined quand il n'y a plus d'entrée. */
  lire(invite: string): Promise<string | undefined>;
  fermer(): void;
}
