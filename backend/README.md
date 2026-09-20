# PVC Management Backend

API Express/MariaDB couvrant l'authentification, les utilisateurs, clients, commandes, ventes, paiements, stock, production, comptabilite, RH, immobilisations, dashboard et rapports.

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env`, then adjust the database values if needed.

Default database:

```text
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=pvc_app
DB_PASSWORD=change_me_strong_password
DB_NAME=db_pvc_renovee
```

If MariaDB refuses the `root` user with `auth_gssapi_client`, run this SQL once from your database tool before starting the backend:

```text
database/migrations/001_create_app_user.sql
```

## Run

Create or refresh the database from the SQL dump:

```bash
npm run db:setup
```

```bash
npm run dev
```

Verification avant demarrage :

```bash
npm run check
npm test
```

Backup SQL avec les donnees :

```bash
npm run db:backup
```

Health checks:

```text
GET /api/health
GET /api/db/health
```

La liste des routes et des regles metier est documentee dans `../docs/architecture/api-backend.md`.
