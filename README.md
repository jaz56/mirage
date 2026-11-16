# Mirage — la traversée du Chott el-Djerid

Jeu de course et de bluff à deux joueurs, au tour par tour. Deux caravanes traversent le lac salé ; personne ne voit le vrai lac, seulement une version déformée par la chaleur, le vent, les mirages… et l'adversaire.

Projet du module **Design Patterns (GoF)** — ENICarthage.

Équipe : Yassmine (`temps/`), Malek (`lac/`), Nour (`perception/`).

## Démarrer

```bash
npm ci          # installer les dépendances (version exacte du package-lock)
npm start       # lancer le jeu en console
npm test        # lancer les tests
npm run verifier  # typecheck + lint + format + tests (à faire avant chaque PR)
```

## Architecture

```
src/
├── contrats/     PARTAGÉ : interfaces et types communs (figés)
├── config/       PARTAGÉ : constantes du jeu
├── temps/        Yassmine : Partie, Soleil, phases, actions
├── lac/          Malek : cases, terrains, plateau, caravanes
├── perception/   Nour : vues, déformations, rendu, IA
└── main.ts       Yassmine : assemble les modules
```

Un module n'importe que `contrats/`, `config/` et ses propres fichiers. ESLint bloque tout autre import.

## Patrons de conception

| Patron | Où |
| --- | --- |
| Singleton | `Partie`, `Soleil` |
| State | phases du Soleil, états du sel, états du chameau |
| Observer | le Soleil notifie cases, caravanes et perceptions |
| Command | actions des joueurs |
| Flyweight | types de terrain |
| Factory Method | fabriques du plateau et des caravanes |
| Décorateur | déformations de la vue |
| Strategy | adversaire ordinateur |

## Workflow Git

- `main` : version rendue. `develop` : intégration. Personne ne pousse directement sur ces deux branches.
- Une branche courte par fonctionnalité : `feature/<prenom>-<sujet>`, fusionnée par pull request vers `develop`.
- Changement des contrats : branche `contrat/<sujet>`, validée par les trois.
- Commits : `type(module): message` — `feat`, `fix`, `test`, `refactor`, `contrat`, `chore`.

## Module temps/ — Yassmine

_À compléter._

## Module lac/ — Malek

_À compléter._

## Module perception/ — Nour

_À compléter._
