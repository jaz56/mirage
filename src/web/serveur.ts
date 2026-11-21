// Petit serveur HTTP local (aucune dépendance) : sert la page du jeu et une API JSON.
import { exec } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import path from "node:path";
import { SessionJeu } from "./SessionJeu";

const DOSSIER_PUBLIC = path.join(__dirname, "public");

/** Seuls ces fichiers sont servis : pas de chemin arbitraire demandé par le navigateur. */
const FICHIERS: Readonly<Record<string, { fichier: string; type: string }>> = {
  "/": { fichier: "index.html", type: "text/html; charset=utf-8" },
  "/index.html": { fichier: "index.html", type: "text/html; charset=utf-8" },
  "/style.css": { fichier: "style.css", type: "text/css; charset=utf-8" },
  "/jeu.js": { fichier: "jeu.js", type: "text/javascript; charset=utf-8" },
};

const TAILLE_MAX_CORPS = 4096;

function lireCorps(requete: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let corps = "";
    requete.on("data", (morceau: Buffer) => {
      corps += morceau.toString("utf8");
      if (corps.length > TAILLE_MAX_CORPS) {
        reject(new Error("Requête trop grande."));
        requete.destroy();
      }
    });
    requete.on("end", () => resolve(corps));
    requete.on("error", reject);
  });
}

function repondreJson(reponse: ServerResponse, statut: number, donnees: unknown): void {
  reponse.writeHead(statut, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  reponse.end(JSON.stringify(donnees));
}

export function creerServeur(session: SessionJeu): Server {
  return createServer((requete, reponse) => {
    void traiter(session, requete, reponse).catch((erreur: unknown) => {
      console.error(erreur);
      repondreJson(reponse, 500, { ok: false, messages: ["Erreur du serveur."] });
    });
  });
}

async function traiter(
  session: SessionJeu,
  requete: IncomingMessage,
  reponse: ServerResponse,
): Promise<void> {
  const url = new URL(requete.url ?? "/", "http://localhost");
  const methode = requete.method ?? "GET";

  if (url.pathname === "/api/etat" && methode === "GET") {
    repondreJson(reponse, 200, { ok: true, messages: [], etat: session.etat() });
    return;
  }
  if (url.pathname === "/api/nouvelle" && methode === "POST") {
    session.nouvelle();
    repondreJson(reponse, 200, { ok: true, messages: [], etat: session.etat() });
    return;
  }
  if (url.pathname === "/api/commande" && methode === "POST") {
    const donnees: unknown = JSON.parse(await lireCorps(requete));
    const texte =
      typeof donnees === "object" && donnees !== null && "texte" in donnees
        ? String((donnees as { texte: unknown }).texte)
        : "";
    repondreJson(reponse, 200, session.commande(texte));
    return;
  }

  const entree = methode === "GET" ? FICHIERS[url.pathname] : undefined;
  if (entree === undefined) {
    reponse.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    reponse.end("Introuvable");
    return;
  }
  const contenu = await readFile(path.join(DOSSIER_PUBLIC, entree.fichier));
  reponse.writeHead(200, { "Content-Type": entree.type, "Cache-Control": "no-store" });
  reponse.end(contenu);
}

/** Écoute sur le premier port libre à partir de `portInitial`. */
export function demarrer(serveur: Server, portInitial: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const essayer = (port: number): void => {
      serveur.once("error", (erreur: NodeJS.ErrnoException) => {
        if (erreur.code === "EADDRINUSE" && port < portInitial + 20) {
          essayer(port + 1);
        } else {
          reject(erreur);
        }
      });
      serveur.listen(port, "127.0.0.1", () => resolve(port));
    };
    essayer(portInitial);
  });
}

/** Ouvre l'adresse dans le navigateur par défaut. */
export function ouvrirNavigateur(adresse: string): void {
  const commande =
    process.platform === "win32"
      ? `start "" "${adresse}"`
      : process.platform === "darwin"
        ? `open "${adresse}"`
        : `xdg-open "${adresse}"`;
  exec(commande, () => {
    // Si l'ouverture échoue, le joueur a l'adresse affichée dans la console.
  });
}
