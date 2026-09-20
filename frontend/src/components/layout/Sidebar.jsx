import { NavLink } from "react-router-dom";
import { LayoutDashboard, Landmark, BookOpenCheck, Scale, Factory, Boxes, ReceiptText, Truck, Wrench, UsersRound, ShieldCheck, FileBarChart, ContactRound, BookOpenText } from "lucide-react";
import useAuth from "../../modules/auth/hooks/useAuth";

const groups = [
  ["Pilotage", [{ to: "/", label: "Tableau de Bord", icon: LayoutDashboard }]],
  ["Finance & Comptabilite", [{ to: "/comptabilite", label: "Comptabilite Generale", icon: Landmark, roles: ["Comptable","Direction","Auditeur"] }, { to: "/comptabilite/ecritures", label: "Saisie des Ecritures", icon: BookOpenCheck, roles: ["Comptable","Direction"] }, { to: "/comptabilite/balance", label: "Balance & Bilan", icon: Scale, roles: ["Comptable","Direction","Auditeur"] }]],
  ["Chaine de Valeur & Usine", [{ to: "/production", label: "Production & Extrusion", icon: Factory, roles: ["Responsable production","Direction"] }, { to: "/stock", label: "Matieres & Reappro", icon: Boxes, roles: ["Magasinier","Agent d'achat","Responsable production","Direction"] }, { to: "/ventes", label: "Ventes & Factures", icon: ReceiptText, roles: ["Commercial","Caissier","Direction"] }, { to: "/commandes", label: "Commandes Clients", icon: Truck, roles: ["Commercial","Direction"] }, { to: "/clients", label: "Fichier Clients", icon: ContactRound, roles: ["Commercial","Caissier","Direction"] }]],
  ["Actifs & Ressources", [{ to: "/immobilisations", label: "Parc & Amortissements", icon: Wrench, roles: ["Responsable immobilisations","Comptable","Direction"] }, { to: "/rh", label: "Personnel & Salaires", icon: UsersRound, roles: ["RH","Direction"] }]],
  ["Analyse", [{ to: "/rapports", label: "Rapports", icon: FileBarChart, roles: ["Comptable","Direction","Auditeur"] }]],
  ["Configuration", [{ to: "/administration", label: "Utilisateurs & Roles", icon: ShieldCheck, roles: ["Administrateur"] }]],
  ["Aide", [{ to: "/guide", label: "Guide d'utilisation", icon: BookOpenText }]],
];

export default function Sidebar({ open, onNavigate }) {
  const { user } = useAuth();
  const canSee = (link) => user?.nom_role === "Administrateur" || !link.roles || link.roles.includes(user?.nom_role);
  return <aside className={`sidebar ${open ? "open" : ""}`}>
    <div className="brand"><img src="/pvc-logo.png" alt="PVC Renovee" /><div><strong>PVC Renovee</strong><small>ERP Industriel & Finance</small></div></div>
    <div className="db-status"><div><span>Base active</span><strong>Connecte</strong></div><code>db_pvc_renovee</code></div>
    <nav>{groups.map(([name, links]) => { const visible=links.filter(canSee); return visible.length ? <div key={name}><div className="nav-group">{name}</div>{visible.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === "/" || to === "/comptabilite"} onClick={onNavigate} className={({isActive}) => `nav-item ${isActive ? "active" : ""}`}><Icon /><span>{label}</span></NavLink>)}</div> : null; })}</nav>
    <div className="sidebar-footer"><span>Serveur ERP : <b>PROD-01</b></span><span>v1.0.0</span></div>
  </aside>;
}
