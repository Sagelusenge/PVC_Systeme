import { NavLink } from "react-router-dom";

const links = [
  ["/comptabilite/journal", "Journal des operations"],
  ["/comptabilite/grand-livre", "Grand livre analytique"],
  ["/comptabilite/balance", "Balance generale"],
  ["/comptabilite/bilan", "Bilan actif / passif"],
];

export default function AccountingNav() {
  return <nav className="toolbar accounting-nav" aria-label="Etats comptables">
    <div className="tabs">{links.map(([to, label]) => <NavLink key={to} to={to} className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>{label}</NavLink>)}</div>
  </nav>;
}
