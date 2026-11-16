// CONFIGURATION PARTAGÉE — tout chiffre du jeu vient d'ici. Jamais de valeur en dur ailleurs.
import type { NomPhase } from "../contrats";

export const LARGEUR = 9;
export const HAUTEUR = 13;
export const LIGNE_DEPART = 0;
export const LIGNE_ARRIVEE = HAUTEUR - 1;

export const PA_PAR_TOUR = 3;
export const TOURS_PAR_PHASE = 2;
export const TOURS_MAX = 40;

export const OUTRES_DEPART = 3;
export const CARTES_DEPART = 3;
export const DUREE_CARTE = 3; // tours
export const SEUIL_SOIF = 4; // tours sans boire
export const TOURS_SANS_EAU_ABANDON = 3;

export const PORTEE_CHALEUR = 2; // cases
export const PORTEE_BRUME = 2; // cases
export const PORTEE_NUIT = 1; // cases

export const ORDRE_PHASES: readonly NomPhase[] = ["Aube", "Matin", "Zenith", "Crepuscule", "Nuit"];
