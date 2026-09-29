import { useEffect, useMemo, useState } from "react";
import { PlusCircle } from "lucide-react";
import useFetch from "../../../hooks/useFetch";
import { createEntry, getExchangeRate, listEntries, listJournals, listSubAccounts } from "../services/comptabilite.api";
import AccountingNav from "../components/AccountingNav";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import SearchBar from "../../../components/common/SearchBar";
import Table from "../../../components/common/Table";
import Badge from "../../../components/common/Badge";
import Loader from "../../../components/common/Loader";
import { formatCurrency } from "../../../utils/currency";
import { formatDate } from "../../../utils/dates";

const freshForm = (rate) => ({
  um: "USD",
  taux_convertion_usd_fc: rate || 2850,
  date_ecriture: new Date().toISOString().slice(0, 16),
});

export default function EcrituresPage() {
  const state = useFetch(async () => {
    const [entries, journals, subAccounts, rate] = await Promise.all([listEntries(), listJournals(), listSubAccounts(), getExchangeRate()]);
    return { entries, journals, subAccounts, rate };
  }, []);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(freshForm());

  useEffect(() => {
    if (state.data?.rate?.taux) setForm((current) => ({ ...current, taux_convertion_usd_fc: state.data.rate.taux }));
  }, [state.data?.rate?.taux]);

  const { entries = [], journals = [], subAccounts = [], rate = {} } = state.data || {};
  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return entries;
    return entries.filter((row) => `${row.numdocument} ${row.libelle} ${row.sens}`.toLowerCase().includes(term));
  }, [entries, query]);
  if (state.loading) return <Loader />;

  const openForm = () => {
    setError("");
    setForm(freshForm(rate.taux));
    setOpen(true);
  };
  const submit = async () => {
    try {
      await createEntry({
        ...form,
        journal_id: Number(form.journal_id),
        debit_sous_compte_id: Number(form.debit_sous_compte_id),
        credit_sous_compte_id: Number(form.credit_sous_compte_id),
        montant: Number(form.montant),
        taux_convertion_usd_fc: Number(form.taux_convertion_usd_fc),
      });
      setOpen(false);
      await state.refresh();
    } catch (err) { setError(err.message); }
  };
  const accountName = (id) => {
    const account = subAccounts.find((row) => Number(row.id) === Number(id));
    return account ? `${account.numero} - ${account.intitule}` : id;
  };
  const columns = [
    { key: "date_ecriture", label: "Date", render: formatDate },
    { key: "numdocument", label: "Piece", render: (value) => <span className="mono">{value}</span> },
    { key: "journal_id", label: "Journal", render: (value) => journals.find((row) => Number(row.id) === Number(value))?.codejr || value },
    { key: "sous_compte_id", label: "Compte", render: accountName },
    { key: "sens", label: "Mouvement", render: (value) => <Badge tone={value === "CP" ? "orange" : "green"}>{value === "CP" ? "Debit" : "Credit"}</Badge> },
    { key: "libelle", label: "Libelle" },
    { key: "montant", label: "Montant", numeric: true, render: (value) => formatCurrency(value) },
  ];

  return <div className="page">
    <header className="page-header"><div><span className="eyebrow">Comptabilite SYSCOHADA</span><h1>Saisie des ecritures</h1><p>Chaque operation enregistre automatiquement une ligne au debit et une ligne au credit.</p></div><Button variant="primary" icon={PlusCircle} onClick={openForm}>Passer une ecriture</Button></header>
    <AccountingNav />
    <div className="toolbar"><Badge>{rows.length} ligne(s)</Badge><SearchBar value={query} onChange={setQuery} placeholder="Filtrer par piece ou libelle..." /></div>
    <section className="panel"><div className="panel-head"><div><h2>Registre des ecritures</h2><p>Operations equilibrees selon le principe de la partie double</p></div><Badge tone="green">SYSCOHADA</Badge></div><Table rows={rows} columns={columns} /></section>
    <Modal open={open} title="Nouvelle operation comptable" onClose={() => setOpen(false)} footer={<><Button onClick={() => setOpen(false)}>Annuler</Button><Button variant="primary" onClick={submit}>Valider l'operation</Button></>}>
      {error && <div className="form-error">{error}</div>}
      <div className="form-grid" style={{ marginTop: error ? 12 : 0 }}>
        <Select label="Journal" value={form.journal_id || ""} onChange={(event) => setForm({ ...form, journal_id: event.target.value })} options={[{ value: "", label: "Selectionner" }, ...journals.map((row) => ({ value: row.id, label: `${row.codejr} - ${row.nom_journal}` }))]} />
        <Input label="Numero de piece" value={form.numdocument || ""} onChange={(event) => setForm({ ...form, numdocument: event.target.value })} />
        <Select label="Compte a debiter" value={form.debit_sous_compte_id || ""} onChange={(event) => setForm({ ...form, debit_sous_compte_id: event.target.value })} options={[{ value: "", label: "Selectionner" }, ...subAccounts.map((row) => ({ value: row.id, label: `${row.numero} - ${row.intitule}` }))]} />
        <Select label="Compte a crediter" value={form.credit_sous_compte_id || ""} onChange={(event) => setForm({ ...form, credit_sous_compte_id: event.target.value })} options={[{ value: "", label: "Selectionner" }, ...subAccounts.map((row) => ({ value: row.id, label: `${row.numero} - ${row.intitule}` }))]} />
        <Input label="Montant" type="number" min="0" step="0.01" value={form.montant || ""} onChange={(event) => setForm({ ...form, montant: event.target.value })} />
        <Select label="Devise" value={form.um} onChange={(event) => setForm({ ...form, um: event.target.value })} options={["USD", "FC"]} />
        <Input label="Taux USD/FC" type="number" value={form.taux_convertion_usd_fc || ""} onChange={(event) => setForm({ ...form, taux_convertion_usd_fc: event.target.value })} />
        <Input label="Date de l'ecriture" type="datetime-local" value={form.date_ecriture} onChange={(event) => setForm({ ...form, date_ecriture: event.target.value })} />
        <Input className="full" label="Libelle de l'operation" value={form.libelle || ""} onChange={(event) => setForm({ ...form, libelle: event.target.value })} />
      </div>
    </Modal>
  </div>;
}
