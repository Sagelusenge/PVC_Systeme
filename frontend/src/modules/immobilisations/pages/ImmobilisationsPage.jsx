import { useState } from "react";
import { CircleDollarSign, FileDown, Pencil, Plus, Trash2, Wrench } from "lucide-react";
import useFetch from "../../../hooks/useFetch";
import useAuth from "../../auth/hooks/useAuth";
import { createAsset, deleteAsset, listAssets, listPlans, updateAsset } from "../services/immobilisations.api";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import Table from "../../../components/common/Table";
import Badge from "../../../components/common/Badge";
import Loader from "../../../components/common/Loader";
import StatCard from "../../dashboard/components/StatCard";
import { formatCurrency } from "../../../utils/currency";
import { formatDate } from "../../../utils/dates";
import { exportTablePdf } from "../../../utils/pdf";

const emptyForm = () => ({
  amortissable: true,
  mode_amortissement: "lineaire",
  periodicite: "Mensuel",
  statut: "en service",
  valeur_residuelle: 0,
});

export default function ImmobilisationsPage() {
  const { user } = useAuth();
  const state = useFetch(async () => {
    const [assets, plans] = await Promise.all([listAssets(), listPlans()]);
    return { assets, plans };
  }, []);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState("");
  if (state.loading) return <Loader />;

  const { assets = [], plans = [] } = state.data || {};
  const openForm = (row = null) => {
    setSelectedId(row?.id_materiel || null);
    setForm(row ? { ...row } : emptyForm());
    setError("");
    setOpen(true);
  };
  const submit = async () => {
    try {
      const payload = {
        ...form,
        valeur_acquisition: Number(form.valeur_acquisition),
        taux_amortissement: Number(form.taux_amortissement),
        duree_utilisation: Number(form.duree_utilisation),
        valeur_residuelle: Number(form.valeur_residuelle || 0),
      };
      if (!payload.code_materiel) delete payload.code_materiel;
      if (selectedId) await updateAsset(selectedId, payload);
      else await createAsset(payload);
      setOpen(false);
      setSelectedId(null);
      await state.refresh();
    } catch (err) {
      setError(err.message);
    }
  };
  const removeAsset = async (row) => {
    if (!window.confirm(`Supprimer ${row.code_materiel} - ${row.designation} ?`)) return;
    try {
      await deleteAsset(row.id_materiel);
      await state.refresh();
    } catch (err) {
      setError(err.message);
    }
  };
  const printAssets = () => exportTablePdf({
    title: "État du parc matériel",
    subtitle: "Immobilisations et informations d'amortissement",
    columns: [
      { key: "code_materiel", label: "Code" },
      { key: "designation", label: "Matériel" },
      { key: "date_acquisition", label: "Acquisition", value: (row) => formatDate(row.date_acquisition) },
      { key: "valeur_acquisition", label: "Valeur", value: (row) => formatCurrency(row.valeur_acquisition) },
      { key: "taux_amortissement", label: "Taux", value: (row) => `${row.taux_amortissement}%` },
      { key: "statut", label: "État" },
    ],
    rows: assets,
    summary: [["Matériels", assets.length], ["Valeur totale", formatCurrency(assets.reduce((sum, row) => sum + Number(row.valeur_acquisition), 0))], ["En service", assets.filter((row) => row.statut === "en service").length]],
    filename: "etat-parc-materiel.pdf",
  });
  const value = assets.reduce((sum, row) => sum + Number(row.valeur_acquisition), 0);
  const columns = [
    { key: "code_materiel", label: "Code", render: (item) => <span className="mono" style={{ color: "var(--blue-soft)" }}>{item}</span> },
    { key: "designation", label: "Matériel" },
    { key: "date_acquisition", label: "Acquisition", render: formatDate },
    { key: "valeur_acquisition", label: "Valeur", numeric: true, render: formatCurrency },
    { key: "mode_amortissement", label: "Amortissement" },
    { key: "taux_amortissement", label: "Taux", numeric: true, render: (item) => `${item}%` },
    { key: "statut", label: "État", render: (item) => <Badge tone={item === "en service" ? "green" : item === "hors service" ? "red" : "orange"}>{item}</Badge> },
    { key: "actions", label: "Actions", render: (_, row) => <div className="row-actions"><button className="icon-btn table-action" title="Modifier" onClick={() => openForm(row)}><Pencil /></button>{["Direction", "Administrateur"].includes(user?.nom_role) && <button className="icon-btn table-action danger" title="Supprimer" onClick={() => removeAsset(row)}><Trash2 /></button>}</div> },
  ];

  return <div className="page">
    <header className="page-header"><div><span className="eyebrow">Parc de l'entreprise</span><h1>Matériels et amortissements</h1><p>Suivez les acquisitions, leur état et leur amortissement.</p></div><div className="page-actions"><Button icon={FileDown} onClick={printAssets}>Imprimer le parc</Button><Button variant="primary" icon={Plus} onClick={() => openForm()}>Nouveau matériel</Button></div></header>
    {error && !open && <div className="form-error">{error}</div>}
    <section className="metrics"><StatCard label="Matériels enregistrés" value={assets.length} detail="Équipements suivis" icon={Wrench}/><StatCard label="Valeur d'acquisition" value={formatCurrency(value)} detail="Valeur totale" icon={CircleDollarSign} tone="green"/><StatCard label="En service" value={assets.filter((row) => row.statut === "en service").length} detail="Équipements disponibles" icon={Wrench} tone="green"/><StatCard label="Échéances calculées" value={plans.length} detail="Lignes d'amortissement" icon={CircleDollarSign} tone="orange"/></section>
    <section className="panel"><div className="panel-head"><div><h2>Liste des matériels</h2><p>Valeurs, amortissements et états</p></div><Badge>{assets.length} matériel(s)</Badge></div><Table rows={assets} columns={columns} keyField="id_materiel"/></section>
    <Modal open={open} title={selectedId ? "Modifier le matériel" : "Nouveau matériel"} onClose={() => setOpen(false)} footer={<><Button onClick={() => setOpen(false)}>Annuler</Button><Button variant="primary" onClick={submit}>Enregistrer</Button></>}>
      {error && <div className="form-error">{error}</div>}
      <div className="form-grid" style={{ marginTop: error ? 12 : 0 }}><Input label="Désignation" value={form.designation || ""} onChange={(event) => setForm({ ...form, designation: event.target.value })}/><Input label="Date d'acquisition" type="date" value={String(form.date_acquisition || "").slice(0, 10)} onChange={(event) => setForm({ ...form, date_acquisition: event.target.value })}/><Input label="Valeur d'acquisition" type="number" value={form.valeur_acquisition || ""} onChange={(event) => setForm({ ...form, valeur_acquisition: event.target.value })}/><Input label="Taux d'amortissement (%)" type="number" value={form.taux_amortissement || ""} onChange={(event) => setForm({ ...form, taux_amortissement: event.target.value })}/><Input label="Durée d'utilisation" type="number" value={form.duree_utilisation || ""} onChange={(event) => setForm({ ...form, duree_utilisation: event.target.value })}/><Select label="Mode" value={form.mode_amortissement} onChange={(event) => setForm({ ...form, mode_amortissement: event.target.value })} options={[{ value: "lineaire", label: "Linéaire" }, { value: "degressif", label: "Dégressif" }]}/><Select label="Calcul" value={form.periodicite} onChange={(event) => setForm({ ...form, periodicite: event.target.value })} options={["Mensuel", "Annuel"]}/><Select label="État" value={form.statut} onChange={(event) => setForm({ ...form, statut: event.target.value })} options={[{ value: "en service", label: "En service" }, { value: "en maintenance", label: "En maintenance" }, { value: "hors service", label: "Hors service" }, { value: "vendu", label: "Vendu" }]}/></div>
    </Modal>
  </div>;
}
