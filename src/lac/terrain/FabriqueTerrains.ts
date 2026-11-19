import type { NomTerrain } from "../../contrats";
import { TypeTerrain } from "./TypeTerrain";



interface DefinitionTerrain{
    readonly cout:number;
    readonly symbole:string;
}

/** Données propres à chaque type de terrain. */
const DEFINITIONS: Record<NomTerrain,DefinitionTerrain>={
    croute:{cout:1 ,symbole:"."},
    dune:{cout:2 ,symbole:"^"},
    oasis:{cout: 1 ,symbole:"O"},
    "puits-sec":{cout:1 ,symbole:"X"},
};


export const NOMS_TERRAINS: readonly NomTerrain[] = ["croute", "dune", "oasis", "puits-sec"];

/** Un puits sec bloque le passage ; tous les autres terrains sont praticables. */


export function  estPraticable(terrain:{readonly nom:NomTerrain}):boolean {
    return terrain.nom!= "puits-sec"
}


/** Fabrique de poids légers : crée chaque TypeTerrain une seule fois puis le réutilise. */
export class FabriqueTerrains {
    private readonly cache =new Map<NomTerrain , TypeTerrain>();

    get(nom: NomTerrain):TypeTerrain{
        let terrain = this.cache.get(nom);
        if (terrain == undefined){
            const definition =DEFINITIONS[nom];
            terrain = new TypeTerrain(nom, definition.cout , definition.symbole); 
            this.cache.set(nom,terrain);

        }
        return terrain;
    }

    /** Nombre d'objets réellement créés (utile pour vérifier le partage). */
    nombreCrees():number{
        return this.cache.size;
    }
}
