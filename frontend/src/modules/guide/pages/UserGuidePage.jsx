import { useMemo, useState } from "react";
import { BookOpenText, CheckCircle2, MousePointerClick, ShieldCheck } from "lucide-react";
import useAuth from "../../auth/hooks/useAuth";
import Badge from "../../../components/common/Badge";

const commonActions = [
  ["Cloche", "Ouvre l'astuce du jour. Cliquez sur J'ai compris pour la marquer comme lue jusqu'au lendemain."],
  ["Nom et photo", "Ouvre Mon profil pour modifier la photo, le nom, l'email ou le mot de passe."],
  ["Bouton marche/arret", "Ferme la session et retourne a la page de connexion."],
  ["USD / FC", "Change la devise d'affichage disponible dans la barre superieure."],
  ["Menu lateral", "Ouvre le module autorise par votre role. Le lien bleu indique la page active."],
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
      ["Gestion des roles", "Affiche les roles disponibles et le nombre de comptes rattaches."],
      ["Nouveau role", "Cree un profil d'acces avec un nom et une description."],
      ["Crayon role", "Modifie le nom ou la responsabilite d'un role."],
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
    ],
  },
  Comptable: {
    intro: "Saisit les ecritures et produit les etats comptables SYSCOHADA.",
    actions: [
      ["Comptabilite Generale", "Affiche la synthese des debits, credits, journaux et sous-comptes."],
      ["Modifier le taux", "Change le taux USD vers FC enregistre dans MariaDB."],
      ["Nouvelle ecriture", "Ouvre la page de saisie comptable."],
      ["Passer une ecriture", "Choisissez le journal, le compte, la contrepartie, le sens, le montant et la devise, puis validez."],
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
    ],
  },
  Commercial: {
    intro: "Gere les clients, les commandes, les ventes et le suivi commercial.",
    actions: [
      ["Fichier Clients", "Consulte ou ajoute les clients avec leurs conditions de paiement."],
      ["Nouvelle vente", "Selectionnez le client et le produit, indiquez la quantite, le prix et le paiement initial."],
      ["Encaisser reglement", "Ajoute un paiement sur une vente existante."],
      ["Commandes Clients", "Consulte les commandes et leurs statuts."],
      ["Nouvelle commande", "Renseignez le client, le produit, la quantite, la livraison et l'anticipation."],
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
      ["Nouveau produit", "Cree une reference commercialisable avec son prix unitaire."],
      ["Declarer production", "Selectionnez le produit, la quantite et le cout pour augmenter le stock fini."],
      ["Matieres & Reappro", "Consulte les matieres disponibles et declare les sorties autorisees."],
    ],
  },
  "Responsable immobilisations": {
    intro: "Gere le parc industriel et les informations d'amortissement.",
    actions: [
      ["Parc & Amortissements", "Affiche les equipements, leur valeur et leur statut."],
      ["Nouveau materiel", "Renseignez le code, la designation, l'acquisition, la valeur, le taux et la duree."],
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

export default function UserGuidePage() {
  const { user } = useAuth();
  const initialRole = roleGuides[user?.nom_role] ? user.nom_role : "Administrateur";
  const [role, setRole] = useState(initialRole);
  const guide = roleGuides[role];
  const roles = useMemo(() => Object.keys(roleGuides), []);
  return <div className="page">
    <header className="page-header"><div><span className="eyebrow">Aide integree // procedures par acteur</span><h1>Guide d'Utilisation</h1><p>Selectionnez un role pour comprendre ses ecrans, ses boutons et le parcours recommande.</p></div><Badge tone="green"><BookOpenText size={14}/>Guide interne</Badge></header>
    <div className="toolbar"><div className="tabs guide-role-tabs">{roles.map((name) => <button key={name} className={`tab ${role===name?"active":""}`} onClick={()=>setRole(name)}>{name}</button>)}</div></div>
    <section className="panel"><div className="panel-head"><div><h2>{role}</h2><p>{guide.intro}</p></div><ShieldCheck size={20}/></div><div className="guide-list">{guide.actions.map(([button, instruction], index) => <article className="guide-row" key={button}><span className="guide-number">{String(index+1).padStart(2,"0")}</span><div><strong><MousePointerClick/> {button}</strong><p>{instruction}</p></div></article>)}</div></section>
    <section className="panel"><div className="panel-head"><div><h2>Boutons communs</h2><p>Commandes disponibles dans la barre superieure</p></div><CheckCircle2 size={20}/></div><div className="guide-list">{commonActions.map(([button,instruction],index)=><article className="guide-row" key={button}><span className="guide-number">{String(index+1).padStart(2,"0")}</span><div><strong>{button}</strong><p>{instruction}</p></div></article>)}</div></section>
  </div>;
}
