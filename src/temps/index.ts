// Seule porte d'entrée du module temps/.
export { Partie, type ConfigurationPartie, type EntreeReplay, type Vainqueur } from "./Partie";
export { formaterReplay, texteVainqueur } from "./Replay";
export { Soleil } from "./Soleil";
export { BoucleDeJeu, type OptionsBoucle, type Resultat } from "./BoucleDeJeu";
export { Clavier } from "./console/Clavier";
export type { Entree } from "./console/Entree";
export { analyserCommande, AIDE, type Commande } from "./console/commandes";
export { ActionImpossible } from "./actions/ActionImpossible";
export { Avancer } from "./actions/Avancer";
export { Sonder } from "./actions/Sonder";
export { PoserBalise } from "./actions/PoserBalise";
export { Boire } from "./actions/Boire";
export { JouerMirage } from "./actions/JouerMirage";
export type { Direction } from "./actions/directions";
export { FabriqueActionsJeu } from "./FabriqueActionsJeu";
export { jouerTourIA } from "./TourIA";
