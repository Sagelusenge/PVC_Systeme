import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpenCheck, Landmark, Pencil, PlusCircle, Scale, TrendingUp } from "lucide-react";
import useFetch from "../../../hooks/useFetch";
import useAuth from "../../auth/hooks/useAuth";
import { getExchangeRate, listEntries, listJournals, listOperations, listSubAccounts, updateExchangeRate } from "../services/comptabilite.api";
import AccountingNav from "../components/AccountingNav";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import Input from "../../../components/common/Input";
import Table from "../../../components/common/Table";
import Badge from "../../../components/common/Badge";
import Loader from "../../../components/common/Loader";
import StatCard from "../../dashboard/components/StatCard";
import { formatCurrency } from "../../../utils/currency";
import { formatDate } from "../../../utils/dates";

export default function ComptabiliteDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const state = useFetch(async () => {
    const [entries, operations, journals, subAccounts, rate] = await Promise.all([listEntries(), listOperations(), listJournals(), listSubAccounts(), getExchangeRate()]);
    return { entries, operations, journals, subAccounts, rate };
  }, []);
  const [rateOpen, setRateOpen] = useState(false);
  const [rateValue, setRateValue] = useState(2850);
  const [error, setError] = useState("");
  if (state.loading) return <Loader />;
  const { entries = [], operations = [], journals = [], subAccounts = [], rate = {} } = state.data || {};
  const debit = operations.reduce((sum, row) => sum + Number(row.debit || 0), 0);
  const credit = operations.reduce((sum, row) => sum + Number(row.credit || 0), 0);
  const canEdit = user?.nom_role === "Administrateur" || ["Comptable", "Direction"].includes(user?.nom_role);
  const openRate = () => { setRateValue(rate.taux || 2850); setError(""); setRateOpen(true); };
  const saveRate = async () => { try { await updateExchangeRate(Number(rateValue)); setRateOpen(false); await state.refresh(); } catch (err) { setError(err.message); } };
  const columns = [
    { key: "date_ecriture", label: "Date", render: formatDate },
    { key: "numdocument", label: "Piece", render: (value) => <span className="mono">{value}</span> },
    { key: "compte", label: "Compte" },
    { key: "sous_compte_intitule", label: "Intitule" },
    { key: "libelle", label: "Operation" },
    { key: "debit", label: "Debit", numeric: true, render: (value) => formatCurrency(value) },
    { key: "credit", label: "Credit", numeric: true, render: (value) => formatCurrency(value) },
  ];
  return <div className="page">
    <header className="page-header"><div><span className="eyebrow">SYSCOHADA // vue financiere consolidee</span><h1>Comptabilite Generale</h1><p>Synthese des journaux, comptes, ecritures et controles financiers.</p></div><div className="page-actions">{canEdit && <Button icon={Pencil} onClick={openRate}>Modifier le taux</Button>}{canEdit && <Button variant="primary" icon={PlusCircle} onClick={() => navigate("/comptabilite/ecritures")}>Nouvelle ecriture</Button>}</div></header>
    <AccountingNav />
    <section className="metrics"><StatCard label="Total debits" value={formatCurrency(debit)} detail="Mouvements comptabilises" icon={Landmark}/><StatCard label="Total credits" value={formatCurrency(credit)} detail="Mouvements comptabilises" icon={TrendingUp} tone="green"/><StatCard label="Controle de balance" value={formatCurrency(Math.abs(debit-credit))} detail={debit===credit?"Balance equilibree":"Ecart a verifier"} icon={Scale} tone={debit===credit?"green":"red"}/><StatCard label="Taux de reference" value={`1 USD = ${Number(rate.taux || 2850).toLocaleString("fr-FR")} FC`} detail="Modifiable par la comptabilite" icon={Landmark} tone="orange"/></section>
    <section className="dashboard-grid"><div className="panel"><div className="panel-head"><div><h2>Dernieres operations</h2><p>Vue rapide du journal comptable</p></div><Badge>{operations.length} lignes</Badge></div><Table rows={operations.slice(0, 6)} columns={columns} keyField="id_ecriture"/></div><div className="side-stack"><div className="panel"><div className="panel-head"><h2>Structure comptable</h2><Badge tone="green">Active</Badge></div><div className="panel-body accounting-summary"><div><strong>{journals.length}</strong><span>Journaux</span></div><div><strong>{subAccounts.length}</strong><span>Sous-comptes</span></div><div><strong>{entries.length}</strong><span>Ecritures</span></div></div></div><div className="panel"><div className="panel-head"><h2>Regle de controle</h2><BookOpenCheck size={18}/></div><div className="panel-body"><p className="muted-copy">Chaque piece doit etre rattachee a un journal, un sous-compte et une contrepartie identifiable.</p></div></div></div></section>
    <Modal open={rateOpen} title="Modifier le taux de change" onClose={() => setRateOpen(false)} footer={<><Button onClick={() => setRateOpen(false)}>Annuler</Button><Button variant="primary" onClick={saveRate}>Enregistrer le taux</Button></>}>{error && <div className="form-error">{error}</div>}<Input label="Taux USD vers FC" type="number" min="1" step="0.01" value={rateValue} onChange={(event) => setRateValue(event.target.value)} /><p className="field-help">Ce taux sera propose automatiquement lors de la saisie des nouvelles ecritures.</p></Modal>
  </div>;
}
