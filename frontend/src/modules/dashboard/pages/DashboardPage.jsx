import { useNavigate } from "react-router-dom";
import { Banknote, BookOpenCheck, Boxes, CircleDollarSign, ClipboardList, Factory, Landmark, PackageX, PlusCircle, ShieldCheck, Truck, UsersRound, Wrench } from "lucide-react";
import useFetch from "../../../hooks/useFetch";
import useAuth from "../../auth/hooks/useAuth";
import { getDashboard, getStockAlerts } from "../services/dashboard.api";
import Loader from "../../../components/common/Loader";
import Button from "../../../components/common/Button";
import Badge from "../../../components/common/Badge";
import StatCard from "../components/StatCard";
import RecentSales from "../components/RecentSales";
import StockAlerts from "../components/StockAlerts";
import SalesChart from "../../../components/charts/SalesChart";
import { formatCurrency } from "../../../utils/currency";
import { canAccessModule } from "../../../utils/permissions";

const metric = (label, value, detail, icon, tone) => ({ label, value, detail, icon, tone });

function dashboardFor(role, data) {
  const common = {
    eyebrow: "Tableau de bord personnel",
    title: "Vue générale",
    description: "Les indicateurs essentiels correspondant à vos responsabilités.",
    action: { label: "Consulter les ventes", path: "/ventes", icon: CircleDollarSign },
    mode: "sales",
  };
  const configs = {
    Administrateur: {
      title: "Administration de la plateforme", description: "Comptes, activité générale et disponibilité des données.", action: { label: "Gérer les utilisateurs", path: "/administration", icon: ShieldCheck }, mode: "admin",
      metrics: [metric("Utilisateurs actifs", data.utilisateurs_actifs || 0, "Comptes autorisés", UsersRound, "green"), metric("Clients", data.clients?.nombre || 0, "Comptes commerciaux", CircleDollarSign), metric("Personnel actif", data.personnel_actif || 0, "Collaborateurs enregistrés", UsersRound), metric("Alertes de stock", data.alertes_stock || 0, "Matières à commander", PackageX, data.alertes_stock ? "red" : "green")],
    },
    Direction: {
      title: "Pilotage de l'entreprise", description: "Ventes, trésorerie, commandes et ressources consolidées.", action: { label: "Voir les rapports", path: "/rapports", icon: Landmark }, mode: "sales",
      metrics: [metric("Ventes du mois", formatCurrency(data.ventes_mois?.chiffre_affaires), `${data.ventes_mois?.nombre || 0} factures`, CircleDollarSign), metric("Encaissements du mois", formatCurrency(data.paiements_mois?.montant), `${data.paiements_mois?.nombre || 0} paiements`, Banknote, "green"), metric("Créances clients", formatCurrency(data.creances_clients), "Reste à recouvrer", CircleDollarSign, "orange"), metric("Commandes en attente", data.commandes_attente?.nombre || 0, formatCurrency(data.commandes_attente?.montant), ClipboardList)],
    },
    Comptable: {
      title: "Suivi comptable", description: "Écritures, équilibre des mouvements et créances à contrôler.", action: { label: "Passer une écriture", path: "/comptabilite/ecritures", icon: BookOpenCheck }, mode: "accounting",
      metrics: [metric("Débits du mois", formatCurrency(data.comptabilite_mois?.debit), "Mouvements débiteurs", Landmark), metric("Crédits du mois", formatCurrency(data.comptabilite_mois?.credit), "Mouvements créditeurs", Landmark, "green"), metric("Créances clients", formatCurrency(data.creances_clients), "À recouvrer", CircleDollarSign, "orange"), metric("Immobilisations", formatCurrency(data.immobilisations?.valeur), `${data.immobilisations?.nombre || 0} matériels`, Wrench)],
    },
    Auditeur: {
      title: "Contrôle et audit", description: "Équilibre comptable, ventes et actifs à examiner.", action: { label: "Ouvrir la balance", path: "/comptabilite/balance", icon: Landmark }, mode: "accounting",
      metrics: [metric("Débits", formatCurrency(data.comptabilite_mois?.debit), "Période en cours", Landmark), metric("Crédits", formatCurrency(data.comptabilite_mois?.credit), "Période en cours", Landmark, "green"), metric("Factures du mois", data.ventes_mois?.nombre || 0, formatCurrency(data.ventes_mois?.chiffre_affaires), CircleDollarSign), metric("Actifs suivis", data.immobilisations?.nombre || 0, formatCurrency(data.immobilisations?.valeur), Wrench)],
    },
    Caissier: {
      title: "Caisse et encaissements", description: "Paiements reçus, factures ouvertes et clients à servir.", action: { label: "Enregistrer un paiement", path: "/ventes", icon: Banknote }, mode: "sales",
      metrics: [metric("Encaissements du mois", formatCurrency(data.paiements_mois?.montant), `${data.paiements_mois?.nombre || 0} paiements`, Banknote, "green"), metric("Créances", formatCurrency(data.creances_clients), "Paiements attendus", CircleDollarSign, "orange"), metric("Clients", data.clients?.nombre || 0, "Comptes enregistrés", UsersRound), metric("Factures du mois", data.ventes_mois?.nombre || 0, formatCurrency(data.ventes_mois?.chiffre_affaires), CircleDollarSign)],
    },
    Commercial: {
      title: "Activité commerciale", description: "Commandes clients, facturation et recouvrement.", action: { label: "Nouvelle commande", path: "/commandes", icon: PlusCircle }, mode: "sales",
      metrics: [metric("Commandes à facturer", data.commandes_attente?.nombre || 0, formatCurrency(data.commandes_attente?.montant), Truck, "orange"), metric("Ventes du mois", formatCurrency(data.ventes_mois?.chiffre_affaires), `${data.ventes_mois?.nombre || 0} factures`, CircleDollarSign), metric("Clients", data.clients?.nombre || 0, "Portefeuille actif", UsersRound), metric("Créances", formatCurrency(data.creances_clients), "À suivre", Banknote, "orange")],
    },
    RH: {
      title: "Personnel et paie", description: "Effectifs, présences du jour et paiements de salaires.", action: { label: "Gérer le personnel", path: "/rh", icon: UsersRound }, mode: "staff",
      metrics: [metric("Personnel actif", data.personnel_actif || 0, "Collaborateurs", UsersRound), metric("Présents aujourd'hui", data.presences_jour || 0, "Pointages enregistrés", UsersRound, "green"), metric("Paies du mois", data.paies_mois?.nombre || 0, formatCurrency(data.paies_mois?.montant), Banknote), metric("Comptes utilisateurs", data.utilisateurs_actifs || 0, "Accès actifs", ShieldCheck)],
    },
    Magasinier: {
      title: "Stock des matières", description: "Disponibilités, alertes et valeur des matières premières.", action: { label: "Ouvrir le stock", path: "/stock", icon: Boxes }, mode: "stock",
      metrics: [metric("Matières suivies", data.matieres?.nombre || 0, "Références en stock", Boxes), metric("Valeur du stock", formatCurrency(data.matieres?.valeur), "Au coût moyen", CircleDollarSign), metric("Alertes", data.alertes_stock || 0, "Seuil atteint", PackageX, data.alertes_stock ? "red" : "green"), metric("Produits finis", data.produits_finis?.nombre || 0, formatCurrency(data.produits_finis?.valeur), Factory)],
    },
    "Agent d'achat": {
      title: "Achats et réapprovisionnement", description: "Réceptions du mois et matières à commander.", action: { label: "Enregistrer une réception", path: "/stock", icon: Boxes }, mode: "stock",
      metrics: [metric("Achats du mois", formatCurrency(data.achats_mois?.montant), `${data.achats_mois?.nombre || 0} réceptions`, CircleDollarSign), metric("Matières suivies", data.matieres?.nombre || 0, "Références", Boxes), metric("À commander", data.alertes_stock || 0, "Alertes actives", PackageX, data.alertes_stock ? "red" : "green"), metric("Valeur du stock", formatCurrency(data.matieres?.valeur), "Disponibilités", Boxes)],
    },
    "Responsable production": {
      title: "Pilotage de la production", description: "Fabrications du mois, produits finis et matières disponibles.", action: { label: "Enregistrer une fabrication", path: "/production", icon: Factory }, mode: "production",
      metrics: [metric("Quantité fabriquée", data.production_mois?.quantite || 0, `${data.production_mois?.nombre || 0} fabrications`, Factory, "green"), metric("Produits finis", data.produits_finis?.nombre || 0, formatCurrency(data.produits_finis?.valeur), Factory), metric("Matières", data.matieres?.nombre || 0, formatCurrency(data.matieres?.valeur), Boxes), metric("Alertes matière", data.alertes_stock || 0, "À réapprovisionner", PackageX, data.alertes_stock ? "red" : "green")],
    },
    "Responsable immobilisations": {
      title: "Parc et immobilisations", description: "Matériels en service et valeur d'acquisition du parc.", action: { label: "Gérer le parc", path: "/immobilisations", icon: Wrench }, mode: "assets",
      metrics: [metric("Matériels suivis", data.immobilisations?.nombre || 0, "Actifs non vendus", Wrench), metric("Valeur du parc", formatCurrency(data.immobilisations?.valeur), "Valeur d'acquisition", CircleDollarSign), metric("Personnel actif", data.personnel_actif || 0, "Utilisateurs du parc", UsersRound), metric("Écritures du mois", formatCurrency(data.comptabilite_mois?.debit), "Mouvements comptables", Landmark)],
    },
  };
  return { ...common, ...(configs[role] || configs.Direction) };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const state = useFetch(async () => {
    const [dashboard, alerts] = await Promise.all([
      getDashboard(),
      canAccessModule(user?.nom_role, "stock") ? getStockAlerts() : Promise.resolve([]),
    ]);
    return { dashboard, alerts };
  }, [user?.nom_role]);
  if (state.loading) return <Loader />;
  const data = state.data?.dashboard || {};

  if (user?.nom_role === "Administrateur") {
    return <div className="page">
      <header className="page-header"><div><span className="eyebrow">Vue strategique consolidee</span><h1>Cockpit General & Tresorerie</h1><p>Indicateurs industriels, commerciaux et financiers synchronises en temps reel.</p></div><div className="page-actions"><Button variant="primary" icon={PlusCircle} onClick={() => navigate("/ventes")}>Nouvelle vente PF</Button><Button icon={BookOpenCheck} onClick={() => navigate("/comptabilite/ecritures")}>Ecriture journal</Button></div></header>
      <section className="metrics"><StatCard label="Ventes produits finis" value={formatCurrency(data.ventes_mois?.chiffre_affaires)} detail={`${data.ventes_mois?.nombre || 0} ventes ce mois`} icon={CircleDollarSign} progress={72}/><StatCard label="Resultat net exploitation" value={formatCurrency(0)} detail="Synthese SYSCOHADA" icon={Landmark} tone="green" progress={64}/><StatCard label="Creances clients" value={formatCurrency(data.creances_clients)} detail="Solde encore a recouvrer" icon={CircleDollarSign} tone="orange" progress={42}/><StatCard label="Stock critique matiere" value={`${data.alertes_stock || 0} alerte(s)`} detail="Sous le seuil minimum" icon={PackageX} tone={data.alertes_stock ? "red" : "green"} progress={data.alertes_stock ? 24 : 100}/></section>
      <section className="dashboard-grid"><div className="panel"><div className="panel-head"><div><h2>Equilibre Industriel : Ventes vs Couts d'Extrusion</h2><p>Projection hebdomadaire consolidee</p></div><Badge>USD</Badge></div><div className="chart-wrap"><SalesChart total={Number(data.ventes_mois?.chiffre_affaires || 0) / 4}/></div></div><div className="panel"><div className="panel-head"><div><h2>Capacite Usine & Extrusion</h2><p>Rendement synthetique</p></div><Badge tone="green">Actif</Badge></div><div className="panel-body" style={{ textAlign: "center", padding: "28px" }}><Factory size={42} color="var(--green)"/><div className="metric-value" style={{ marginTop: 10 }}>{data.produits_finis?.nombre || 0}</div><div className="micro" style={{ color: "var(--muted)", fontSize: 9 }}>References produits finis</div></div></div></section>
      <section className="dashboard-grid"><div className="panel"><div className="panel-head"><div><h2>Operations Recentes</h2><p>Flux des ventes produits finis</p></div><Badge>Dernieres ventes</Badge></div><RecentSales rows={data.ventes_recentes}/></div><div className="side-stack"><div className="panel"><div className="panel-head"><div><h2>Stocks Matieres en Alerte</h2><p>Seuil de securite usine</p></div><Badge tone="red">Urgent</Badge></div><StockAlerts rows={state.data?.alerts}/></div><div className="panel"><div className="panel-head"><h2>Effectifs Usine</h2><Badge tone="green">Actifs</Badge></div><div className="panel-body"><div className="metric-value green">{data.personnel_actif || 0}</div><small>collaborateurs actifs aujourd'hui</small></div></div></div></section>
    </div>;
  }

  const config = dashboardFor(user?.nom_role, data);
  const ActionIcon = config.action.icon;

  return <div className="page">
    <header className="page-header"><div><span className="eyebrow">{config.eyebrow}</span><h1>{config.title}</h1><p>{config.description}</p></div><Button variant="primary" icon={ActionIcon} onClick={() => navigate(config.action.path)}>{config.action.label}</Button></header>
    <section className="metrics">{config.metrics.map((item) => <StatCard key={item.label} {...item} />)}</section>
    {(config.mode === "sales" || config.mode === "accounting") && <section className="dashboard-grid"><div className="panel"><div className="panel-head"><div><h2>Activité commerciale du mois</h2><p>Facturation enregistrée</p></div><Badge>USD</Badge></div><div className="chart-wrap"><SalesChart total={Number(data.ventes_mois?.chiffre_affaires || 0) / 4}/></div></div><div className="panel"><div className="panel-head"><div><h2>Dernières factures</h2><p>Opérations commerciales récentes</p></div><Badge>{data.ventes_mois?.nombre || 0} ce mois</Badge></div><RecentSales rows={data.ventes_recentes}/></div></section>}
    {(config.mode === "stock" || config.mode === "production") && <section className="dashboard-grid"><div className="panel"><div className="panel-head"><div><h2>Matières à réapprovisionner</h2><p>Références sous le seuil minimum</p></div><Badge tone={data.alertes_stock ? "red" : "green"}>{data.alertes_stock || 0} alerte(s)</Badge></div><StockAlerts rows={state.data?.alerts}/></div><div className="panel"><div className="panel-head"><h2>Disponibilités</h2><Badge tone="green">À jour</Badge></div><div className="panel-body accounting-summary"><div><strong>{data.matieres?.nombre || 0}</strong><span>Matières</span></div><div><strong>{data.produits_finis?.nombre || 0}</strong><span>Produits finis</span></div><div><strong>{data.production_mois?.quantite || 0}</strong><span>Fabriqués ce mois</span></div></div></div></section>}
    {(config.mode === "admin" || config.mode === "staff" || config.mode === "assets") && <section className="panel"><div className="panel-head"><div><h2>Résumé de votre espace</h2><p>Informations utiles pour vos opérations quotidiennes</p></div><Badge tone="green">À jour</Badge></div><div className="panel-body accounting-summary"><div><strong>{data.personnel_actif || 0}</strong><span>Personnel actif</span></div><div><strong>{data.presences_jour || 0}</strong><span>Présents aujourd'hui</span></div><div><strong>{data.utilisateurs_actifs || 0}</strong><span>Comptes actifs</span></div></div></section>}
  </div>;
}
