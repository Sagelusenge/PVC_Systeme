# Deploiement Render

Le fichier `render.yaml` cree deux services independants depuis le meme depot GitHub :

- `pvc-systeme-api` : Web Service Node.js pour l'API Express ;
- `pvc-systeme-web` : Static Site pour l'application React/Vite.

## Prerequis MariaDB

La base configuree sur `localhost` n'est pas accessible depuis Render. Il faut utiliser une instance MariaDB publique ou privee joignable depuis Render, puis y importer `database/schema/db_pvc.sql`, les migrations et, si necessaire, la sauvegarde de production.

Ne placez jamais les identifiants de la base dans Git. Renseignez-les uniquement dans les variables d'environnement Render.

## Variables du Web Service

| Variable | Valeur attendue |
| --- | --- |
| `DB_HOST` | Adresse reseau de la MariaDB distante |
| `DB_PORT` | Port MariaDB, generalement `3306` |
| `DB_USER` | Utilisateur applicatif |
| `DB_PASSWORD` | Mot de passe de l'utilisateur |
| `DB_NAME` | Nom de la base importee |
| `DB_SSL` | `true` si l'hebergeur impose TLS |
| `DB_SSL_REJECT_UNAUTHORIZED` | `true` avec un certificat valide |
| `CORS_ORIGIN` | URL HTTPS du Static Site, sans barre finale |

`JWT_SECRET` est genere automatiquement par Render.

## Variable du Static Site

| Variable | Valeur attendue |
| --- | --- |
| `VITE_API_URL` | URL HTTPS du Web Service suivie de `/api` |

Exemple : `https://pvc-systeme-api.onrender.com/api`.

## Ordre de mise en ligne

1. Importer la base dans une MariaDB distante.
2. Dans Render, creer un Blueprint depuis le depot `Sagelusenge/PVC_Systeme`.
3. Fournir les variables marquees comme privees dans le formulaire du Blueprint.
4. Attendre que le Web Service reponde sur `/api/health`.
5. Reporter l'URL exacte de l'API dans `VITE_API_URL`.
6. Reporter l'URL exacte du Static Site dans `CORS_ORIGIN`, puis redeployer l'API.
7. Verifier `/login`, la connexion et une operation de lecture/ecriture.

Le rewrite `/*` vers `/index.html` est deja configure pour que les routes React restent accessibles apres actualisation.
