import { NomTerrain, TypeTerrain as ITypeTerrain } from "../../contrats";


export class TypeTerrain implements ITypeTerrain {
    constructor(
        readonly nom:NomTerrain,
        readonly cout:number,
        readonly symbole:string
    ){}
}