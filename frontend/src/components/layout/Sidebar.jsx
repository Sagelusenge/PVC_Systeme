import { NavLink } from "react-router-dom";
import { LayoutDashboard, Landmark, BookOpenCheck, Scale, Factory, Boxes, ReceiptText, Truck, Wrench, UsersRound, ShieldCheck, FileBarChart, ContactRound, BookOpenText } from "lucide-react";
import useAuth from "../../modules/auth/hooks/useAuth";
import { canAccessModule } from "../../utils/permissions";

const groups = [
  ["Pilotage", [{ to: "/", label: "Tableau de Bord", icon: LayoutDashboard, module: "dashboard" }]],
  ["Finance & Comptabilite", [{ to: "/comptabilite", label: "Comptabilite Generale", icon: Landmark, module: "accounting" }, { to: "/comptabilite/ecritures", label: "Saisie des Ecritures", icon: BookOpenCheck, module: "accountingEntries" }, { to: "/comptabilite/balance", label: "Balance & Bilan", icon: Scale, module: "accounting" }]],
  ["Chaine de Valeur & Usine", [{ to: "/production", label: "Production & Extrusion", icon: Factory, module: "production" }, { to: "/stock", label: "Matieres & Reappro", icon: Boxes, module: "stock" }, { to: "/ventes", label: "Ventes & Factures", icon: ReceiptText, module: "sales" }, { to: "/commandes", label: "Commandes Clients", icon: Truck, module: "orders" }, { to: "/clients", label: "Fichier Clients", icon: ContactRound, module: "clients" }]],
  ["Actifs & Ressources", [{ to: "/immobilisations", label: "Parc & Amortissements", icon: Wrench, module: "assets" }, { to: "/rh", label: "Personnel & Salaires", icon: UsersRound, module: "hr" }]],
  ["Analyse", [{ to: "/rapports", label: "Rapports", icon: FileBarChart, module: "reports" }]],
  ["Configuration", [{ to: "/administration", label: "Utilisateurs & Roles", icon: ShieldCheck, module: "administration" }]],
  ["Aide", [{ to: "/guide", label: "Guide d'utilisation", icon: BookOpenText, module: "guide" }]],
];

export default function Sidebar({ open, onNavigate }) {
  const { user } = useAuth();
  const canSee = (link) => canAccessModule(user?.nom_role, link.module);
  return <aside className={`sidebar ${open ? "open" : ""}`}>
    <div className="brand"><img src="/pvc-logo.png" alt="PVC Renovee" /><div><strong>PVC Renovee</strong><small>ERP Industriel & Finance</small></div></div>
    <div className="db-status"><div><span>Base active</span><strong>Connecte</strong></div><code>db_pvc_renovee</code></div>
    <nav>{groups.map(([name, links]) => { const visible=links.filter(canSee); return visible.length ? <div key={name}><div className="nav-group">{name}</div>{visible.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === "/" || to === "/comptabilite"} onClick={onNavigate} className={({isActive}) => `nav-item ${isActive ? "active" : ""}`}><Icon /><span>{label}</span></NavLink>)}</div> : null; })}</nav>
    <div className="sidebar-footer"><span>Serveur ERP : <b>PROD-01</b></span><span>v1.0.0</span></div>
  </aside>;
}
