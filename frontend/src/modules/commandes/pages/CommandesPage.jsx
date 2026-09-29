import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, FileDown, Pencil, Plus, Trash2, Truck, XCircle } from "lucide-react";
import useFetch from "../../../hooks/useFetch";
import useAuth from "../../auth/hooks/useAuth";
import { get } from "../../../services/api";
import { createOrder, deleteOrder, deliverOrder, getOrder, listOrders, updateOrder } from "../services/commandes.api";
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
import { formatDate } from "../../../utils/dates";
import { exportTablePdf } from "../../../utils/pdf";

const emptyLine = () => ({ id_produit_fini: "", quantite_commandee: 1, prix_vente_unitaire: 0 });
const emptyForm = () => ({
  date_commande: new Date().toISOString().slice(0, 10),
  statut: "en attente",
  montant_anticipation: 0,
  details: [emptyLine()],
});

export default function CommandesPage() {
  const { user } = useAuth();
  const state = useFetch(async () => {
    const [orders, clients, products] = await Promise.all([listOrders(), get("/clients?limit=100"), get("/production/produits?limit=100")]);
    return { orders, clients, products };
  }, []);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const { orders = [], clients = [], products = [] } = state.data || {};
  const clientById = (id) => clients.find((item) => Number(item.id) === Number(id));
  const orderTotal = (form.details || []).reduce((sum, line) => sum + Number(line.quantite_commandee || 0) * Number(line.prix_vente_unitaire || 0), 0);
  const filteredOrders = useMemo(() => {
    const term = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "tous" || order.statut === statusFilter;
      const client = clients.find((item) => Number(item.id) === Number(order.client_id));
      const matchesQuery = !term || `${order.numero} ${client?.raison_sociale || ""} ${order.statut}`.toLowerCase().includes(term);
      return matchesStatus && matchesQuery;
    });
  }, [orders, clients, query, statusFilter]);
  if (state.loading) return <Loader />;

  const openCreate = () => {
    setSelectedId(null); setError(""); setNotice(""); setForm(emptyForm()); setOpen(true);
  };
  const openEdit = async (row) => {
    try {
      const order = await getOrder(row.id);
      setSelectedId(order.id); setError(""); setNotice("");
      setForm({
        date_commande: String(order.date_commande).slice(0, 10),
        client_id: order.client_id,
        date_livraison_prevue: order.date_livraison_prevue ? String(order.date_livraison_prevue).slice(0, 10) : "",
        statut: order.statut,
        montant_anticipation: order.montant_anticipation,
        date_paiement_anticipation: order.date_paiement_anticipation ? String(order.date_paiement_anticipation).slice(0, 10) : "",
        details: (order.details || []).map((line) => ({
          id_produit_fini: line.id_produit_fini,
          quantite_commandee: line.quantite_commandee,
          prix_vente_unitaire: line.prix_vente_unitaire,
        })),
      });
      setOpen(true);
    } catch (err) { setError(err.message); }
  };
  const updateLine = (index, values) => setForm((current) => ({
    ...current,
    details: current.details.map((line, lineIndex) => lineIndex === index ? { ...line, ...values } : line),
  }));
  const chooseProduct = (index, productId) => {
    const product = products.find((item) => String(item.id) === String(productId));
    updateLine(index, { id_produit_fini: productId, prix_vente_unitaire: product?.prix_unitaire || 0 });
  };
  const addLine = () => setForm((current) => ({ ...current, details: [...current.details, emptyLine()] }));
  const removeLine = (index) => setForm((current) => ({ ...current, details: current.details.filter((_, lineIndex) => lineIndex !== index) }));
  const submit = async () => {
    try {
      const payload = {
        date_commande: form.date_commande,
        client_id: Number(form.client_id),
        date_livraison_prevue: form.date_livraison_prevue || null,
        statut: form.statut,
        montant_anticipation: Number(form.montant_anticipation || 0),
        date_paiement_anticipation: Number(form.montant_anticipation || 0) > 0 ? (form.date_paiement_anticipation || form.date_commande) : null,
        details: form.details.map((line) => ({
          id_produit_fini: Number(line.id_produit_fini),
          quantite_commandee: Number(line.quantite_commandee),
          prix_vente_unitaire: Number(line.prix_vente_unitaire),
        })),
      };
      if (selectedId) await updateOrder(selectedId, payload); else await createOrder(payload);
      setOpen(false); await state.refresh();
    } catch (err) { setError(err.message); }
  };
  const deliver = async (row) => {
    if (!window.confirm(`Facturer la commande ${row.numero} avec tous ses produits ?`)) return;
    try {
      const result = await deliverOrder(row.id);
      setNotice(`Commande facturée. La facture VTE-${String(result.vente_id).padStart(5, "0")} reprend les mêmes produits et quantités.`);
      setError(""); await state.refresh();
    } catch (err) { setError(err.message); }
  };
  const cancel = async (row) => {
    if (!window.confirm(`Annuler la commande ${row.numero} ?`)) return;
    try { await updateOrder(row.id, { statut: "annulée" }); setNotice("Commande annulée."); setError(""); await state.refresh(); }
    catch (err) { setError(err.message); }
  };
  const remove = async (row) => {
    if (!window.confirm(`Supprimer définitivement la commande ${row.numero} ?`)) return;
    try { await deleteOrder(row.id); setNotice("Commande supprimée."); setError(""); await state.refresh(); }
    catch (err) { setError(err.message); }
  };
  const printOrder = async (row) => {
    try {
      const order = await getOrder(row.id);
      const client = clientById(order.client_id);
      await exportTablePdf({
        title: "Bon de commande", documentNumber: order.numero,
        subtitle: `Commande du ${formatDate(order.date_commande)} | Livraison prévue : ${formatDate(order.date_livraison_prevue)}`,
        recipient: { title: "Client", name: client?.raison_sociale || order.client, details: client?.adresse || "Adresse non renseignée" },
        columns: [{ key: "code", label: "Code" }, { key: "libelle", label: "Produit" }, { key: "quantite_commandee", label: "Quantité" }, { key: "prix_vente_unitaire", label: "Prix unitaire" }, { label: "Total", value: (line) => formatCurrency(Number(line.quantite_commandee) * Number(line.prix_vente_unitaire)) }],
        rows: order.details || [],
        summary: [["Total", formatCurrency(order.montant_tot)], ["Acompte", formatCurrency(order.montant_anticipation)], ["Reste", formatCurrency(Number(order.montant_tot) - Number(order.montant_anticipation))], ["Statut", order.statut]],
        notes: "Bon de commande établi selon les produits et quantités validés par le client.", signatures: true, orientation: "portrait", filename: `commande-${order.numero}.pdf`,
      });
    } catch (err) { setError(err.message); }
  };

  const total = orders.reduce((sum, item) => sum + Number(item.montant_tot), 0);
  const columns = [
    { key: "numero", label: "N° commande", render: (value) => <strong className="mono" style={{ color: "var(--blue-soft)" }}>{value}</strong> },
    { key: "date_commande", label: "Date", render: formatDate },
    { key: "client_id", label: "Client", render: (value) => clientById(value)?.raison_sociale || `Client #${value}` },
    { key: "date_livraison_prevue", label: "Livraison prévue", render: formatDate },
    { key: "statut", label: "Statut", render: (value) => <Badge tone={value === "livrée" ? "green" : value === "annulée" ? "red" : "orange"}>{value}</Badge> },
    { key: "montant_tot", label: "Montant", numeric: true, render: formatCurrency },
    { key: "actions", label: "Actions", render: (_, row) => <div className="row-actions">
      <button className="icon-btn table-action" title="Imprimer le bon de commande" onClick={() => printOrder(row)}><FileDown /></button>
      {row.statut === "en attente" && <button className="icon-btn table-action" title="Modifier" onClick={() => openEdit(row)}><Pencil /></button>}
      {row.statut === "en attente" && <button className="icon-btn table-action success" title="Facturer la commande" onClick={() => deliver(row)}><CheckCircle2 /></button>}
      {row.statut === "en attente" && <button className="icon-btn table-action danger" title="Annuler" onClick={() => cancel(row)}><XCircle /></button>}
      {["Direction", "Administrateur"].includes(user?.nom_role) && row.statut !== "livrée" && <button className="icon-btn table-action danger" title="Supprimer" onClick={() => remove(row)}><Trash2 /></button>}
    </div> },
  ];

  return <div className="page">
    <header className="page-header"><div><span className="eyebrow">Suivi commercial</span><h1>Commandes clients</h1><p>Une commande peut contenir plusieurs produits puis être transformée en facture sans nouvelle saisie.</p></div><Button variant="primary" icon={Plus} onClick={openCreate}>Nouvelle commande</Button></header>
    {error && <div className="form-error">{error}</div>}{notice && <div className="form-success">{notice}</div>}
    <section className="metrics"><StatCard label="Commandes" value={orders.length} detail="Toutes les commandes" icon={ClipboardList}/><StatCard label="À préparer" value={orders.filter((item) => item.statut === "en attente").length} detail="En attente de facturation" icon={Truck} tone="orange"/><StatCard label="Facturées" value={orders.filter((item) => item.statut === "livrée").length} detail="Factures créées" icon={Truck} tone="green"/><StatCard label="Montant commandé" value={formatCurrency(total)} detail="Valeur totale" icon={ClipboardList}/></section>
    <div className="toolbar"><select className="filter-select" aria-label="Filtrer par statut" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="tous">Tous les statuts</option><option value="en attente">En attente</option><option value="livrée">Facturées</option><option value="annulée">Annulées</option></select><SearchBar value={query} onChange={setQuery} placeholder="Filtrer par numéro ou client..." /></div>
    <section className="panel"><div className="panel-head"><div><h2>Liste des commandes</h2><p>{filteredOrders.length} commande(s) visible(s)</p></div><Badge>Suivi à jour</Badge></div><Table rows={filteredOrders} columns={columns}/></section>
    <Modal open={open} title={selectedId ? "Modifier la commande" : "Nouvelle commande"} onClose={() => setOpen(false)} footer={<><Button onClick={() => setOpen(false)}>Annuler</Button><Button variant="primary" onClick={submit}>Enregistrer</Button></>}>
      {error && <div className="form-error">{error}</div>}
      <div className="form-grid" style={{ marginTop: error ? 12 : 0 }}>
        <Input label="Date de commande" type="date" value={form.date_commande || ""} onChange={(event) => setForm({ ...form, date_commande: event.target.value })}/>
        <Input label="Livraison prévue" type="date" value={form.date_livraison_prevue || ""} onChange={(event) => setForm({ ...form, date_livraison_prevue: event.target.value })}/>
        <Select className="full" label="Client" value={form.client_id || ""} onChange={(event) => setForm({ ...form, client_id: event.target.value })} options={[{ value: "", label: "Sélectionner" }, ...clients.map((item) => ({ value: item.id, label: item.raison_sociale }))]}/>
        <div className="order-lines full">
          <div className="order-lines-head"><strong>Produits commandés</strong><Button size="sm" icon={Plus} onClick={addLine}>Ajouter un produit</Button></div>
          {form.details.map((line, index) => <div className="order-line" key={`${index}-${line.id_produit_fini}`}>
            <Select label={`Produit ${index + 1}`} value={line.id_produit_fini || ""} onChange={(event) => chooseProduct(index, event.target.value)} options={[{ value: "", label: "Sélectionner" }, ...products.map((item) => ({ value: item.id, label: `${item.libelle} - stock ${item.stock_actuel}` }))]}/>
            <Input label="Quantité" type="number" min="0.01" step="0.01" value={line.quantite_commandee || ""} onChange={(event) => updateLine(index, { quantite_commandee: event.target.value })}/>
            <Input label="Prix unitaire" type="number" min="0" step="0.01" value={line.prix_vente_unitaire || ""} onChange={(event) => updateLine(index, { prix_vente_unitaire: event.target.value })}/>
            <div className="line-total"><span>Sous-total</span><strong>{formatCurrency(Number(line.quantite_commandee || 0) * Number(line.prix_vente_unitaire || 0))}</strong></div>
            {form.details.length > 1 && <button type="button" className="icon-btn table-action danger" title="Retirer ce produit" onClick={() => removeLine(index)}><Trash2 /></button>}
          </div>)}
        </div>
        <Input label="Acompte reçu" type="number" min="0" step="0.01" value={form.montant_anticipation || ""} onChange={(event) => setForm({ ...form, montant_anticipation: event.target.value })}/>
        {Number(form.montant_anticipation || 0) > 0 && (
          <Input label="Date de l'acompte" type="date" value={form.date_paiement_anticipation || form.date_commande} onChange={(event) => setForm({ ...form, date_paiement_anticipation: event.target.value })}/>
        )}
        <div className="form-total full"><span>Prix total de la commande</span><strong>{formatCurrency(orderTotal)}</strong></div>
      </div>
    </Modal>
  </div>;
}
