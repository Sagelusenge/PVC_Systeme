# PVC Systeme

Application ERP de gestion industrielle et financiere pour PVC Renovee.

## Modules

- Tableau de bord et indicateurs
- Stocks et mouvements de matieres premieres
- Production et produits finis
- Clients, commandes, ventes et paiements
- Comptabilite SYSCOHADA, journaux, grand livre, balance et bilan
- Ressources humaines et paie
- Immobilisations et amortissements
- Utilisateurs, roles et permissions

## Installation

### Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run db:setup
npm run db:migrate
npm run seed:operational
npm run dev
```

L'API est disponible par defaut sur `http://127.0.0.1:5000/api`.

### Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

L'interface est disponible par defaut sur `http://127.0.0.1:5173`.

## Verification

```powershell
cd backend
npm test
npm run check

cd ../frontend
npm run build
```

Les identifiants de demonstration sont crees par le script `seed:operational`. Changez les mots de passe avant tout deploiement public.
