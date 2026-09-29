import { useMemo, useState } from "react";
import { CircleDollarSign, ContactRound, FileDown, Pencil, Plus, Trash2, UsersRound } from "lucide-react";
import useFetch from "../../../hooks/useFetch";
import useAuth from "../../auth/hooks/useAuth";
import { createClient, deleteClient, getClientHistory, listClients, updateClient } from "../services/clients.api";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import SearchBar from "../../../components/common/SearchBar";
import Table from "../../../components/common/Table";
import Badge from "../../../components/common/Badge";
import Loader from "../../../components/common/Loader";
import StatCard from "../../dashboard/components/StatCard";
import { formatCurrency } from "../../../utils/currency";
import { exportTablePdf } from "../../../utils/pdf";

export default function ClientsPage() {
  const { user } = useAuth();
  const state = useFetch(listClients, []);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({ solde_compte: 0, payment_mode: "Comptant", payment_days: 30 });
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const clients = state.data || [];
  const filteredClients = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? clients.filter((client) => `${client.code} ${client.raison_sociale} ${client.adresse} ${client.conditions_paiement}`.toLowerCase().includes(term)) : clients;
  }, [clients, query]);
  if (state.loading) return <Loader />;
  const openForm = (client = null) => {
    setSelectedId(client?.id || null); setError("");
    const days = Number(String(client?.conditions_paiement || "").match(/\d+/)?.[0] || 30);
    const paymentMode = client && !String(client.conditions_paiement || "").toLowerCase().includes("comptant") ? "Tranche" : "Comptant";
    setForm(client ? { raison_sociale: client.raison_sociale, adresse: client.adresse || "", payment_mode: paymentMode, payment_days: days, solde_compte: client.solde_compte } : { solde_compte: 0, payment_mode: "Comptant", payment_days: 30 });
    setOpen(true);
  };
  const submit = async () => {
    try {
      const { payment_mode, payment_days, ...values } = form;
      const payload = { ...values, conditions_paiement: payment_mode === "Tranche" ? `Tranche - ${Number(payment_days)} jours` : "Comptant", solde_compte: Number(form.solde_compte || 0) };
      if (selectedId) await updateClient(selectedId, payload); else await createClient(payload);
      setOpen(false); await state.refresh();
    } catch (err) { setError(err.message); }
  };
  const removeClient = async (client) => {
    if (!window.confirm(`Supprimer le client ${client.raison_sociale} ?`)) return;
    try { await deleteClient(client.id); await state.refresh(); } catch (err) { setError(err.message); }
  };
  const clientPdf = async (client) => {
    try {
      const history = await getClientHistory(client.id);
      const sales = history?.ventes || [];
      const payments = history?.paiements || [];
      const rows = [
        ...sales.map((row) => ({ type: "Vente", date: row.date_vente, reference: row.numero || row.id_vente, libelle: row.type_paiement, montant: row.montant_total_vente, statut: row.etat_paiement })),
        ...payments.map((row) => ({ type: "Paiement", date: row.date_paiement, reference: row.id_paiement, libelle: row.libelle, montant: row.montant_paye, statut: row.statut_paiement })),
      ];
      exportTablePdf({ title: `Fiche client - ${client.raison_sociale}`, subtitle: `${client.code} | ${client.adresse || "Adresse non renseignee"}`, summary: [["Conditions", client.conditions_paiement || "-"], ["Solde", formatCurrency(client.solde_compte)], ["Operations", rows.length]], columns: [{key:"type",label:"Type"},{key:"date",label:"Date"},{key:"reference",label:"Reference"},{key:"libelle",label:"Libelle"},{key:"montant",label:"Montant"},{key:"statut",label:"Statut"}], rows, filename: `fiche-client-${client.code}.pdf` });
    } catch (err) { setError(err.message); }
  };
  const allClientsPdf = () => exportTablePdf({ title: "Etat des clients", columns: [{key:"code",label:"Code"},{key:"raison_sociale",label:"Raison sociale"},{key:"adresse",label:"Adresse"},{key:"conditions_paiement",label:"Conditions"},{key:"solde_compte",label:"Solde"}], rows: clients, filename: "etat-clients.pdf" });
  const solde = clients.reduce((sum, row) => sum + Number(row.solde_compte), 0);
  const cols = [
    { key: "code", label: "Code", render: (value) => <span className="mono" style={{ color: "var(--blue-soft)" }}>{value}</span> },
    { key: "raison_sociale", label: "Raison sociale", render: (value) => <strong>{value}</strong> },
    { key: "adresse", label: "Adresse" }, { key: "conditions_paiement", label: "Conditions" },
    { key: "solde_compte", label: "Solde", numeric: true, render: (value) => <span style={{ color: Number(value) > 0 ? "var(--orange)" : "var(--green)" }}>{formatCurrency(value)}</span> },
    { key: "etat", label: "Compte", render: (_, row) => <Badge tone={Number(row.solde_compte)>0?"orange":"green"}>{Number(row.solde_compte)>0?"Debiteur":"A jour"}</Badge> },
    { key: "actions", label: "Actions", render: (_, row) => <div className="row-actions"><button className="icon-btn table-action" title="Imprimer la fiche" onClick={() => clientPdf(row)}><FileDown /></button><button className="icon-btn table-action" title="Modifier" onClick={() => openForm(row)}><Pencil /></button>{["Direction", "Administrateur"].includes(user?.nom_role) && <button className="icon-btn table-action danger" title="Supprimer" onClick={() => removeClient(row)}><Trash2 /></button>}</div> },
  ];
  return <div className="page">
    <header className="page-header"><div><span className="eyebrow">Suivi commercial</span><h1>Clients</h1><p>Coordonnées, conditions de paiement et montants à recouvrer.</p></div><div className="page-actions"><Button icon={FileDown} onClick={allClientsPdf}>Imprimer la liste</Button><Button variant="primary" icon={Plus} onClick={() => openForm()}>Nouveau client</Button></div></header>
    {error && <div className="form-error">{error}</div>}
    <section className="metrics"><StatCard label="Clients enregistres" value={clients.length} detail="Comptes commerciaux" icon={UsersRound}/><StatCard label="Solde a recouvrer" value={formatCurrency(solde)} detail="Creances cumulees" icon={CircleDollarSign} tone={solde>0?"orange":"green"}/><StatCard label="Comptes a jour" value={clients.filter(row=>Number(row.solde_compte)===0).length} detail="Sans creance" icon={ContactRound} tone="green"/><StatCard label="Comptes debiteurs" value={clients.filter(row=>Number(row.solde_compte)>0).length} detail="Suivi necessaire" icon={CircleDollarSign} tone="red"/></section>
    <div className="toolbar"><Badge>{filteredClients.length} client(s)</Badge><SearchBar value={query} onChange={setQuery} placeholder="Filtrer les clients..." /></div>
    <section className="panel"><div className="panel-head"><h2>Liste des clients</h2><Badge>{filteredClients.length} client(s)</Badge></div><Table rows={filteredClients} columns={cols}/></section>
    <Modal open={open} title={selectedId ? "Modifier le client" : "Nouveau client"} onClose={() => setOpen(false)} footer={<><Button onClick={() => setOpen(false)}>Annuler</Button><Button variant="primary" onClick={submit}>Enregistrer</Button></>}>
      {error && <div className="form-error">{error}</div>}<div className="form-grid" style={{marginTop:12}}><Input className="full" label="Nom ou raison sociale" value={form.raison_sociale||""} onChange={event=>setForm({...form,raison_sociale:event.target.value})}/><Input className="full" label="Adresse" value={form.adresse||""} onChange={event=>setForm({...form,adresse:event.target.value})}/><Select label="Conditions de paiement" value={form.payment_mode} onChange={event=>setForm({...form,payment_mode:event.target.value})} options={["Comptant","Tranche"]}/>{form.payment_mode === "Tranche" && <Input label="Delai de paiement (jours)" type="number" min="1" value={form.payment_days||""} onChange={event=>setForm({...form,payment_days:event.target.value})}/>}</div>
    </Modal>
  </div>;
}
