# Guide utilisateur PVC Systeme

Ce guide decrit les actions disponibles pour chaque acteur. Une version interactive est accessible dans l'application avec le bouton **Guide d'utilisation**, place en bas du menu lateral. Dans cette page, cliquez sur une rubrique comme **Tableau de Bord** ou **Utilisateurs** pour afficher son contenu, sa fonction et sa procedure. L'ouverture d'une nouvelle rubrique referme automatiquement la precedente.

## Commandes communes

- **Cloche** : ouvre l'astuce du jour. Le bouton **J'ai compris** masque l'astuce jusqu'au lendemain.
- **Nom et photo** : ouvre le profil pour modifier la photo, le nom, l'email et le mot de passe.
- **Bouton marche/arret** : ferme la session.
- **USD / FC** : choisit la devise d'affichage.
- **Menu lateral** : ouvre les modules autorises par le role connecte.

## Administrateur

- **Utilisateurs & Roles** : ouvre la gestion des acces.
- **Nouvel utilisateur** : cree un compte et lui attribue un role.
- **Crayon utilisateur** : modifie le compte, le statut, le role ou le mot de passe.
- **Gestion des roles** : affiche les roles et le nombre d'utilisateurs rattaches.
- **Nouveau role** : cree un nouveau profil d'acces.
- **Crayon role** : modifie le nom ou la description du role.
- **Corbeille role** : supprime un role non utilise.
- **Bloquer utilisateur** : suspend le compte sans supprimer son historique.
- **Bloquer role** : bloque tous les comptes rattaches jusqu'a la reactivation.

## Direction

- **Tableau de Bord** : consulte les indicateurs industriels et financiers.
- **Nouvelle vente PF** : ouvre la creation d'une vente.
- **Ecriture journal** : ouvre la saisie comptable.
- **Rapports** : consulte les syntheses operationnelles et financieres.

## Comptable

- **Comptabilite Generale** : affiche les debits, credits, journaux et sous-comptes.
- **Modifier le taux** : enregistre le taux USD vers FC dans MariaDB.
- **Nouvelle ecriture** : ouvre la saisie d'une piece comptable.
- **Passer une ecriture** : valide le journal, le compte, la contrepartie, le montant et la devise.
- **Journal des operations** : affiche les pieces dans l'ordre chronologique.
- **Grand livre analytique** : regroupe les mouvements par sous-compte.
- **Balance generale** : compare les debits, credits et soldes.
- **Bilan actif / passif** : consulte la situation patrimoniale.

## Caissier

- **Ventes & Factures** : consulte les ventes et les montants payes.
- **Encaisser reglement** : ajoute un paiement a une vente.
- **Reglements clients** : affiche l'historique des encaissements.

## Ressources humaines

- **Personnel & Salaires** : consulte les effectifs et la paie.
- **Nouvel agent** : enregistre un collaborateur.
- **Personnel** : affiche les collaborateurs.
- **Presences** : affiche les pointages.
- **Paie** : consulte les postes et salaires.
- **Nouveau pointage** : enregistre l'arrivee d'un agent puis permet de pointer sa sortie.
- **Creer une paie** : calcule le net et enregistre le paiement mensuel.
- **Bulletin PDF** : telecharge le detail individuel de la paie.

## Commercial

- **Fichier Clients** : consulte ou cree les clients.
- **Fiche client PDF** : exporte les informations, ventes et paiements du client.
- **Nouvelle vente** : enregistre une vente de produit fini.
- **Encaisser reglement** : ajoute un paiement.
- **Commandes Clients** : consulte les commandes.
- **Nouvelle commande** : enregistre une commande et sa livraison prevue.

## Magasinier

- **Matieres & Reappro** : consulte les stocks et les seuils.
- **Nouvelle reception** : augmente le stock apres reception.
- **Declarer sortie** : enregistre une consommation de l'atelier.
- **Reference** : cree une matiere premiere.
- **Tracabilite des flux** : affiche les entrees et sorties.

## Agent d'achat

- **Matieres & Reappro** : controle les besoins d'achat.
- **Nouvelle reception** : enregistre la quantite, le prix et le montant paye.
- **Reference** : ajoute une matiere au catalogue.

## Responsable production

- **Production & Extrusion** : consulte les produits finis et les lots.
- **Nouveau produit** : cree une reference de produit fini.
- **Code automatique** : attribue le prochain code disponible au format `PF-0001`.
- **Etat PDF** : exporte le stock fini et sa valorisation.
- **Declarer production** : augmente le stock apres fabrication.
- **Matieres & Reappro** : consulte les matieres disponibles.

## Responsable immobilisations

- **Parc & Amortissements** : consulte les actifs industriels.
- **Nouveau materiel** : enregistre un equipement et ses parametres d'amortissement.
- **Enregistrer** : cree automatiquement la premiere ligne du plan d'amortissement.

## Auditeur

- **Comptabilite Generale** : consulte la synthese en lecture seule.
- **Journal des operations** : controle les pieces et la chronologie.
- **Grand livre analytique** : verifie les soldes par sous-compte.
- **Balance et Bilan** : analyse les etats financiers.
- **Rapports** : consulte les syntheses disponibles.

## Etats PDF

Les boutons **PDF / Imprimer** et **Etat PDF** generent les journaux, grands livres, balances, bilans, rapports, produits finis, fiches clients, presences, personnel, journaux de paie et bulletins individuels. Chaque fichier contient un titre, une date de generation et une pagination.
