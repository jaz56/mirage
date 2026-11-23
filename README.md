# Mirage — la traversée du Chott el-Djerid

Jeu de course et de bluff à deux joueurs, au tour par tour. Deux caravanes traversent le lac salé ; personne ne voit le vrai lac, seulement une version déformée par la chaleur, le vent, les mirages… et l'adversaire.

Projet du module **Design Patterns (GoF)** — ENICarthage.

Équipe : Yassmine (`temps/`), Malek (`lac/`), Nour (`perception/`).

## Démarrer

```bash
npm ci          # installer les dépendances (version exacte du package-lock)
npm start       # lancer le jeu graphique (ouvre le navigateur)
npm run console # lancer le jeu en console (texte)
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

## Comment jouer

Au démarrage on choisit son adversaire : un autre joueur sur le même écran, l'ordinateur **prudent** ou l'ordinateur **bluffeur**. J1 part du haut du lac, J2 du bas ; le premier arrivé sur la rive opposée gagne (égalité après 40 tours).

Chaque tour donne 3 points d'action (PA) : avancer (coût du terrain + soif ou panique du chameau), sonder (révèle le vrai terrain), poser une balise, boire, ou jouer une carte Mirage (2 PA) qui trompe la vue de l'adversaire. Le Soleil change de phase tous les 2 tours (aube, matin, zénith, crépuscule, nuit) et chaque phase déforme ce qu'on voit : brume, chaleur, vent, obscurité. À la fin, un **replay** montre toutes les actions de la partie, cartes comprises.

Version graphique : flèches ou ZQSD/WASD pour avancer, X sonder, B balise, R boire, Entrée fin de tour. Version console : `aide` liste les commandes.

## Module temps/ — Yassmine

`Partie` et `Soleil` sont des Singletons ; le Soleil est le sujet d'un Observer (cases, caravanes et perceptions s'abonnent) et ses 5 phases sont un State. Les actions des joueurs (`Avancer`, `Sonder`, `PoserBalise`, `Boire`, `JouerMirage`) sont des Commands. `BoucleDeJeu` enchaîne les tours, `Replay` met en forme la fin de partie, `FabriqueActionsJeu` donne aux IA de quoi créer des actions sans importer `temps/`.

## Module lac/ — Malek

`Case` change d'état avec le Soleil (State : Solide, Craquelée, Boue, Croûte fragile) ; `TypeTerrain` est partagé par `FabriqueTerrains` (Flyweight) ; `FabriquePlateau` génère un lac aléatoire avec au moins un chemin praticable (Factory Method) ; `Caravane` suit la soif et la panique du chameau (State) et `FabriqueCaravane` la crée.

## Module perception/ — Nour

`Perception` empile des décorateurs sur `VueReelle` : une déformation de phase (brume, chaleur, vent, obscurité), les cartes Mirage actives, puis les balises. Deux stratégies d'ordinateur (Strategy) : `Prudente` contourne boue et croûte fragile, `Bluffeuse` prend plus de risques et joue une carte Mirage un tour sur deux. Elles ne voient le lac qu'à travers leur propre perception, donc subissent le brouillard comme un humain.

## Interface graphique

`src/web/` : un petit serveur Node sans dépendance (`serveur.ts`) sert la page et une API JSON ; `SessionJeu` pilote la partie ; `public/` dessine le lac en 2.5D sur un canvas. Le serveur ne révèle jamais la position d'une caravane cachée dans le brouillard.
