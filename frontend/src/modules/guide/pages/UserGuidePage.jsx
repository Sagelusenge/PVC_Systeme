import { useMemo, useState } from "react";
import { BookOpenText, CheckCircle2, ChevronDown, MousePointerClick, ShieldCheck } from "lucide-react";
import useAuth from "../../auth/hooks/useAuth";
import Badge from "../../../components/common/Badge";

const commonActions = [
  ["Cloche", "Ouvre l'astuce du jour. Cliquez sur J'ai compris pour la marquer comme lue jusqu'au lendemain."],
  ["Nom et photo", "Ouvre Mon profil pour modifier la photo, le nom, l'email ou le mot de passe."],
  ["Bouton marche/arret", "Ferme la session et retourne a la page de connexion."],
  ["USD / FC", "Change la devise d'affichage disponible dans la barre superieure."],
  ["Menu lateral", "Ouvre le module autorise par votre role. Le lien bleu indique la page active."],
];

const dashboardActions = [
  ["En-tete du cockpit", "Presente la periode suivie et donne acces aux operations rapides."],
  ["Ventes produits finis", "Montre le chiffre d'affaires des ventes du mois et le nombre de factures."],
  ["Resultat net d'exploitation", "Resume le resultat calcule a partir des produits et des charges comptables."],
  ["Creances clients", "Indique tout l'argent facture qui n'a pas encore ete encaisse."],
  ["Stock critique matiere", "Compte les matieres dont la quantite est sous le seuil de securite."],
  ["Graphique ventes, couts et marge", "Compare simplement ce qui est vendu, ce que la fabrication coute et ce qui reste."],
  ["Semaines et infobulle", "Permet de lire les montants semaine par semaine en passant la souris sur le graphique."],
  ["Capacite usine et extrusion", "Affiche le nombre de references de produits finis gerees par l'usine."],
  ["Operations recentes", "Montre les dernieres factures afin de suivre l'activite commerciale."],
  ["Stocks matieres en alerte", "Liste les matieres a reapprovisionner en priorite."],
  ["Effectifs usine", "Affiche le nombre de collaborateurs actifs enregistres dans le systeme."],
  ["Comprendre les couleurs", "Aide a reconnaitre rapidement les informations normales, positives ou urgentes."],
];

const siteGuides = [
  {
    title: "Connexion et navigation",
    summary: "Se connecter, reconnaitre son espace et circuler dans le site.",
    details: ["Chaque utilisateur se connecte avec son email ou son nom d'utilisateur et son mot de passe.", "Le menu affiche uniquement les modules autorises par le role du compte.", "Le lien bleu indique toujours la page actuellement ouverte."],
    steps: ["Saisissez vos identifiants puis cliquez sur Se connecter.", "Choisissez un module dans le menu de gauche.", "Utilisez USD ou FC pour changer la devise d'affichage.", "Cliquez sur votre nom pour modifier votre profil, ou sur le bouton marche/arret pour quitter."],
    result: "Vous ouvrez une session securisee avec uniquement les fonctions autorisees pour votre role.",
  },
  {
    title: "Parcours commercial complet",
    summary: "Comprendre l'ordre client, commande, facture, paiement et comptabilite.",
    details: ["Un client doit d'abord exister dans Fichier Clients.", "Une commande peut contenir plusieurs produits.", "La facture reprend automatiquement les produits et quantites de la commande.", "Le paiement diminue la creance et cree les mouvements comptables necessaires."],
    steps: ["Creez ou recherchez le client.", "Enregistrez sa commande avec tous les produits demandes.", "Dans Ventes et Factures, cliquez sur Facturer une commande.", "Verifiez les lignes reprises puis creez la facture.", "Enregistrez le paiement total ou partiel et imprimez le recu."],
    result: "La commande, la facture, le stock, le solde client, le paiement et la comptabilite restent relies sans double saisie.",
  },
  {
    title: "Fichier Clients",
    summary: "Creer un client, definir son paiement et consulter sa fiche.",
    details: ["La fiche contient le nom, l'adresse, les conditions de paiement et le solde.", "Comptant signifie que le paiement est attendu immediatement.", "Tranche ouvre un champ pour definir le nombre de jours accordes au client."],
    steps: ["Cliquez sur Nouveau client.", "Renseignez le nom ou la raison sociale et l'adresse.", "Choisissez Comptant ou Tranche ; en cas de tranche, indiquez le delai en jours.", "Enregistrez, puis utilisez la recherche pour retrouver le client.", "Utilisez l'icone PDF pour produire sa fiche avec ses operations."],
    result: "Le client devient disponible dans les commandes, les factures et les paiements.",
  },
  {
    title: "Commandes Clients",
    summary: "Enregistrer plusieurs produits et suivre la commande jusqu'a la facture.",
    details: ["Une commande appartient a un seul client mais peut contenir plusieurs produits.", "Le prix total est calcule automatiquement et ne peut pas etre saisi manuellement.", "Le statut indique si la commande attend, est livree, facturee ou annulee."],
    steps: ["Cliquez sur Nouvelle commande et choisissez le client.", "Selectionnez un produit, sa quantite et son prix.", "Cliquez sur Ajouter un produit pour creer autant de lignes que necessaire.", "Verifiez le total, la date de livraison et l'acompte eventuel.", "Enregistrez puis utilisez Modifier, Imprimer, Facturer, Annuler ou Supprimer selon le statut."],
    result: "La commande reste disponible dans Ventes et Factures pour etre transformee en facture avec les memes quantites.",
  },
  {
    title: "Ventes et Factures",
    summary: "Facturer une commande ou enregistrer exceptionnellement une vente directe.",
    details: ["Facturer une commande est le parcours recommande car les lignes sont deja validees.", "Vente directe sert lorsqu'aucune commande n'a ete creee.", "La creation d'une facture met a jour le stock, la creance client et la comptabilite."],
    steps: ["Cliquez sur Facturer une commande.", "Choisissez le client puis la commande en attente.", "Controlez les produits, quantites, prix et total affiches.", "Cliquez sur Creer la facture.", "Retrouvez la facture dans la liste et utilisez l'icone d'impression pour obtenir le PDF."],
    result: "Une facture numerotee est creee, les produits sortent du stock et l'ecriture de vente est comptabilisee.",
  },
  {
    title: "Paiements Clients",
    summary: "Encaisser une facture en une ou plusieurs fois et imprimer le recu.",
    details: ["Le reste a payer correspond au total de la facture moins les paiements deja recus.", "Un paiement partiel conserve la facture ouverte.", "Le paiement total marque la facture comme payee."],
    steps: ["Dans Ventes et Factures, cliquez sur Nouveau paiement.", "Selectionnez la facture encore impayee.", "Saisissez le motif, le montant, la devise et le mode de paiement.", "Enregistrez puis ouvrez l'onglet Paiements recus.", "Imprimez le recu ; utilisez Annuler seulement en cas d'erreur, car une ecriture inverse sera creee."],
    result: "Le paiement diminue la creance du client et alimente automatiquement la caisse ou la banque en comptabilite.",
  },
  {
    title: "Stock des Matieres",
    summary: "Suivre les quantites, receptions, sorties et besoins de reapprovisionnement.",
    details: ["Le stock disponible montre la quantite restante.", "Le CMUP est le cout moyen unitaire pondere utilise pour valoriser la matiere.", "Une alerte apparait lorsque le stock atteint ou passe sous le seuil minimum."],
    steps: ["Creez une nouvelle matiere si la reference n'existe pas.", "Utilisez Nouvelle reception pour ajouter une quantite achetee et son prix.", "Utilisez Nouvelle sortie lorsqu'une matiere est remise a la production.", "Consultez Historique des mouvements pour verifier les entrees et sorties.", "Imprimez l'etat du stock et traitez en priorite les lignes A commander."],
    result: "Les quantites, le cout moyen, la valeur du stock et les alertes sont recalcules apres chaque mouvement.",
  },
  {
    title: "Production et Extrusion",
    summary: "Distinguer une reference produit d'une fabrication reelle.",
    details: ["Ajouter une reference produit cree seulement un article dans le catalogue.", "Enregistrer une fabrication ajoute une quantite reellement produite au stock fini.", "Le cout de fabrication sert au suivi industriel du lot."],
    steps: ["Ajoutez la reference si le produit n'existe pas encore.", "Pour une production reelle, cliquez sur Enregistrer une fabrication.", "Selectionnez le produit, la quantite, l'unite et le cout unitaire.", "Enregistrez puis controlez le nouveau stock dans la liste.", "Utilisez Imprimer le stock pour obtenir l'etat PDF des produits finis."],
    result: "Le produit fabrique entre dans le stock et devient disponible pour les commandes et les ventes.",
  },
  {
    title: "Comptabilite SYSCOHADA",
    summary: "Saisir une operation equilibree et lire les etats comptables.",
    details: ["Chaque operation utilise obligatoirement au moins un compte au debit et un compte au credit.", "Le total des debits doit toujours etre egal au total des credits.", "Les ventes et paiements generent deja leurs ecritures automatiquement."],
    steps: ["Ouvrez Saisie des Ecritures puis Passer une ecriture.", "Choisissez le journal, le numero de piece, le compte a debiter et le compte a crediter.", "Saisissez le montant, la devise, le taux, la date et le libelle.", "Validez puis controlez la piece dans le Journal des operations.", "Utilisez le Grand livre, la Balance et le Bilan pour analyser les comptes."],
    result: "Deux lignes equilibrees sont creees pour la meme piece : une au debit et une au credit.",
  },
  {
    title: "Personnel, Presences et Paie",
    summary: "Gerer les agents depuis leur creation jusqu'au bulletin de paie.",
    details: ["Personnel conserve les informations des agents.", "Presences enregistre l'heure d'arrivee puis l'heure de sortie.", "Paie calcule la base, les avantages, les retenues, le net et le montant paye."],
    steps: ["Creez l'agent dans l'onglet Personnel.", "Chaque jour, utilisez Nouveau pointage pour enregistrer son arrivee puis sa sortie.", "Dans Paie, cliquez sur Creer une paie et choisissez l'agent et la periode.", "Verifiez la base, les avantages, les retenues et le net.", "Enregistrez puis imprimez le bulletin PDF individuel."],
    result: "Le dossier RH, les presences et les paiements de salaire restent consultables par agent et par periode.",
  },
  {
    title: "Parc et Amortissements",
    summary: "Enregistrer un materiel et suivre sa valeur dans le temps.",
    details: ["La valeur d'acquisition est le cout d'achat du materiel.", "Le taux, la duree, le mode et la periodicite servent au calcul de l'amortissement.", "Le statut indique si le materiel est en service, en maintenance, hors service ou vendu."],
    steps: ["Cliquez sur Nouveau materiel.", "Renseignez la designation, la date, la valeur et les parametres d'amortissement.", "Choisissez l'etat actuel puis enregistrez.", "Utilisez le crayon pour corriger les informations autorisees.", "Imprimez le parc pour obtenir un etat avec totaux et signatures."],
    result: "Le materiel entre dans le parc et son plan d'amortissement est initialise.",
  },
  {
    title: "Rapports et Etats de sortie",
    summary: "Consulter, actualiser, exporter et imprimer les donnees officielles.",
    details: ["Les onglets separent ventes, stock, creances, fournisseurs, paie, amortissements, bilan et resultat.", "CSV sert a retravailler les donnees dans un tableur.", "PDF produit un document presente avec le logo, l'en-tete, les totaux et la date."],
    steps: ["Choisissez le rapport voulu dans les onglets.", "Cliquez sur Actualiser pour relire les dernieres donnees.", "Verifiez le nombre de lignes et les totaux affiches.", "Utilisez Exporter CSV pour l'analyse ou Imprimer en PDF pour l'archive et la signature."],
    result: "Vous obtenez un etat a jour sans ressaisir les informations des modules metier.",
  },
  {
    title: "Utilisateurs et Roles",
    summary: "Creer les acces, attribuer les responsabilites et bloquer un compte.",
    details: ["Un utilisateur possede un nom, un email, un mot de passe, un role et un statut.", "Le role determine les pages et actions visibles.", "Bloquer conserve l'historique mais empeche la connexion."],
    steps: ["Creez d'abord le role s'il n'existe pas.", "Cliquez sur Nouvel utilisateur et renseignez ses acces.", "Choisissez un role actif et enregistrez le compte.", "Utilisez le crayon pour modifier et le cadenas pour bloquer ou debloquer.", "Supprimez un role uniquement lorsqu'aucun utilisateur ne lui est rattache."],
    result: "Chaque acteur dispose uniquement des fonctions correspondant a sa responsabilite.",
  },
  {
    title: "Recherche, filtres et icones",
    summary: "Retrouver une donnee et comprendre les actions presentes dans les tableaux.",
    details: ["La zone de recherche filtre les lignes par nom, reference ou client.", "Les listes de statut limitent l'affichage aux elements payes, impayes, actifs ou en attente.", "Le crayon modifie, l'imprimante produit un PDF, la corbeille supprime et le cadenas bloque."],
    steps: ["Saisissez quelques lettres dans la recherche.", "Ajoutez un filtre de statut si la liste reste longue.", "Lisez l'infobulle en laissant la souris sur une icone.", "Verifiez toujours la ligne selectionnee avant une modification, une annulation ou une suppression."],
    result: "Vous trouvez rapidement l'information et utilisez l'action adaptee sans modifier la mauvaise ligne.",
  },
];

const roleGuides = {
  Administrateur: {
    intro: "Configure les comptes, les roles et controle l'ensemble de la plateforme.",
    actions: [
      ["Tableau de Bord", "Consulte les indicateurs consolides, les ventes recentes et les alertes."],
      ["Utilisateurs & Roles", "Ouvre l'administration des acces."],
      ["Utilisateurs", "Affiche tous les comptes et leur statut."],
      ["Nouvel utilisateur", "Saisissez le nom, l'email, le mot de passe, le role et le statut, puis cliquez sur Creer le compte."],
      ["Crayon utilisateur", "Modifie les informations, le role, le statut ou remplace le mot de passe."],
      ["Bloquer utilisateur", "Suspend le compte sans supprimer son historique."],
      ["Gestion des roles", "Affiche les roles disponibles et le nombre de comptes rattaches."],
      ["Nouveau role", "Cree un profil d'acces avec un nom et une description."],
      ["Crayon role", "Modifie le nom ou la responsabilite d'un role."],
      ["Bloquer role", "Bloque tous les comptes rattaches jusqu'a la reactivation du role."],
      ["Corbeille role", "Supprime uniquement un role qui n'est attribue a aucun utilisateur."],
    ],
  },
  Direction: {
    intro: "Supervise les operations, valide les donnees et consulte tous les indicateurs metier.",
    actions: [
      ["Tableau de Bord", "Controle le chiffre d'affaires, les creances, les stocks critiques et la production."],
      ["Nouvelle vente PF", "Ouvre le module commercial pour enregistrer une vente de produit fini."],
      ["Ecriture journal", "Ouvre la saisie d'une nouvelle piece comptable."],
      ["Modules metier", "Consulte Production, Stock, Ventes, Commandes, Clients, RH et Immobilisations."],
      ["Rapports", "Choisit une famille de rapport et consulte les donnees consolidees."],
      ["PDF / Imprimer", "Genere l'etat selectionne dans un fichier PDF telechargeable."],
    ],
  },
  Comptable: {
    intro: "Saisit les ecritures et produit les etats comptables SYSCOHADA.",
    actions: [
      ["Comptabilite Generale", "Affiche la synthese des debits, credits, journaux et sous-comptes."],
      ["Modifier le taux", "Change le taux USD vers FC enregistre dans MariaDB."],
      ["Nouvelle ecriture", "Ouvre la page de saisie comptable."],
      ["Passer une ecriture", "Choisissez le journal, la piece, le compte a debiter, le compte a crediter, le montant et la devise, puis validez."],
      ["Journal des operations", "Affiche chronologiquement toutes les pieces comptabilisees."],
      ["Grand livre analytique", "Regroupe les mouvements et calcule le solde de chaque sous-compte."],
      ["Balance generale", "Compare les debits, credits et soldes par compte ou sous-compte."],
      ["Bilan actif / passif", "Affiche la situation patrimoniale et le controle d'equilibre."],
      ["Parc & Amortissements", "Consulte les actifs et leurs plans d'amortissement."],
    ],
  },
  Caissier: {
    intro: "Enregistre les encaissements et suit les reglements clients.",
    actions: [
      ["Ventes & Factures", "Consulte les ventes, montants payes et creances."],
      ["Encaisser reglement", "Selectionnez la vente, le montant, la devise et le mode, puis confirmez."],
      ["Reglements clients", "Bascule le tableau vers l'historique des encaissements."],
      ["Fichier Clients", "Consulte les informations et soldes des clients."],
    ],
  },
  RH: {
    intro: "Gere le personnel, les presences et les informations de paie.",
    actions: [
      ["Personnel & Salaires", "Affiche les effectifs, presences et donnees salariales."],
      ["Nouvel agent", "Renseignez l'identite, le telephone et l'adresse, puis enregistrez."],
      ["Personnel", "Affiche la liste des collaborateurs et leur statut."],
      ["Presences", "Affiche les pointages d'arrivee, de sortie et les jours feries."],
      ["Paie", "Affiche les postes, salaires et la masse salariale."],
      ["Nouveau pointage", "Enregistre l'arrivee puis permet de pointer la sortie de l'agent."],
      ["Creer une paie", "Calcule et enregistre la paie d'un agent pour une periode."],
      ["Bulletin PDF", "Telecharge le detail individuel de la paie."],
    ],
  },
  Commercial: {
    intro: "Gere les clients, les commandes, les ventes et le suivi commercial.",
    actions: [
      ["Fichier Clients", "Consulte ou ajoute les clients avec leurs conditions de paiement."],
      ["Fiche client PDF", "Exporte le compte, les ventes et les paiements du client."],
      ["Vente directe", "Enregistre une vente sans commande prealable en indiquant le client, le produit, la quantite et le paiement initial."],
      ["Encaisser reglement", "Ajoute un paiement sur une vente existante."],
      ["Commandes Clients", "Consulte les commandes et leurs statuts."],
      ["Nouvelle commande", "Renseignez le client, ajoutez tous les produits demandes, puis verifiez la livraison, l'acompte et le total."],
      ["Livrer et facturer", "Transforme la commande en facture, retire le stock et cree les ecritures comptables automatiquement."],
      ["Actions commande", "Permet de modifier, imprimer, annuler ou supprimer une commande selon son statut."],
    ],
  },
  Magasinier: {
    intro: "Controle les matieres premieres, les receptions et les sorties vers l'atelier.",
    actions: [
      ["Matieres & Reappro", "Affiche le stock, le CMUP et les seuils d'alerte."],
      ["Nouvelle reception", "Selectionnez la matiere, la quantite et le prix pour augmenter le stock."],
      ["Declarer sortie", "Indiquez la matiere et la quantite envoyee en production."],
      ["Reference", "Cree une nouvelle reference de matiere premiere."],
      ["Tracabilite des flux", "Affiche toutes les entrees et sorties classees par date."],
    ],
  },
  "Agent d'achat": {
    intro: "Enregistre les achats et assure le reapprovisionnement des matieres.",
    actions: [
      ["Matieres & Reappro", "Controle les niveaux de stock et les seuils a commander."],
      ["Nouvelle reception", "Enregistre la quantite recue, son unite, son prix et le montant paye."],
      ["Reference", "Ajoute une matiere absente du catalogue."],
      ["Stock critique", "Priorise les references dont le stock est inferieur au seuil."],
    ],
  },
  "Responsable production": {
    intro: "Declare les produits fabriques et suit la disponibilite des lignes.",
    actions: [
      ["Production & Extrusion", "Consulte les produits finis et les derniers lots fabriques."],
      ["Ajouter une reference produit", "Cree une reference commercialisable avec son prix unitaire."],
      ["Imprimer le stock", "Exporte le stock des produits finis et sa valorisation."],
      ["Enregistrer une fabrication", "Selectionnez le produit, la quantite et le cout pour augmenter le stock fini."],
      ["Matieres & Reappro", "Consulte les matieres disponibles et declare les sorties autorisees."],
    ],
  },
  "Responsable immobilisations": {
    intro: "Gere le parc industriel et les informations d'amortissement.",
    actions: [
      ["Parc & Amortissements", "Affiche les equipements, leur valeur et leur statut."],
      ["Nouveau materiel", "Renseignez la designation, l'acquisition, la valeur, le taux et la duree."],
      ["Actions materiel", "Permet de modifier un materiel et, pour la Direction, de le supprimer."],
      ["Imprimer le parc", "Produit un etat professionnel du parc avec l'en-tete de l'entreprise."],
      ["Enregistrer", "Cree l'actif et initialise automatiquement son plan d'amortissement."],
      ["Statut", "Indique si le materiel est en service, en maintenance, hors service ou vendu."],
    ],
  },
  Auditeur: {
    intro: "Consulte les donnees financieres et les rapports sans modifier les operations.",
    actions: [
      ["Comptabilite Generale", "Consulte la synthese et le controle de balance."],
      ["Journal des operations", "Verifie la chronologie, les pieces et les utilisateurs."],
      ["Grand livre analytique", "Controle les cumuls et soldes par sous-compte."],
      ["Balance et Bilan", "Analyse les etats financiers en lecture seule."],
      ["Rapports", "Consulte les syntheses financieres et operationnelles."],
    ],
  },
};

const actionContents = {
  "Tableau de Bord": ["Les indicateurs financiers et operationnels accessibles a votre role.", "Les ventes recentes, les alertes de stock et l'activite de production.", "Lisez d'abord les quatre cartes, puis le graphique et enfin les listes d'alerte."],
  "En-tete du cockpit": ["La periode active indique l'exercice actuellement consulte.", "Nouvelle vente PF ouvre la facturation des produits finis.", "Ecriture journal ouvre une saisie comptable en partie double."],
  "Ventes produits finis": ["Le grand montant est le chiffre d'affaires des factures du mois en cours.", "La petite ligne indique combien de ventes composent ce montant.", "Exemple : 10 000 $US et 40 ventes signifie que 40 factures totalisent 10 000 $US."],
  "Resultat net d'exploitation": ["Un montant positif signifie que les produits sont superieurs aux charges.", "Un montant negatif signifie que les charges sont plus elevees que les produits.", "Un montant nul peut signifier qu'aucun resultat n'est encore disponible pour la periode."],
  "Creances clients": ["Ce montant correspond aux factures qui restent totalement ou partiellement impayees.", "Plus le montant augmente, plus l'entreprise attend de l'argent de ses clients.", "Ouvrez Ventes et Factures, puis Paiements recus, pour enregistrer les encaissements."],
  "Stock critique matiere": ["Zero alerte signifie que toutes les matieres sont au-dessus de leur seuil minimum.", "Une ou plusieurs alertes signifient qu'un reapprovisionnement doit etre prepare.", "Ouvrez Matieres et Reappro pour connaitre les references et quantites concernees."],
  "Graphique ventes, couts et marge": ["La barre bleue represente les ventes : l'argent genere par les produits factures.", "La barre orange represente les couts d'extrusion : l'estimation de ce que la fabrication a coute.", "La ligne verte represente la marge brute : ventes moins couts d'extrusion.", "Exemple : 1 851 $US de ventes moins 1 148 $US de couts donne 703 $US de marge brute."],
  "Semaines et infobulle": ["SEM 1 a SEM 5 representent les semaines de la projection affichee.", "Passez la souris sur une semaine pour voir les trois montants exacts.", "Ce graphique est une projection de pilotage ; les etats comptables restent la reference officielle."],
  "Capacite usine et extrusion": ["Le nombre affiche correspond aux references de produits finis disponibles dans le catalogue.", "Il ne represente pas la quantite physique en stock.", "Ouvrez Production et Extrusion pour consulter le stock de chaque produit et enregistrer une fabrication."],
  "Operations recentes": ["Chaque ligne montre une facture recente avec sa date, son client et son montant.", "Cette zone permet de verifier rapidement que les dernieres ventes ont bien ete enregistrees.", "Ouvrez Ventes et Factures pour imprimer une facture ou enregistrer un paiement."],
  "Stocks matieres en alerte": ["Chaque ligne correspond a une matiere dont le stock disponible est trop faible.", "Traitez d'abord les matieres les plus proches de zero ou necessaires a une fabrication urgente.", "Une reception de matiere met a jour le stock apres son enregistrement."],
  "Effectifs usine": ["Le nombre correspond aux collaborateurs ayant un statut actif.", "Il ne signifie pas que tous sont presents aujourd'hui.", "Ouvrez Personnel et Salaires, puis Presences, pour consulter les pointages du jour."],
  "Comprendre les couleurs": ["Bleu : information principale ou action courante.", "Vert : situation positive, marge ou element actif.", "Orange : montant ou situation qui demande une surveillance.", "Rouge : alerte urgente ou action sensible."],
  "Utilisateurs & Roles": ["Les deux espaces Utilisateurs et Gestion des roles.", "Le nombre de comptes, les statuts actifs ou bloques et les roles attribues.", "Les commandes de creation et de modification des acces."],
  Utilisateurs: ["La liste des comptes avec le nom, l'email, le role et le statut.", "La recherche et les actions de modification disponibles pour chaque ligne."],
  "Nouvel utilisateur": ["Le formulaire d'identite et d'adresse email.", "Le choix du role, du statut et du mot de passe initial."],
  "Crayon utilisateur": ["Les informations actuelles du compte selectionne.", "Les champs autorises pour changer son role, son statut ou son mot de passe."],
  "Bloquer utilisateur": ["Le statut Actif ou Inactif du compte.", "La suspension conserve toutes les operations et permet une reactivation."],
  "Gestion des roles": ["Tous les profils d'acces et leur description.", "Le nombre d'utilisateurs rattaches a chaque role."],
  "Nouveau role": ["Le nom du nouveau profil d'acces.", "La description de ses responsabilites dans l'organisation."],
  "Crayon role": ["Le nom et la description actuels du role.", "Les informations modifiables sans affecter les operations deja enregistrees."],
  "Bloquer role": ["Le statut global du role.", "Les comptes du role bloque ne peuvent plus ouvrir de session."],
  "Corbeille role": ["Une confirmation avant suppression.", "Un blocage automatique lorsque le role est encore attribue a un utilisateur."],
  "Nouvelle vente PF": ["Le module Ventes et Factures avec les commandes a facturer et les ventes directes.", "Les factures, paiements et montants restant a encaisser."],
  "Ecriture journal": ["Le formulaire de piece comptable avec journal, compte a debiter, compte a crediter et montant.", "La creation simultanee des deux lignes de la partie double."],
  "Modules metier": ["Les espaces Production, Stock, Ventes, Commandes, Clients, RH et Immobilisations.", "Uniquement les modules autorises pour le role connecte."],
  Rapports: ["Les rapports de ventes, stock, finance, paie et amortissements autorises.", "Les totaux et tableaux consolides issus des operations enregistrees."],
  "PDF / Imprimer": ["L'etat affiche, son titre et sa date de generation.", "Un tableau pagine pret a etre archive ou imprime."],
  "Comptabilite Generale": ["La synthese des debits, credits et soldes.", "Les raccourcis vers journaux, ecritures, grand livre, balance et bilan."],
  "Modifier le taux": ["Le taux de conversion USD vers FC actuellement utilise.", "Le champ permettant d'enregistrer le nouveau taux pour toute la plateforme."],
  "Nouvelle ecriture": ["Les journaux et sous-comptes disponibles.", "La reference, le libelle, la date, la devise et le montant de la piece."],
  "Passer une ecriture": ["Le recapitulatif du debit et du credit.", "Un message de validation ou l'explication des champs a corriger."],
  "Journal des operations": ["Toutes les pieces classees par date et journal.", "Les references, libelles, montants et auteurs des operations."],
  "Grand livre analytique": ["Les mouvements regroupes par sous-compte.", "Les cumuls debit, credit et le solde calcule pour chaque compte."],
  "Balance generale": ["Les comptes et sous-comptes avec leurs totaux.", "Le controle de l'egalite entre le total des debits et des credits."],
  "Bilan actif / passif": ["Les rubriques de l'actif et du passif.", "Les valeurs consolidees et le controle d'equilibre du bilan."],
  "Balance et Bilan": ["La balance generale et les rubriques du bilan.", "Les controles de soldes disponibles en lecture seule."],
  "Parc & Amortissements": ["Les immobilisations, leur valeur, leur statut et leur date d'acquisition.", "Les plans et montants d'amortissement calcules."],
  "Ventes & Factures": ["Le registre des ventes, les clients, les statuts et les totaux.", "Les montants payes, les creances et les actions d'encaissement."],
  "Encaisser reglement": ["La facture concernee et son reste a payer.", "Le montant, la devise, la date et le mode de paiement."],
  "Reglements clients": ["L'historique de tous les encaissements.", "La facture, le client, le montant et le mode associes a chaque paiement."],
  "Fichier Clients": ["Les coordonnees, conditions de paiement et soldes des clients.", "Les commandes et ventes rattachees au client selectionne."],
  "Fiche client PDF": ["Les informations et le solde du compte client.", "L'historique consolide des ventes et des reglements."],
  "Personnel & Salaires": ["Les effectifs, postes, presences, conges et elements de paie.", "Les indicateurs RH autorises pour votre profil."],
  "Nouvel agent": ["L'identite, les coordonnees et le statut du collaborateur.", "Les informations necessaires a son dossier RH."],
  Personnel: ["La liste des collaborateurs et leurs informations principales.", "L'acces au detail et a la modification des dossiers."],
  Presences: ["Les heures d'arrivee et de sortie par date.", "Les absences, retards et jours feries enregistres."],
  Paie: ["Les postes, salaires, avantages et retenues.", "La masse salariale et les elements servant aux rapports de paie."],
  "Nouveau pointage": ["Les agents actifs et les heures d'arrivee et de sortie.", "Le bouton de sortie reste visible sur chaque pointage ouvert."],
  "Creer une paie": ["Le salaire de base, les avantages, les retenues et le net.", "La periode, la devise, le mode et la reference du paiement."],
  "Bulletin PDF": ["L'agent, la periode et le mode de paiement.", "Le detail base, avantages, retenues, net et montant paye."],
  "Vente directe": ["Le choix du client et du produit fini lorsqu'aucune commande n'existe.", "La quantite, le prix, le mode de vente et le paiement initial."],
  "Commandes Clients": ["Les commandes, dates de livraison et statuts d'avancement.", "Les produits, quantites et clients rattaches."],
  "Nouvelle commande": ["Le client, la date de livraison et toutes les lignes de produits.", "Les quantites, prix, sous-totaux, acompte et total general calcule."],
  "Livrer et facturer": ["La commande en attente et la disponibilite du stock.", "La facture, le paiement initial et les ecritures comptables crees sans double saisie."],
  "Actions commande": ["Les boutons Modifier, Imprimer, Livrer et facturer, Annuler et Supprimer.", "Seules les actions encore possibles selon le statut sont affichees."],
  "Matieres & Reappro": ["Le stock disponible, le CMUP et le seuil d'alerte de chaque matiere.", "Les entrees, sorties et besoins de reapprovisionnement."],
  "Nouvelle reception": ["La reference recue, la quantite, le prix et le fournisseur.", "Le montant paye et la mise a jour prevue du stock."],
  "Declarer sortie": ["La matiere et la quantite remises a la production.", "Le stock restant avant confirmation du mouvement."],
  Reference: ["La designation, l'unite et le seuil d'alerte.", "Les informations necessaires au suivi d'une nouvelle matiere."],
  "Tracabilite des flux": ["Les receptions et sorties classees par date.", "Les quantites, valeurs, references et utilisateurs responsables."],
  "Stock critique": ["Les matieres dont le disponible est inferieur ou proche du seuil.", "Les quantites recommandees pour preparer le reapprovisionnement."],
  "Production & Extrusion": ["Les produits finis, leurs stocks et leurs prix.", "Les derniers lots produits, quantites et couts de fabrication."],
  "Ajouter une reference produit": ["La designation, l'unite et le prix de vente.", "Les informations necessaires a une nouvelle reference finie."],
  "Imprimer le stock": ["Les produits disponibles et leur valorisation.", "Un document avec logo, en-tete, date, pagination et zone de signature."],
  "Enregistrer une fabrication": ["Le produit fabrique, la quantite et le cout du lot.", "L'augmentation de stock fini qui sera appliquee apres validation."],
  "Nouveau materiel": ["La designation, la date et la valeur d'acquisition.", "Le taux, la duree et le statut utilises pour l'amortissement."],
  "Actions materiel": ["Le crayon pour corriger les informations d'un materiel.", "La corbeille, reservee a la Direction, avec confirmation avant suppression."],
  "Imprimer le parc": ["La liste des materiels, les valeurs, les taux et les statuts.", "Un document avec logo, en-tete de l'entreprise, totaux et signatures."],
  Enregistrer: ["Le recapitulatif de l'immobilisation avant creation.", "Le plan d'amortissement initialise automatiquement apres validation."],
  Statut: ["L'etat actuel du materiel.", "Les choix en service, maintenance, hors service ou vendu."],
  Cloche: ["L'astuce d'utilisation attribuee a la journee.", "Le bouton permettant de la marquer comme lue jusqu'au lendemain."],
  "Nom et photo": ["Vos informations personnelles et la photo de profil.", "Les champs de changement de nom, d'email et de mot de passe."],
  "Bouton marche/arret": ["La commande de deconnexion de la session en cours.", "Le retour automatique vers l'ecran de connexion."],
  "USD / FC": ["Les deux devises d'affichage disponibles.", "La conversion immediate des montants affiches sans modifier les donnees sources."],
  "Menu lateral": ["Les modules auxquels votre role donne acces.", "Le lien actif en bleu et le guide place en derniere position."],
};

function GuideAccordion({ items, section, role, openItem, onToggle }) {
  const isDashboard = section === "dashboard";
  return <div className="guide-list">
    {items.map(([button, instruction], index) => {
      const itemId = `${section}-${role}-${index}`;
      const isOpen = openItem === itemId;
      const contents = actionContents[button] || [instruction];
      return <article className={`guide-row ${isOpen ? "open" : ""}`} key={`${button}-${index}`}>
        <button className="guide-trigger" type="button" aria-expanded={isOpen} aria-controls={`${itemId}-content`} onClick={() => onToggle(itemId)}>
          <span className="guide-number">{String(index + 1).padStart(2, "0")}</span>
          <span className="guide-label"><strong><MousePointerClick /> {button}</strong><small>{instruction}</small></span>
          <ChevronDown className="guide-chevron" aria-hidden="true" />
        </button>
        {isOpen && <div className="guide-content" id={`${itemId}-content`}>
          <div className="guide-detail"><h3>{isDashboard ? "Ce que cela signifie" : "Ce que vous trouverez"}</h3><ul>{contents.map((content) => <li key={content}>{content}</li>)}</ul></div>
          <div className="guide-detail"><h3>{isDashboard ? "Comment le lire" : "Comment l'utiliser"}</h3>{isDashboard ? <ol><li>Lisez le grand nombre ou le titre principal.</li><li>Regardez la petite phrase situee juste en dessous pour comprendre la periode ou le detail.</li><li>Utilisez l'explication ci-contre pour savoir si une action est necessaire.</li></ol> : <ol><li>Ouvrez <strong>{button}</strong> depuis le menu ou le bouton indique.</li><li>Consultez les informations affichees et completez les champs demandes si l'action autorise une saisie.</li><li>Verifiez le resultat, puis utilisez le bouton de validation ou revenez au module sans enregistrer.</li></ol>}</div>
          <div className="guide-result"><CheckCircle2 /> <span><strong>{isDashboard ? "A retenir :" : "Resultat attendu :"}</strong> {instruction}</span></div>
        </div>}
      </article>;
    })}
  </div>;
}

function SiteGuideAccordion({ items, openItem, onToggle }) {
  return <div className="guide-list">
    {items.map((item, index) => {
      const itemId = `site-module-${index}`;
      const isOpen = openItem === itemId;
      return <article className={`guide-row ${isOpen ? "open" : ""}`} key={item.title}>
        <button className="guide-trigger" type="button" aria-expanded={isOpen} aria-controls={`${itemId}-content`} onClick={() => onToggle(itemId)}>
          <span className="guide-number">{String(index + 1).padStart(2, "0")}</span>
          <span className="guide-label"><strong><MousePointerClick /> {item.title}</strong><small>{item.summary}</small></span>
          <ChevronDown className="guide-chevron" aria-hidden="true" />
        </button>
        {isOpen && <div className="guide-content" id={`${itemId}-content`}>
          <div className="guide-detail"><h3>A quoi sert cet espace</h3><ul>{item.details.map((detail) => <li key={detail}>{detail}</li>)}</ul></div>
          <div className="guide-detail"><h3>Parcours recommande</h3><ol>{item.steps.map((step) => <li key={step}>{step}</li>)}</ol></div>
          <div className="guide-result"><CheckCircle2 /> <span><strong>Apres validation :</strong> {item.result}</span></div>
        </div>}
      </article>;
    })}
  </div>;
}

export default function UserGuidePage() {
  const { user } = useAuth();
  const initialRole = roleGuides[user?.nom_role] ? user.nom_role : "Administrateur";
  const [role, setRole] = useState(initialRole);
  const [openItem, setOpenItem] = useState(null);
  const guide = roleGuides[role];
  const roles = useMemo(() => Object.keys(roleGuides), []);
  return <div className="page">
    <header className="page-header"><div><span className="eyebrow">Aide integree // manuel complet</span><h1>Guide d'Utilisation</h1><p>Comprenez toute la plateforme, ses parcours, ses boutons et les responsabilites de chaque acteur.</p></div><Badge tone="green"><BookOpenText size={14}/>Guide interne</Badge></header>
    <div className="toolbar"><div className="tabs guide-role-tabs">{roles.map((name) => <button key={name} className={`tab ${role===name?"active":""}`} onClick={()=>{ setRole(name); setOpenItem(null); }}>{name}</button>)}</div></div>
    <section className="panel"><div className="panel-head"><div><h2>Manuel complet de la plateforme</h2><p>Ouvrez un module pour connaitre son objectif, le parcours recommande et le resultat obtenu.</p></div><BookOpenText size={20}/></div><SiteGuideAccordion items={siteGuides} openItem={openItem} onToggle={(itemId) => setOpenItem((current) => current === itemId ? null : itemId)} /></section>
    <section className="panel"><div className="panel-head"><div><h2>Comprendre le tableau de bord</h2><p>Lisez chaque element dans l'ordre. Cliquez sur une ligne pour obtenir une explication simple et savoir quoi faire.</p></div><BookOpenText size={20}/></div><GuideAccordion items={dashboardActions} section="dashboard" role="general" openItem={openItem} onToggle={(itemId) => setOpenItem((current) => current === itemId ? null : itemId)} /></section>
    <section className="panel"><div className="panel-head"><div><h2>{role}</h2><p>{guide.intro}</p></div><ShieldCheck size={20}/></div><GuideAccordion items={guide.actions} section="role" role={role} openItem={openItem} onToggle={(itemId) => setOpenItem((current) => current === itemId ? null : itemId)} /></section>
    <section className="panel"><div className="panel-head"><div><h2>Boutons communs</h2><p>Commandes disponibles dans la barre superieure</p></div><CheckCircle2 size={20}/></div><GuideAccordion items={commonActions} section="common" role={role} openItem={openItem} onToggle={(itemId) => setOpenItem((current) => current === itemId ? null : itemId)} /></section>
  </div>;
}
