# Acteurs et cas d'utilisation - PVC Management

Ce document sert de base fonctionnelle pour construire le backend proprement. Il décrit les acteurs du système, ce que chacun fait régulièrement, et les modules backend concernés.

## Acteurs principaux

| Acteur | Role dans le systeme | Modules principaux |
|---|---|---|
| Administrateur | Configure le systeme, les utilisateurs, les roles et les droits | Administration, Auth |
| Direction / Gerant | Suit les indicateurs, valide les decisions et consulte les rapports | Dashboard, Rapports, Comptabilite |
| Commercial | Gere les clients, commandes, ventes et creances | Clients, Commandes, Ventes |
| Caissier / Comptable | Enregistre les paiements, ecritures et consulte les etats financiers | Paiements, Comptabilite, Rapports |
| Magasinier | Suit les matieres premieres, entrees, sorties et alertes de stock | Stock |
| Agent d'achat | Enregistre les achats et entrees de matieres premieres | Stock, Achats |
| Responsable production | Gere les produits finis et les entrees en production | Production, Stock |
| Responsable RH | Gere le personnel, presences, conges, postes, paie, avantages et retenues | RH |
| Responsable immobilisations | Gere les materiels et amortissements | Immobilisations |
| Auditeur / Lecteur | Consulte les donnees sans les modifier | Rapports, Dashboard, Comptabilite |

## Administrateur

L'administrateur est le super utilisateur de l'application.

Actions habituelles :

- Se connecter au systeme.
- Creer, modifier, activer ou desactiver un utilisateur.
- Attribuer un role a un utilisateur.
- Gerer les roles et permissions.
- Reinitialiser un mot de passe utilisateur.
- Consulter la liste des utilisateurs.
- Modifier les parametres generaux du systeme.
- Verifier l'etat de la connexion backend/base de donnees.

Modules backend a prevoir :

- `auth`
- `users`
- `administration`

Permissions typiques :

- Lecture, creation, modification et suppression sur les utilisateurs.
- Lecture, creation et modification des roles.
- Acces aux parametres systeme.

## Direction / Gerant

La direction suit l'activite globale et prend les decisions.

Actions habituelles :

- Consulter le tableau de bord general.
- Voir les ventes recentes.
- Voir les alertes de stock.
- Consulter les indicateurs financiers.
- Consulter les creances clients.
- Consulter les dettes fournisseurs si elles sont activees.
- Consulter les rapports de vente, stock, paie, amortissement et finance.
- Suivre le resultat net, le bilan et le compte de resultat.

Modules backend a prevoir :

- `dashboard`
- `rapports`
- `ventes`
- `stock`
- `comptabilite`
- `rh`
- `immobilisations`

Permissions typiques :

- Lecture globale.
- Validation possible selon les besoins metier.
- Pas forcement de suppression.

## Commercial

Le commercial gere la relation client et les operations de vente.

Actions habituelles :

- Creer un client.
- Modifier les informations d'un client.
- Consulter les details d'un client.
- Creer une commande client.
- Ajouter des produits dans une commande.
- Modifier le statut d'une commande.
- Transformer une commande en vente si le processus le permet.
- Enregistrer une vente.
- Ajouter les details d'une vente.
- Consulter les ventes par client.
- Consulter les creances client.

Modules backend a prevoir :

- `clients`
- `commandes`
- `ventes`
- `paiements`

Permissions typiques :

- Lecture et creation sur clients, commandes et ventes.
- Modification limitee sur ses propres operations si necessaire.
- Pas de suppression definitive sans role superieur.

## Caissier / Comptable

Le caissier ou comptable gere les paiements et les mouvements financiers.

Actions habituelles :

- Enregistrer un paiement client.
- Verifier les paiements lies a une vente.
- Consulter les soldes clients.
- Creer une ecriture comptable.
- Choisir le journal comptable.
- Choisir les comptes et sous-comptes.
- Consulter le journal des operations.
- Consulter la balance generale.
- Consulter la balance par compte.
- Consulter le grand livre.
- Consulter le bilan.
- Consulter le compte de resultat.

Modules backend a prevoir :

- `paiements`
- `comptabilite`
- `rapports`

Permissions typiques :

- Lecture et creation sur paiements.
- Lecture et creation sur ecritures comptables.
- Modification limitee des ecritures selon regles de validation.
- Suppression interdite ou reservee a l'administrateur.

## Magasinier

Le magasinier suit les stocks et les mouvements de matieres.

Actions habituelles :

- Creer une matiere premiere.
- Modifier une matiere premiere.
- Consulter le stock actuel.
- Enregistrer une entree de stock.
- Enregistrer une sortie de stock.
- Consulter les mouvements de stock.
- Consulter les alertes de seuil.
- Verifier l'etat du stock avant production.

Modules backend a prevoir :

- `stock`

Permissions typiques :

- Lecture sur stock.
- Creation sur entrees et sorties.
- Modification limitee sur matieres premieres.
- Suppression reservee a un role superieur.

## Agent d'achat

L'agent d'achat gere les fournisseurs ou achats de matieres selon le processus retenu.

Actions habituelles :

- Enregistrer les informations d'un agent ou fournisseur d'achat si necessaire.
- Enregistrer une entree de matiere premiere.
- Renseigner la quantite, le prix unitaire et le montant paye.
- Associer l'entree a une matiere premiere.
- Consulter l'historique des achats.
- Consulter les dettes ou soldes fournisseurs si le module est active.

Modules backend a prevoir :

- `stock`
- `rapports`

Permissions typiques :

- Lecture sur matieres premieres.
- Creation sur entrees de stock.
- Lecture des historiques d'achat.

## Responsable production

Le responsable production transforme les matieres premieres en produits finis.

Actions habituelles :

- Creer un produit fini.
- Modifier un produit fini.
- Enregistrer une entree de produit fini.
- Renseigner la quantite produite.
- Renseigner le cout de production unitaire.
- Consulter le stock des produits finis.
- Verifier la disponibilite des matieres premieres.
- Suivre les entrees de production.

Modules backend a prevoir :

- `production`
- `stock`

Permissions typiques :

- Lecture sur stock matiere.
- Lecture, creation et modification sur produits finis.
- Creation sur entrees de produits finis.

## Responsable RH

Le responsable RH gere les agents et les elements de paie.

Actions habituelles :

- Creer un agent/personnel.
- Modifier les informations d'un agent.
- Consulter le detail d'un agent.
- Creer ou modifier un poste.
- Affecter un agent a un poste.
- Enregistrer une presence.
- Enregistrer une sortie ou absence.
- Gerer les conges.
- Gerer les avantages salariaux.
- Gerer les retenues salariales.
- Consulter la paie du personnel.

Modules backend a prevoir :

- `rh`

Permissions typiques :

- Lecture, creation et modification sur personnel.
- Lecture et creation sur presences.
- Lecture, creation et modification sur conges, retenues et avantages.

## Responsable immobilisations

Le responsable immobilisations gere les materiels et leurs amortissements.

Actions habituelles :

- Creer un materiel.
- Modifier les informations d'un materiel.
- Renseigner la valeur d'acquisition.
- Renseigner la duree d'utilisation.
- Renseigner le mode d'amortissement.
- Generer un plan d'amortissement.
- Consulter le plan d'amortissement.
- Consulter le rapport d'amortissement.

Modules backend a prevoir :

- `immobilisations`
- `rapports`

Permissions typiques :

- Lecture, creation et modification sur materiels.
- Creation sur plans d'amortissement.
- Lecture sur rapports d'amortissement.

## Auditeur / Lecteur

L'auditeur consulte les donnees sans les modifier.

Actions habituelles :

- Consulter les tableaux de bord.
- Consulter les rapports.
- Consulter les historiques.
- Verifier les operations comptables.
- Exporter certains rapports si autorise.

Modules backend a prevoir :

- `dashboard`
- `rapports`
- `comptabilite`
- `ventes`
- `stock`

Permissions typiques :

- Lecture seule.
- Pas de creation.
- Pas de modification.
- Pas de suppression.

## Flux habituels par module

### Authentification

Actions :

- Connexion utilisateur.
- Verification du mot de passe.
- Generation du token.
- Recuperation du profil connecte.
- Deconnexion cote client.

Acteurs :

- Tous les utilisateurs.

### Administration

Actions :

- Gestion des utilisateurs.
- Gestion des roles.
- Activation/desactivation des comptes.
- Attribution des permissions.

Acteurs :

- Administrateur.

### Clients

Actions :

- Creation client.
- Modification client.
- Consultation client.
- Liste et recherche client.
- Verification des ventes et creances d'un client.

Acteurs :

- Commercial.
- Direction.
- Auditeur en lecture seule.

### Commandes

Actions :

- Creation commande.
- Ajout details commande.
- Modification statut commande.
- Consultation commande.
- Suivi livraison ou attente.

Acteurs :

- Commercial.
- Direction.

### Ventes

Actions :

- Creation vente.
- Ajout details vente.
- Calcul montant total.
- Suivi montant paye.
- Suivi credit ou anticipation.
- Consultation historique des ventes.

Acteurs :

- Commercial.
- Caissier / Comptable.
- Direction.

### Paiements

Actions :

- Enregistrement paiement.
- Association paiement a une vente.
- Association paiement a un client.
- Consultation historique des paiements.
- Calcul reste a payer.

Acteurs :

- Caissier / Comptable.
- Direction.

### Stock

Actions :

- Gestion des matieres premieres.
- Entrees de stock.
- Sorties de stock.
- Calcul stock actuel.
- Verification seuil de reapprovisionnement.
- Consultation etat de stock.

Acteurs :

- Magasinier.
- Agent d'achat.
- Responsable production.
- Direction.

### Production

Actions :

- Gestion des produits finis.
- Enregistrement des entrees de produits finis.
- Suivi cout de production.
- Consultation stock produit fini.

Acteurs :

- Responsable production.
- Direction.

### Comptabilite

Actions :

- Gestion comptes.
- Gestion sous-comptes.
- Gestion journaux.
- Creation ecritures.
- Consultation journal operations.
- Consultation balance generale.
- Consultation bilan.
- Consultation compte resultat.

Acteurs :

- Caissier / Comptable.
- Direction.
- Auditeur.

### Ressources humaines

Actions :

- Gestion personnel.
- Gestion postes.
- Affectations.
- Presences.
- Conges.
- Retenues.
- Avantages.
- Paie.

Acteurs :

- Responsable RH.
- Direction.

### Immobilisations

Actions :

- Gestion materiels.
- Generation amortissements.
- Consultation plan amortissement.
- Rapport amortissement.

Acteurs :

- Responsable immobilisations.
- Direction.
- Comptable.

### Rapports

Actions :

- Rapport ventes.
- Rapport stock.
- Rapport financier.
- Rapport paie.
- Rapport amortissement.
- Export eventuel.

Acteurs :

- Direction.
- Comptable.
- Responsable RH pour paie.
- Responsable immobilisations pour amortissement.
- Auditeur en lecture seule.

## Regles backend a garder en tete

- Chaque requete protegee doit verifier l'utilisateur connecte.
- Chaque action sensible doit verifier le role ou la permission.
- Les suppressions doivent etre limitees et idealement remplacees par un statut inactif.
- Les operations financieres et de stock doivent garder un historique.
- Les montants doivent etre calcules cote backend pour eviter les manipulations cote frontend.
- Les routes doivent retourner des erreurs claires et uniformes.
- Les listes doivent supporter pagination, recherche et filtre.
- Les actions critiques doivent etre journalisees.

## Priorite de developpement backend conseillee

1. Authentification et utilisateurs.
2. Roles et permissions.
3. Clients.
4. Stock matieres premieres.
5. Produits finis et production.
6. Commandes et ventes.
7. Paiements.
8. Comptabilite.
9. RH.
10. Immobilisations.
11. Dashboard et rapports.
