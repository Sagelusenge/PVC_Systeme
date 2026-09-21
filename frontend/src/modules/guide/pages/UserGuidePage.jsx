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

const actionContents = {
  "Tableau de Bord": ["Les indicateurs financiers et operationnels accessibles a votre role.", "Les ventes recentes, les alertes de stock et l'activite de production.", "Des raccourcis vers les operations que vous utilisez le plus souvent."],
  "Utilisateurs & Roles": ["Les deux espaces Utilisateurs et Gestion des roles.", "Le nombre de comptes, les statuts actifs ou bloques et les roles attribues.", "Les commandes de creation et de modification des acces."],
  Utilisateurs: ["La liste des comptes avec le nom, l'email, le role et le statut.", "La recherche et les actions de modification disponibles pour chaque ligne."],
  "Nouvel utilisateur": ["Le formulaire d'identite et d'adresse email.", "Le choix du role, du statut et du mot de passe initial."],
  "Crayon utilisateur": ["Les informations actuelles du compte selectionne.", "Les champs autorises pour changer son role, son statut ou son mot de passe."],
  "Gestion des roles": ["Tous les profils d'acces et leur description.", "Le nombre d'utilisateurs rattaches a chaque role."],
  "Nouveau role": ["Le nom du nouveau profil d'acces.", "La description de ses responsabilites dans l'organisation."],
  "Crayon role": ["Le nom et la description actuels du role.", "Les informations modifiables sans affecter les operations deja enregistrees."],
  "Corbeille role": ["Une confirmation avant suppression.", "Un blocage automatique lorsque le role est encore attribue a un utilisateur."],
  "Nouvelle vente PF": ["Le formulaire client, produit, quantite, prix et paiement initial.", "Le total calcule avant validation de la facture."],
  "Ecriture journal": ["Le formulaire de piece comptable avec journal, comptes, sens et montant.", "Le controle debit-credit avant enregistrement."],
  "Modules metier": ["Les espaces Production, Stock, Ventes, Commandes, Clients, RH et Immobilisations.", "Uniquement les modules autorises pour le role connecte."],
  Rapports: ["Les rapports de ventes, stock, finance, paie et amortissements autorises.", "Les totaux et tableaux consolides issus des operations enregistrees."],
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
  "Personnel & Salaires": ["Les effectifs, postes, presences, conges et elements de paie.", "Les indicateurs RH autorises pour votre profil."],
  "Nouvel agent": ["L'identite, les coordonnees et le statut du collaborateur.", "Les informations necessaires a son dossier RH."],
  Personnel: ["La liste des collaborateurs et leurs informations principales.", "L'acces au detail et a la modification des dossiers."],
  Presences: ["Les heures d'arrivee et de sortie par date.", "Les absences, retards et jours feries enregistres."],
  Paie: ["Les postes, salaires, avantages et retenues.", "La masse salariale et les elements servant aux rapports de paie."],
  "Nouvelle vente": ["Le choix du client et du produit fini.", "La quantite, le prix, le mode de vente et le paiement initial."],
  "Commandes Clients": ["Les commandes, dates de livraison et statuts d'avancement.", "Les produits, quantites et clients rattaches."],
  "Nouvelle commande": ["Le formulaire client, produit, quantite et date de livraison.", "Les informations d'anticipation necessaires a la production."],
  "Matieres & Reappro": ["Le stock disponible, le CMUP et le seuil d'alerte de chaque matiere.", "Les entrees, sorties et besoins de reapprovisionnement."],
  "Nouvelle reception": ["La reference recue, la quantite, le prix et le fournisseur.", "Le montant paye et la mise a jour prevue du stock."],
  "Declarer sortie": ["La matiere et la quantite remises a la production.", "Le stock restant avant confirmation du mouvement."],
  Reference: ["Le code, la designation, l'unite et le seuil d'alerte.", "Les informations necessaires au suivi d'une nouvelle matiere."],
  "Tracabilite des flux": ["Les receptions et sorties classees par date.", "Les quantites, valeurs, references et utilisateurs responsables."],
  "Stock critique": ["Les matieres dont le disponible est inferieur ou proche du seuil.", "Les quantites recommandees pour preparer le reapprovisionnement."],
  "Production & Extrusion": ["Les produits finis, leurs stocks et leurs prix.", "Les derniers lots produits, quantites et couts de fabrication."],
  "Nouveau produit": ["Le code, la designation, l'unite et le prix de vente.", "Les informations necessaires a une nouvelle reference finie."],
  "Declarer production": ["Le produit fabrique, la quantite et le cout du lot.", "L'augmentation de stock fini qui sera appliquee apres validation."],
  "Nouveau materiel": ["Le code, la designation, la date et la valeur d'acquisition.", "Le taux, la duree et le statut utilises pour l'amortissement."],
  Enregistrer: ["Le recapitulatif de l'immobilisation avant creation.", "Le plan d'amortissement initialise automatiquement apres validation."],
  Statut: ["L'etat actuel du materiel.", "Les choix en service, maintenance, hors service ou vendu."],
  Cloche: ["L'astuce d'utilisation attribuee a la journee.", "Le bouton permettant de la marquer comme lue jusqu'au lendemain."],
  "Nom et photo": ["Vos informations personnelles et la photo de profil.", "Les champs de changement de nom, d'email et de mot de passe."],
  "Bouton marche/arret": ["La commande de deconnexion de la session en cours.", "Le retour automatique vers l'ecran de connexion."],
  "USD / FC": ["Les deux devises d'affichage disponibles.", "La conversion immediate des montants affiches sans modifier les donnees sources."],
  "Menu lateral": ["Les modules auxquels votre role donne acces.", "Le lien actif en bleu et le guide place en derniere position."],
};

function GuideAccordion({ items, section, role, openItem, onToggle }) {
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
          <div className="guide-detail"><h3>Ce que vous trouverez</h3><ul>{contents.map((content) => <li key={content}>{content}</li>)}</ul></div>
          <div className="guide-detail"><h3>Comment l'utiliser</h3><ol><li>Ouvrez <strong>{button}</strong> depuis le menu ou le bouton indique.</li><li>Consultez les informations affichees et completez les champs demandes si l'action autorise une saisie.</li><li>Verifiez le resultat, puis utilisez le bouton de validation ou revenez au module sans enregistrer.</li></ol></div>
          <div className="guide-result"><CheckCircle2 /> <span><strong>Resultat attendu :</strong> {instruction}</span></div>
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
    <header className="page-header"><div><span className="eyebrow">Aide integree // procedures par acteur</span><h1>Guide d'Utilisation</h1><p>Selectionnez un role pour comprendre ses ecrans, ses boutons et le parcours recommande.</p></div><Badge tone="green"><BookOpenText size={14}/>Guide interne</Badge></header>
    <div className="toolbar"><div className="tabs guide-role-tabs">{roles.map((name) => <button key={name} className={`tab ${role===name?"active":""}`} onClick={()=>{ setRole(name); setOpenItem(null); }}>{name}</button>)}</div></div>
    <section className="panel"><div className="panel-head"><div><h2>{role}</h2><p>{guide.intro}</p></div><ShieldCheck size={20}/></div><GuideAccordion items={guide.actions} section="role" role={role} openItem={openItem} onToggle={(itemId) => setOpenItem((current) => current === itemId ? null : itemId)} /></section>
    <section className="panel"><div className="panel-head"><div><h2>Boutons communs</h2><p>Commandes disponibles dans la barre superieure</p></div><CheckCircle2 size={20}/></div><GuideAccordion items={commonActions} section="common" role={role} openItem={openItem} onToggle={(itemId) => setOpenItem((current) => current === itemId ? null : itemId)} /></section>
  </div>;
}
