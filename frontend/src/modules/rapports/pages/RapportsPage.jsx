import { useEffect, useState } from "react";
import { Download, FileDown, RefreshCw } from "lucide-react";
import { getReport, listReports } from "../services/rapports.api";
import Button from "../../../components/common/Button";
import Badge from "../../../components/common/Badge";
import EmptyState from "../../../components/common/EmptyState";
import Loader from "../../../components/common/Loader";
import { exportTablePdf, reportColumns } from "../../../utils/pdf";

export default function RapportsPage() {
  const [names, setNames] = useState([]);
  const [selected, setSelected] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = async (name) => { setLoading(true); try { setRows(await getReport(name)); } finally { setLoading(false); } };
  useEffect(() => { listReports().then((list) => { setNames(list); setSelected(list[0] || ""); if (list[0]) load(list[0]); else setLoading(false); }); }, []);
  const columns = reportColumns(rows);
  const exportCsv = () => {
    if (!rows.length) return;
    const keys = columns.map((column) => column.key);
    const csv = [keys.join(";"), ...rows.map((row) => keys.map((key) => JSON.stringify(row[key] ?? "")).join(";"))].join("\n");
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); anchor.download = `rapport-${selected}.csv`; anchor.click(); URL.revokeObjectURL(anchor.href);
  };
  const exportPdf = () => exportTablePdf({ title: `Rapport ${selected}`, subtitle: `Etat consolide - ${rows.length} lignes`, columns, rows, filename: `rapport-${selected}.pdf` });
  return <div className="page">
    <header className="page-header"><div><span className="eyebrow">Analyse & controle // vues SQL</span><h1>Centre des Rapports</h1><p>Etats commerciaux, industriels, financiers et sociaux.</p></div><div className="page-actions"><Button icon={RefreshCw} onClick={() => load(selected)}>Actualiser</Button><Button icon={Download} onClick={exportCsv}>CSV</Button><Button variant="primary" icon={FileDown} onClick={exportPdf}>PDF / Imprimer</Button></div></header>
    <div className="toolbar"><div className="tabs">{names.map((name) => <button key={name} className={`tab ${selected===name?"active":""}`} onClick={() => { setSelected(name); load(name); }}>{name}</button>)}</div></div>
    <section className="panel"><div className="panel-head"><div><h2>Rapport : {selected}</h2><p>Extraction directe de la base, disponible en CSV et PDF</p></div><Badge>{rows.length} lignes</Badge></div>{loading ? <Loader/> : rows.length ? <div className="data-table-wrap"><table className="data-table"><thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead><tbody>{rows.map((row,index) => <tr key={index}>{columns.map((column) => <td key={column.key} className={typeof row[column.key] === "number" ? "number" : ""}>{String(row[column.key] ?? "")}</td>)}</tr>)}</tbody></table></div> : <EmptyState title="Rapport vide" message="Aucune donnee disponible pour cette vue."/>}</section>
  </div>;
}
