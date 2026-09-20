# API backend PVC Management

Base locale : `http://localhost:5000/api`

Toutes les routes, sauf les controles de sante et la connexion, exigent l'en-tete :

```text
Authorization: Bearer <token>
```

## Authentification et administration

| Methode | Route | Usage |
|---|---|---|
| POST | `/auth/login` | Connexion |
| GET | `/auth/me` | Profil connecte |
| POST | `/auth/logout` | Deconnexion cote client |
| GET/POST | `/users` | Lister ou creer les utilisateurs |
| GET/PATCH/DELETE | `/users/:id` | Lire, modifier ou desactiver un utilisateur |
| GET | `/users/roles` | Roles disponibles |

## Metier

| Module | Routes principales |
|---|---|
| Clients | `/clients`, `/clients/:id/historique` |
| Commandes | `/commandes`, `/commandes/:id` |
| Ventes | `/ventes`, `/ventes/:id` |
| Paiements | `/paiements`, `/paiements/:id/annuler` |
| Stock | `/stock/matieres`, `/stock/entrees`, `/stock/sorties`, `/stock/mouvements`, `/stock/alertes`, `/stock/agents-achat` |
| Production | `/production/produits`, `/production/entrees` |
| Comptabilite | `/comptabilite/comptes`, `/sous-comptes`, `/journaux`, `/ecritures`, `/balance-generale`, `/bilan`, `/compte-resultat` |
| RH | `/rh/personnel`, `/postes`, `/affectations`, `/presences`, `/conges`, `/demandes-conges`, `/retenues`, `/avantages`, `/paie` |
| Immobilisations | `/immobilisations/materiels`, `/immobilisations/plans`, `/immobilisations/materiels/:id/plan` |
| Pilotage | `/dashboard`, `/rapports`, `/rapports/:nom` |

Les listes acceptent `page`, `limit`, `q` et les filtres correspondant aux colonnes du module. La reponse uniforme contient `status`, `message`, `data` et, pour les listes, `meta`.

## Regles importantes

- Le backend recalcule les totaux de commande et de vente depuis les lignes.
- Une vente refuse une quantite superieure au stock de produits finis.
- Une sortie refuse une quantite superieure au stock de matiere.
- Les entrees de matiere recalculent le cout moyen unitaire pondere.
- Les paiements mettent a jour la vente et le solde du client dans une transaction.
- `DELETE /users/:id` desactive le compte au lieu de supprimer son historique.
- Les actions d'ecriture reussies sont journalisees dans `taudit_logs`.

## Commandes utiles

```bash
npm run db:setup
npm run db:migrate
npm run db:check
npm run check
npm test
npm run db:backup
npm run dev
```
