import { useEffect, useState } from "react";
import { Download, FileDown, RefreshCw } from "lucide-react";
import { getReport, listReports } from "../services/rapports.api";
import Button from "../../../components/common/Button";
import Badge from "../../../components/common/Badge";
import EmptyState from "../../../components/common/EmptyState";
import Loader from "../../../components/common/Loader";
import { exportTablePdf, reportColumns } from "../../../utils/pdf";

const reportLabels = {
  ventes: "Ventes clients",
  stock: "Stock des matières",
  creances: "Créances clients",
  fournisseurs: "Dettes fournisseurs",
  paie: "Paie du personnel",
  amortissements: "Amortissements",
  bilan: "Bilan comptable",
  resultat: "Compte de résultat",
};
const columnLabels = {
  id_vente: "N° vente", date_vente: "Date", client: "Client", montant_total_vente: "Total",
  montant_payee: "Payé", etat_paiement: "Paiement", designation: "Désignation", stock_actuel: "Stock",
  seuil_reappro: "Seuil d'alerte", solde_compte: "Solde", jours_retard: "Jours de retard",
  agent: "Agent", salaire_mensuel: "Salaire", valeur_nette: "Valeur nette", date_calcul: "Date",
};

export default function RapportsPage() {
  const [names, setNames] = useState([]);
  const [selected, setSelected] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = async (name) => { setLoading(true); try { setRows(await getReport(name)); } finally { setLoading(false); } };
  useEffect(() => { listReports().then((list) => { setNames(list); setSelected(list[0] || ""); if (list[0]) load(list[0]); else setLoading(false); }); }, []);
  const columns = reportColumns(rows, columnLabels);
  const exportCsv = () => {
    if (!rows.length) return;
    const keys = columns.map((column) => column.key);
    const csv = [keys.join(";"), ...rows.map((row) => keys.map((key) => JSON.stringify(row[key] ?? "")).join(";"))].join("\n");
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); anchor.download = `rapport-${selected}.csv`; anchor.click(); URL.revokeObjectURL(anchor.href);
  };
  const exportPdf = () => exportTablePdf({ title: reportLabels[selected] || "Rapport", subtitle: `Situation officielle - ${rows.length} ligne(s)`, columns, rows, filename: `rapport-${selected}.pdf`, summary: [["Rapport", reportLabels[selected] || selected], ["Lignes", rows.length], ["Période", "Situation actuelle"]] });
  return <div className="page">
    <header className="page-header"><div><span className="eyebrow">Documents de gestion</span><h1>Rapports et états</h1><p>Consultez, imprimez ou exportez les informations commerciales, industrielles et financières.</p></div><div className="page-actions"><Button icon={RefreshCw} onClick={() => load(selected)}>Actualiser</Button><Button icon={Download} onClick={exportCsv}>Exporter CSV</Button><Button variant="primary" icon={FileDown} onClick={exportPdf}>Imprimer en PDF</Button></div></header>
    <div className="toolbar"><div className="tabs">{names.map((name) => <button key={name} className={`tab ${selected===name?"active":""}`} onClick={() => { setSelected(name); load(name); }}>{reportLabels[name] || name}</button>)}</div></div>
    <section className="panel"><div className="panel-head"><div><h2>{reportLabels[selected] || selected}</h2><p>Informations à jour, disponibles en CSV et PDF</p></div><Badge>{rows.length} ligne(s)</Badge></div>{loading ? <Loader/> : rows.length ? <div className="data-table-wrap"><table className="data-table"><thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead><tbody>{rows.map((row,index) => <tr key={index}>{columns.map((column) => <td key={column.key} className={typeof row[column.key] === "number" ? "number" : ""}>{String(row[column.key] ?? "")}</td>)}</tr>)}</tbody></table></div> : <EmptyState title="Rapport vide" message="Aucune donnée disponible pour ce rapport."/>}</section>
  </div>;
}
