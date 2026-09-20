# Guide frontend par fichier - PVC Management

Ce document est un brief a donner a GPT pour construire le frontend React + Vite proprement, fichier par fichier. Il ne contient pas le code final, mais explique le role de chaque dossier, chaque fichier important, les composants attendus, les pages attendues et la logique a respecter.

## Objectif du frontend

Le frontend doit permettre aux utilisateurs de gerer une entreprise de production et vente de PVC :

- authentification ;
- tableau de bord ;
- clients ;
- commandes ;
- ventes ;
- paiements et creances ;
- stock matieres premieres ;
- production et produits finis ;
- comptabilite ;
- ressources humaines ;
- immobilisations ;
- rapports ;
- administration.

Le frontend doit communiquer avec le backend via une API REST.

URL API conseillee en developpement :

```text
http://localhost:5000/api
```

## Regles generales pour GPT

- Utiliser React + Vite.
- Utiliser une structure modulaire par domaine metier.
- Chaque page doit appeler un service API dedie.
- Les composants communs doivent etre reutilisables.
- Les formulaires doivent gerer chargement, validation, erreur et succes.
- Les listes doivent prevoir recherche, pagination et actions.
- Les pages doivent rester simples, lisibles et professionnelles.
- Ne pas melanger appels API, logique metier lourde et rendu JSX dans un seul composant si le fichier devient trop grand.
- Ne pas coder les donnees en dur sauf pour des placeholders temporaires.
- Utiliser les variables d'environnement pour l'URL API.
- Les routes protegees doivent verifier si l'utilisateur est connecte.
- Les routes par role doivent verifier les permissions.

## Style d'interface attendu

L'application est un outil de gestion interne. Elle doit etre :

- sobre ;
- claire ;
- rapide a parcourir ;
- adaptee a un usage quotidien ;
- organisee autour de tableaux, formulaires, filtres et indicateurs.

Eviter :

- les pages marketing ;
- les gros blocs decoratifs ;
- les animations inutiles ;
- les couleurs trop agressives ;
- les interfaces trop vides.

Preferer :

- sidebar fixe ou semi-fixe ;
- header clair ;
- cartes statistiques simples ;
- tableaux propres ;
- boutons d'action visibles ;
- badges de statut ;
- modales pour confirmations ;
- formulaires bien groupes.

## Variables d'environnement frontend

Fichier :

```text
frontend/.env
```

Contenu attendu :

```text
VITE_API_URL=http://localhost:5000/api
```

Le fichier `frontend/src/services/api.js` doit lire cette variable.

## Dossier public

### `frontend/public/`

Contient les fichiers statiques publics :

- favicon ;
- images publiques si necessaire ;
- fichiers accessibles directement par URL.

Ne pas y mettre les composants React.

## Dossier assets

### `frontend/src/assets/images/`

Contient les images utilisees dans l'application :

- illustrations ;
- photos ;
- images de fond si necessaire.

### `frontend/src/assets/icons/`

Contient les icones locales si l'application n'utilise pas uniquement une librairie d'icones.

### `frontend/src/assets/logos/`

Contient le logo de l'entreprise ou de l'application.

## Composants communs

### `frontend/src/components/common/Button.jsx`

Bouton reutilisable.

Doit gerer :

- texte ;
- icone optionnelle ;
- variantes : principal, secondaire, danger, ghost ;
- etat disabled ;
- etat loading ;
- type `button` ou `submit`.

### `frontend/src/components/common/Input.jsx`

Champ de saisie reutilisable.

Doit gerer :

- label ;
- placeholder ;
- valeur ;
- changement ;
- erreur ;
- type : text, number, password, email, date ;
- disabled.

### `frontend/src/components/common/Select.jsx`

Liste deroulante reutilisable.

Doit gerer :

- label ;
- options ;
- valeur selectionnee ;
- erreur ;
- placeholder ;
- disabled.

### `frontend/src/components/common/Modal.jsx`

Fenetre modale reutilisable.

Doit gerer :

- ouverture ;
- fermeture ;
- titre ;
- contenu ;
- footer avec actions ;
- fermeture par bouton ou overlay si souhaite.

### `frontend/src/components/common/Table.jsx`

Tableau reutilisable.

Doit gerer :

- colonnes ;
- donnees ;
- etat chargement ;
- etat vide ;
- actions par ligne ;
- formatage simple des cellules.

### `frontend/src/components/common/Pagination.jsx`

Pagination reutilisable.

Doit gerer :

- page actuelle ;
- nombre total de pages ;
- changement de page ;
- bouton precedent ;
- bouton suivant.

### `frontend/src/components/common/Badge.jsx`

Badge visuel pour les statuts.

Exemples :

- Actif ;
- Inactif ;
- Paye ;
- Partiel ;
- En attente ;
- Annule ;
- Stock faible.

### `frontend/src/components/common/Loader.jsx`

Indicateur de chargement.

Utilise pendant les appels API.

### `frontend/src/components/common/SearchBar.jsx`

Barre de recherche reutilisable.

Doit gerer :

- texte de recherche ;
- callback de recherche ;
- debounce si possible.

### `frontend/src/components/common/ConfirmDialog.jsx`

Dialogue de confirmation.

Utilise avant :

- suppression ;
- annulation ;
- desactivation ;
- action sensible.

### `frontend/src/components/common/EmptyState.jsx`

Etat vide reutilisable.

Affiche un message simple quand une liste n'a aucune donnee.

## Layout

### `frontend/src/components/layout/Sidebar.jsx`

Menu lateral principal.

Doit afficher les liens vers :

- Dashboard ;
- Clients ;
- Commandes ;
- Ventes ;
- Stock ;
- Production ;
- Comptabilite ;
- RH ;
- Immobilisations ;
- Rapports ;
- Administration.

Doit cacher ou afficher certains liens selon le role si les permissions sont disponibles.

### `frontend/src/components/layout/Header.jsx`

Barre superieure.

Doit afficher :

- titre de la page courante ;
- utilisateur connecte ;
- bouton deconnexion ;
- bouton menu sur mobile si necessaire.

### `frontend/src/components/layout/Footer.jsx`

Pied de page simple.

Peut afficher :

- nom de l'application ;
- annee ;
- version.

### `frontend/src/components/layout/MainLayout.jsx`

Layout principal des pages connectees.

Doit inclure :

- Sidebar ;
- Header ;
- zone de contenu ;
- Footer optionnel.

## Graphiques

### `frontend/src/components/charts/SalesChart.jsx`

Graphique des ventes.

Doit afficher :

- evolution des ventes ;
- total par periode ;
- donnees recues via props.

### `frontend/src/components/charts/StockChart.jsx`

Graphique de stock.

Doit afficher :

- matieres en stock ;
- alertes seuil ;
- mouvements si necessaire.

### `frontend/src/components/charts/FinanceChart.jsx`

Graphique financier.

Doit afficher :

- revenus ;
- charges ;
- resultat ;
- indicateurs comptables.

## Module auth

### `frontend/src/modules/auth/pages/LoginPage.jsx`

Page de connexion.

Doit permettre :

- saisir nom utilisateur ;
- saisir mot de passe ;
- envoyer au backend ;
- afficher erreur si identifiants invalides ;
- stocker token et utilisateur via `AuthContext`.

### `frontend/src/modules/auth/services/auth.api.js`

Services API auth.

Fonctions attendues :

- login ;
- getCurrentUser si le backend le propose ;
- logout cote client si necessaire.

### `frontend/src/modules/auth/hooks/useAuth.js`

Hook pratique pour lire le contexte auth.

Doit retourner :

- utilisateur ;
- token ;
- role ;
- login ;
- logout ;
- isAuthenticated.

## Module dashboard

### `frontend/src/modules/dashboard/pages/DashboardPage.jsx`

Page d'accueil apres connexion.

Doit afficher :

- statistiques principales ;
- ventes recentes ;
- alertes de stock ;
- indicateurs financiers.

### `frontend/src/modules/dashboard/components/StatCard.jsx`

Carte statistique.

Props attendues :

- titre ;
- valeur ;
- icone ;
- variation ;
- couleur.

### `frontend/src/modules/dashboard/components/RecentSales.jsx`

Liste des ventes recentes.

### `frontend/src/modules/dashboard/components/StockAlerts.jsx`

Liste des alertes de stock.

### `frontend/src/modules/dashboard/services/dashboard.api.js`

Appels API du dashboard.

Fonctions attendues :

- recuperer statistiques ;
- recuperer ventes recentes ;
- recuperer alertes stock.

## Module clients

### `frontend/src/modules/clients/pages/ClientsPage.jsx`

Liste des clients.

Doit gerer :

- tableau ;
- recherche ;
- pagination ;
- bouton nouveau client ;
- actions voir, modifier, supprimer/desactiver.

### `frontend/src/modules/clients/pages/NewClientPage.jsx`

Creation d'un client.

Utilise `ClientForm`.

### `frontend/src/modules/clients/pages/ClientDetailsPage.jsx`

Details client.

Doit afficher :

- informations client ;
- commandes ;
- ventes ;
- paiements ;
- creances.

### `frontend/src/modules/clients/components/ClientForm.jsx`

Formulaire client.

Champs attendus :

- code ;
- raison sociale ;
- adresse ;
- telephone si ajoute au backend ;
- conditions paiement.

### `frontend/src/modules/clients/services/clients.api.js`

Fonctions API attendues :

- listClients ;
- getClient ;
- createClient ;
- updateClient ;
- deleteClient ou disableClient.

## Module commandes

### Pages commandes

Fichiers :

- `CommandesPage.jsx`
- `NewCommandePage.jsx`
- `CommandeDetailsPage.jsx`

Responsabilites :

- lister les commandes ;
- creer une commande ;
- consulter les details ;
- gerer le statut ;
- afficher les lignes de commande.

### Composants commandes

Fichiers :

- `CommandeForm.jsx`
- `CommandeItems.jsx`

Responsabilites :

- formulaire entete commande ;
- selection client ;
- date commande ;
- date livraison prevue ;
- statut ;
- ajout produits ;
- quantites ;
- prix unitaires ;
- total.

### `frontend/src/modules/commandes/services/commandes.api.js`

Fonctions API attendues :

- listCommandes ;
- getCommande ;
- createCommande ;
- updateCommande ;
- updateCommandeStatus ;
- deleteCommande si autorise.

## Module ventes

### Pages ventes

Fichiers :

- `VentesPage.jsx`
- `NewVentePage.jsx`
- `VenteDetailsPage.jsx`
- `PaiementsPage.jsx`
- `CreancesPage.jsx`

Responsabilites :

- lister les ventes ;
- creer une vente ;
- consulter une vente ;
- gerer les paiements ;
- consulter les creances.

### Composants ventes

Fichiers :

- `VenteForm.jsx`
- `VenteItems.jsx`
- `PaiementForm.jsx`

Responsabilites :

- selection client ;
- type paiement ;
- produits vendus ;
- quantites ;
- prix ;
- montant total ;
- montant paye ;
- reste a payer.

### `frontend/src/modules/ventes/services/ventes.api.js`

Fonctions API attendues :

- listVentes ;
- getVente ;
- createVente ;
- updateVente ;
- listPaiements ;
- createPaiement ;
- listCreances.

## Module stock

### Pages stock

Fichiers :

- `StockDashboard.jsx`
- `MatieresPremieresPage.jsx`
- `EntreesStockPage.jsx`
- `SortiesStockPage.jsx`
- `EtatStockPage.jsx`
- `StockAlertsPage.jsx`

Responsabilites :

- tableau de bord stock ;
- gestion matieres premieres ;
- entrees stock ;
- sorties stock ;
- etat stock ;
- alertes seuil.

### Composants stock

Fichiers :

- `MatiereForm.jsx`
- `EntreeStockForm.jsx`
- `SortieStockForm.jsx`

Responsabilites :

- formulaire matiere premiere ;
- formulaire entree stock ;
- formulaire sortie stock.

### `frontend/src/modules/stock/services/stock.api.js`

Fonctions API attendues :

- listMatieres ;
- getMatiere ;
- createMatiere ;
- updateMatiere ;
- createEntreeStock ;
- createSortieStock ;
- getEtatStock ;
- getStockAlerts.

## Module production

### Pages production

Fichiers :

- `ProduitsFinisPage.jsx`
- `ProductionPage.jsx`
- `EntreesProduitsPage.jsx`

Responsabilites :

- gestion produits finis ;
- suivi production ;
- entrees produits finis.

### Composants production

Fichiers :

- `ProduitForm.jsx`
- `ProductionForm.jsx`

Responsabilites :

- formulaire produit fini ;
- formulaire production ou entree produit fini.

### `frontend/src/modules/production/services/production.api.js`

Fonctions API attendues :

- listProduits ;
- getProduit ;
- createProduit ;
- updateProduit ;
- createEntreeProduit ;
- listEntreesProduits.

## Module comptabilite

### Pages comptabilite

Fichiers :

- `ComptabiliteDashboard.jsx`
- `ComptesPage.jsx`
- `SousComptesPage.jsx`
- `JournauxPage.jsx`
- `EcrituresPage.jsx`
- `NewEcriturePage.jsx`
- `JournalOperationsPage.jsx`
- `BalanceGeneralePage.jsx`
- `BalanceComptesPage.jsx`
- `GrandLivrePage.jsx`
- `BilanPage.jsx`
- `CompteResultatPage.jsx`

Responsabilites :

- gerer comptes ;
- gerer sous-comptes ;
- gerer journaux ;
- creer ecritures ;
- consulter etats comptables ;
- afficher bilan et compte resultat.

### Composants comptabilite

Fichiers :

- `CompteForm.jsx`
- `SousCompteForm.jsx`
- `JournalForm.jsx`
- `EcritureForm.jsx`

Responsabilites :

- formulaires des entites comptables ;
- validation montant ;
- debit/credit ;
- journal ;
- sous-compte.

### `frontend/src/modules/comptabilite/services/comptabilite.api.js`

Fonctions API attendues :

- listComptes ;
- createCompte ;
- updateCompte ;
- listSousComptes ;
- createSousCompte ;
- updateSousCompte ;
- listJournaux ;
- createJournal ;
- createEcriture ;
- listEcritures ;
- getJournalOperations ;
- getBalanceGenerale ;
- getBalanceComptes ;
- getBilan ;
- getCompteResultat.

## Module RH

### Pages RH

Fichiers :

- `RhDashboard.jsx`
- `PersonnelPage.jsx`
- `PersonnelDetailsPage.jsx`
- `PostesPage.jsx`
- `AffectationsPage.jsx`
- `PresencesPage.jsx`
- `CongesPage.jsx`
- `RetenuesPage.jsx`
- `AvantagesPage.jsx`
- `PaiePage.jsx`

Responsabilites :

- gerer personnel ;
- gerer postes ;
- affectations ;
- presences ;
- conges ;
- retenues ;
- avantages ;
- paie.

### Composants RH

Fichiers :

- `PersonnelForm.jsx`
- `PosteForm.jsx`
- `PresenceForm.jsx`
- `CongeForm.jsx`

Responsabilites :

- formulaires RH ;
- validation dates ;
- selection agent ;
- selection poste ;
- montant avantage/retenue.

### `frontend/src/modules/rh/services/rh.api.js`

Fonctions API attendues :

- listPersonnel ;
- getPersonnel ;
- createPersonnel ;
- updatePersonnel ;
- listPostes ;
- createPoste ;
- createAffectation ;
- listPresences ;
- createPresence ;
- listConges ;
- createConge ;
- listRetenues ;
- listAvantages ;
- getPaie.

## Module immobilisations

### Pages immobilisations

Fichiers :

- `ImmobilisationsPage.jsx`
- `NewImmobilisationPage.jsx`
- `ImmobilisationDetailsPage.jsx`
- `AmortissementsPage.jsx`

Responsabilites :

- gerer materiels ;
- creer immobilisation ;
- consulter details ;
- consulter plan amortissement.

### Composants immobilisations

Fichiers :

- `MaterielForm.jsx`
- `AmortissementTable.jsx`

Responsabilites :

- formulaire materiel ;
- tableau amortissement ;
- afficher valeur acquisition ;
- afficher amortissement cumule ;
- afficher valeur nette.

### `frontend/src/modules/immobilisations/services/immobilisations.api.js`

Fonctions API attendues :

- listMateriels ;
- getMateriel ;
- createMateriel ;
- updateMateriel ;
- generateAmortissement ;
- getPlanAmortissement.

## Module rapports

### Pages rapports

Fichiers :

- `RapportsPage.jsx`
- `RapportVentesPage.jsx`
- `RapportStockPage.jsx`
- `RapportFinancierPage.jsx`
- `RapportPaiePage.jsx`
- `RapportAmortissementPage.jsx`

Responsabilites :

- centraliser les rapports ;
- filtrer par periode ;
- afficher resultats ;
- proposer export si backend disponible.

### `frontend/src/modules/rapports/services/rapports.api.js`

Fonctions API attendues :

- getRapportVentes ;
- getRapportStock ;
- getRapportFinancier ;
- getRapportPaie ;
- getRapportAmortissement.

## Module administration

### Pages administration

Fichiers :

- `UsersPage.jsx`
- `RolesPage.jsx`
- `SettingsPage.jsx`

Responsabilites :

- gestion utilisateurs ;
- gestion roles ;
- parametres application.

### Composants administration

Fichiers :

- `UserForm.jsx`
- `RoleForm.jsx`

Responsabilites :

- formulaire utilisateur ;
- formulaire role ;
- attribution role ;
- activation/desactivation.

### `frontend/src/modules/administration/services/admin.api.js`

Fonctions API attendues :

- listUsers ;
- getUser ;
- createUser ;
- updateUser ;
- disableUser ;
- listRoles ;
- createRole ;
- updateRole ;
- getSettings ;
- updateSettings.

## Routes

### `frontend/src/routes/AppRoutes.jsx`

Contient toutes les routes React.

Doit separer :

- route login publique ;
- routes protegees ;
- routes par role si necessaire.

Routes principales conseillees :

- `/login`
- `/dashboard`
- `/clients`
- `/clients/new`
- `/clients/:id`
- `/commandes`
- `/commandes/new`
- `/commandes/:id`
- `/ventes`
- `/ventes/new`
- `/ventes/:id`
- `/ventes/paiements`
- `/ventes/creances`
- `/stock`
- `/stock/matieres`
- `/stock/entrees`
- `/stock/sorties`
- `/stock/etat`
- `/stock/alertes`
- `/production`
- `/production/produits`
- `/production/entrees`
- `/comptabilite`
- `/comptabilite/comptes`
- `/comptabilite/sous-comptes`
- `/comptabilite/journaux`
- `/comptabilite/ecritures`
- `/comptabilite/ecritures/new`
- `/comptabilite/journal-operations`
- `/comptabilite/balance-generale`
- `/comptabilite/balance-comptes`
- `/comptabilite/grand-livre`
- `/comptabilite/bilan`
- `/comptabilite/compte-resultat`
- `/rh`
- `/rh/personnel`
- `/rh/personnel/:id`
- `/rh/postes`
- `/rh/affectations`
- `/rh/presences`
- `/rh/conges`
- `/rh/retenues`
- `/rh/avantages`
- `/rh/paie`
- `/immobilisations`
- `/immobilisations/new`
- `/immobilisations/:id`
- `/immobilisations/amortissements`
- `/rapports`
- `/rapports/ventes`
- `/rapports/stock`
- `/rapports/financier`
- `/rapports/paie`
- `/rapports/amortissement`
- `/administration/users`
- `/administration/roles`
- `/administration/settings`

### `frontend/src/routes/ProtectedRoute.jsx`

Protege les pages qui exigent une connexion.

Si l'utilisateur n'est pas connecte :

- rediriger vers `/login`.

### `frontend/src/routes/RoleRoute.jsx`

Protege les pages selon role ou permission.

Si l'utilisateur n'a pas le droit :

- afficher page interdite ou rediriger vers dashboard.

## Contexte global

### `frontend/src/context/AuthContext.jsx`

Gere l'authentification globale.

Doit contenir :

- token ;
- utilisateur ;
- role ;
- login ;
- logout ;
- chargement initial ;
- stockage local si choisi.

## Hooks globaux

### `frontend/src/hooks/useFetch.js`

Hook pour appels API simples.

Doit gerer :

- data ;
- loading ;
- error ;
- refetch.

### `frontend/src/hooks/useDebounce.js`

Hook pour retarder recherche ou filtres.

Utilise par :

- SearchBar ;
- pages listes.

## Services globaux

### `frontend/src/services/api.js`

Client API central.

Doit gerer :

- base URL depuis `VITE_API_URL` ;
- headers JSON ;
- token Authorization ;
- erreurs HTTP ;
- fonctions `get`, `post`, `put`, `patch`, `delete`.

Toutes les APIs modules doivent l'utiliser.

## Utils

### `frontend/src/utils/dates.js`

Fonctions pour :

- format date ;
- format date heure ;
- convertir date input ;
- afficher periode.

### `frontend/src/utils/currency.js`

Fonctions pour :

- format USD ;
- format FC ;
- format montant selon devise.

### `frontend/src/utils/permissions.js`

Fonctions pour :

- verifier un role ;
- verifier une permission ;
- filtrer menu sidebar.

### `frontend/src/utils/formatters.js`

Fonctions generales pour :

- texte vide ;
- numero document ;
- statut ;
- pourcentage ;
- telephone.

## Fichiers racine frontend

### `frontend/src/App.jsx`

Point principal de l'application React.

Doit contenir :

- providers globaux ;
- routes ;
- layout si necessaire.

### `frontend/src/main.jsx`

Point d'entree React.

Doit monter l'application dans le DOM.

### `frontend/package.json`

Doit contenir :

- scripts Vite ;
- dependencies React ;
- dependencies UI si choisies ;
- dependencies routing.

Dependencies probables :

- `react`
- `react-dom`
- `react-router-dom`
- `lucide-react`
- `axios` ou fetch natif via service maison
- librairie charts si necessaire

### `frontend/vite.config.js`

Configuration Vite.

Doit rester simple au debut.

## Ordre conseille pour construire le frontend

1. Installer React + Vite et les dependances.
2. Configurer `api.js`.
3. Configurer `AuthContext`.
4. Construire `LoginPage`.
5. Construire `ProtectedRoute`.
6. Construire `MainLayout`, `Sidebar`, `Header`.
7. Construire `DashboardPage`.
8. Construire les composants communs.
9. Construire module Clients.
10. Construire module Stock.
11. Construire module Production.
12. Construire module Ventes.
13. Construire module Paiements et creances.
14. Construire module Comptabilite.
15. Construire module RH.
16. Construire module Immobilisations.
17. Construire module Rapports.
18. Construire module Administration.

## Contrat attendu entre frontend et backend

Chaque endpoint backend doit retourner une structure stable.

Format conseille en succes :

```json
{
  "status": "success",
  "data": {}
}
```

Format conseille pour liste :

```json
{
  "status": "success",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

Format conseille en erreur :

```json
{
  "status": "error",
  "message": "Message clair"
}
```

## Notes pour GPT

Avant de coder une page, GPT doit verifier :

- quelle API existe cote backend ;
- quels champs existent dans la base ;
- quel acteur utilise la page ;
- quelles actions sont autorisees ;
- quels composants communs existent deja.

Chaque nouveau fichier doit rester coherent avec cette architecture.
