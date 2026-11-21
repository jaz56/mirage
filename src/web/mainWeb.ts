// Point d'entrée de la version graphique : assemble la partie, lance le serveur local et
// ouvre le jeu dans le navigateur. (La version console reste disponible : npm run console.)
import { creerServeur, demarrer, ouvrirNavigateur } from "./serveur";
import { SessionJeu } from "./SessionJeu";

async function main(): Promise<void> {
  const serveur = creerServeur(new SessionJeu());
  const port = await demarrer(serveur, Number(process.env.PORT ?? 3000));
  const adresse = `http://localhost:${port}`;
  console.log(`MIRAGE est ouvert sur ${adresse}  (Ctrl+C pour arrêter)`);
  if (process.env.MIRAGE_SANS_NAVIGATEUR === undefined) {
    ouvrirNavigateur(adresse);
  }
}

main().catch((erreur: unknown) => {
  console.error(erreur);
  process.exitCode = 1;
});
