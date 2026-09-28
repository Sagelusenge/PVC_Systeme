import { useState } from "react";
import { Banknote, Ban, CircleDollarSign, Clock3, FileDown, PlusCircle, ReceiptText } from "lucide-react";
import useFetch from "../../../hooks/useFetch";
import useAuth from "../../auth/hooks/useAuth";
import { cancelPayment, createPayment, createSale, getSale, listClients, listPayments, listProducts, listSales } from "../services/ventes.api";
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

export default function VentesPage() {
  const { user } = useAuth();
  const state = useFetch(async () => {
    const [sales, payments, clients, products] = await Promise.all([listSales(), listPayments(), listClients(), listProducts()]);
    return { sales, payments, clients, products };
  }, []);
  const [tab, setTab] = useState("sales");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  if (state.loading) return <Loader />;
  const { sales = [], payments = [], clients = [], products = [] } = state.data || {};
  const clientById = (id) => clients.find((item) => Number(item.id) === Number(id));

  const open = (type) => {
    setModal(type); setError(""); setNotice("");
    setForm(type === "sale" ? {
      date_vente: new Date().toISOString().slice(0, 10), client_id: clients[0]?.id || "",
      id_produit_fini: products[0]?.id || "", quantite_vendue: 1,
      prix_vente_unitaire_reel: products[0]?.prix_unitaire || 0, montant_payee: 0, type_paiement: "CREDIT",
    } : {
      id_vente: sales[0]?.id || "", id_client: sales[0]?.client_id || "",
      date_paiement: new Date().toISOString().slice(0, 16), um: "USD", type_paiement: "Comptant",
    });
  };
  const submit = async () => {
    try {
      if (modal === "sale") {
        await createSale({
          date_vente: form.date_vente, client_id: Number(form.client_id), montant_payee: Number(form.montant_payee || 0),
          type_paiement: form.type_paiement,
          details: [{ id_produit_fini: Number(form.id_produit_fini), quantite_vendue: Number(form.quantite_vendue), prix_vente_unitaire_reel: Number(form.prix_vente_unitaire_reel) }],
        });
        setNotice("Vente enregistrée : stock, client, paiement initial et comptabilité mis à jour.");
      } else {
        await createPayment({ ...form, id_vente: Number(form.id_vente), id_client: Number(form.id_client), montant_paye: Number(form.montant_paye) });
        setNotice("Paiement enregistré et comptabilisé.");
      }
      setModal(null); setError(""); await state.refresh();
    } catch (err) { setError(err.message); }
  };
  const printSale = async (row) => {
    try {
      const sale = await getSale(row.id);
      const client = clientById(sale.client_id);
      await exportTablePdf({
        title: "Facture client", documentNumber: `VTE-${String(sale.id).padStart(5, "0")}`,
        subtitle: `Facture du ${formatDate(sale.date_vente)} | Paiement : ${sale.type_paiement}`,
        recipient: { title: "Facturé à", name: client?.raison_sociale || sale.client, details: client?.adresse || "Adresse non renseignée" },
        columns: [
          { key: "code", label: "Code" }, { key: "libelle", label: "Produit" },
          { key: "quantite_vendue", label: "Quantité" }, { key: "prix_vente_unitaire_reel", label: "Prix unitaire" },
          { label: "Total", value: (line) => formatCurrency(Number(line.quantite_vendue) * Number(line.prix_vente_unitaire_reel)) },
        ],
        rows: sale.details || [], orientation: "portrait",
        summary: [["Total", formatCurrency(sale.montant_total_vente)], ["Payé", formatCurrency(sale.montant_payee)], ["Reste", formatCurrency(Number(sale.montant_total_vente) - Number(sale.montant_payee))], ["Statut", sale.etat_paiement]],
        notes: "Merci pour votre confiance. Cette facture est générée depuis les données validées de PVC Systeme.",
        signatures: true, filename: `facture-VTE-${String(sale.id).padStart(5, "0")}.pdf`,
      });
    } catch (err) { setError(err.message); }
  };
  const printReceipt = (row) => exportTablePdf({
    title: "Reçu de paiement", documentNumber: `REC-${String(row.id_paiement).padStart(5, "0")}`,
    subtitle: `Paiement reçu le ${formatDate(row.date_paiement)}`,
    recipient: { title: "Client", name: clientById(row.id_client)?.raison_sociale || `Client #${row.id_client}`, details: row.libelle },
    columns: [{ key: "libelle", label: "Motif" }, { key: "type_paiement", label: "Mode" }, { key: "um", label: "Devise" }, { key: "montant_paye", label: "Montant" }, { key: "statut_paiement", label: "Statut" }],
    rows: [row], summary: [["Montant reçu", formatCurrency(row.montant_paye)], ["Vente", `VTE-${String(row.id_vente).padStart(5, "0")}`]],
    signatures: true, orientation: "portrait", filename: `recu-REC-${String(row.id_paiement).padStart(5, "0")}.pdf`,
  });
  const annul = async (row) => {
    if (!window.confirm(`Annuler le reçu REC-${row.id_paiement} ? Une écriture inverse sera créée.`)) return;
    try { await cancelPayment(row.id_paiement); setNotice("Paiement annulé avec écriture comptable inverse."); setError(""); await state.refresh(); }
    catch (err) { setError(err.message); }
  };

  const salesTotal = sales.reduce((sum, item) => sum + Number(item.montant_total_vente), 0);
  const paidTotal = sales.reduce((sum, item) => sum + Number(item.montant_payee), 0);
  const saleColumns = [
    { key: "id", label: "N° facture", render: (value) => <span className="mono" style={{ color: "var(--blue-soft)" }}>VTE-{String(value).padStart(5, "0")}</span> },
    { key: "date_vente", label: "Date", render: formatDate },
    { key: "client_id", label: "Client", render: (value) => clientById(value)?.raison_sociale || `Client #${value}` },
    { key: "type_paiement", label: "Mode" },
    { key: "etat_paiement", label: "Paiement", render: (value) => <Badge tone={value === "payé" ? "green" : "orange"}>{value}</Badge> },
    { key: "montant_total_vente", label: "Total", numeric: true, render: formatCurrency },
    { key: "montant_payee", label: "Payé", numeric: true, render: formatCurrency },
    { key: "actions", label: "Actions", render: (_, row) => <div className="row-actions"><button className="icon-btn table-action" title="Imprimer la facture" onClick={() => printSale(row)}><FileDown /></button></div> },
  ];
  const paymentColumns = [
    { key: "id_paiement", label: "Reçu", render: (value) => <span className="mono">REC-{value}</span> },
    { key: "date_paiement", label: "Date", render: formatDate }, { key: "libelle", label: "Motif" },
    { key: "type_paiement", label: "Mode" },
    { key: "statut_paiement", label: "Statut", render: (value) => <Badge tone={value === "Réglé" ? "green" : value === "Annulé" ? "red" : "orange"}>{value}</Badge> },
    { key: "montant_paye", label: "Montant", numeric: true, render: formatCurrency },
    { key: "actions", label: "Actions", render: (_, row) => <div className="row-actions"><button className="icon-btn table-action" title="Imprimer le reçu" onClick={() => printReceipt(row)}><FileDown /></button>{["Direction", "Administrateur"].includes(user?.nom_role) && row.statut_paiement !== "Annulé" && <button className="icon-btn table-action danger" title="Annuler le paiement" onClick={() => annul(row)}><Ban /></button>}</div> },
  ];

  return <div className="page">
    <header className="page-header"><div><span className="eyebrow">Ventes et encaissements</span><h1>Factures clients</h1><p>Créez une vente, imprimez la facture et suivez les paiements.</p></div><div className="page-actions"><Button icon={Banknote} onClick={() => open("payment")}>Nouveau paiement</Button><Button variant="primary" icon={PlusCircle} onClick={() => open("sale")}>Nouvelle vente</Button></div></header>
    {error && <div className="form-error">{error}</div>}{notice && <div className="form-success">{notice}</div>}
    <section className="metrics"><StatCard label="Total facturé" value={formatCurrency(salesTotal)} detail={`${sales.length} facture(s)`} icon={ReceiptText}/><StatCard label="Montant encaissé" value={formatCurrency(paidTotal)} detail={`Recouvrement ${salesTotal ? Math.round(paidTotal / salesTotal * 100) : 0}%`} icon={Banknote} tone="green"/><StatCard label="Reste à encaisser" value={formatCurrency(salesTotal - paidTotal)} detail="Créances clients" icon={Clock3} tone="orange"/><StatCard label="Clients" value={clients.length} detail="Comptes actifs" icon={CircleDollarSign}/></section>
    <div className="toolbar"><div className="tabs"><button className={`tab ${tab === "sales" ? "active" : ""}`} onClick={() => setTab("sales")}>Factures</button><button className={`tab ${tab === "payments" ? "active" : ""}`} onClick={() => setTab("payments")}>Paiements reçus</button></div></div>
    <section className="panel"><div className="panel-head"><div><h2>{tab === "sales" ? "Liste des factures" : "Liste des paiements"}</h2><p>Mise à jour automatique du stock, du client et de la comptabilité</p></div><Badge>{tab === "sales" ? sales.length : payments.length} ligne(s)</Badge></div><Table rows={tab === "sales" ? sales : payments} columns={tab === "sales" ? saleColumns : paymentColumns} keyField={tab === "sales" ? "id" : "id_paiement"}/></section>
    <Modal open={Boolean(modal)} title={modal === "sale" ? "Nouvelle vente" : "Nouveau paiement"} onClose={() => setModal(null)} footer={<><Button onClick={() => setModal(null)}>Annuler</Button><Button variant="primary" onClick={submit}>Enregistrer</Button></>}>
      {error && <div className="form-error">{error}</div>}<div className="form-grid" style={{ marginTop: 12 }}>
        {modal === "sale" ? <><Input label="Date" type="date" value={form.date_vente || ""} onChange={(event) => setForm({ ...form, date_vente: event.target.value })}/><Select label="Client" value={form.client_id} onChange={(event) => setForm({ ...form, client_id: event.target.value })} options={clients.map((item) => ({ value: item.id, label: item.raison_sociale }))}/><Select label="Produit" value={form.id_produit_fini} onChange={(event) => { const product = products.find((item) => String(item.id) === String(event.target.value)); setForm({ ...form, id_produit_fini: event.target.value, prix_vente_unitaire_reel: product?.prix_unitaire || 0 }); }} options={products.map((item) => ({ value: item.id, label: `${item.code} - ${item.libelle} (stock ${item.stock_actuel})` }))}/><Input label="Quantité" type="number" value={form.quantite_vendue || ""} onChange={(event) => setForm({ ...form, quantite_vendue: event.target.value })}/><Input label="Prix unitaire" type="number" value={form.prix_vente_unitaire_reel || ""} onChange={(event) => setForm({ ...form, prix_vente_unitaire_reel: event.target.value })}/><Input label="Montant reçu" type="number" value={form.montant_payee || ""} onChange={(event) => setForm({ ...form, montant_payee: event.target.value })}/><Select label="Mode de paiement" value={form.type_paiement} onChange={(event) => setForm({ ...form, type_paiement: event.target.value })} options={[{ value: "CASH", label: "Comptant" }, { value: "CREDIT", label: "Crédit" }, { value: "ANTICIPATION", label: "Acompte" }]}/></> : <><Select label="Facture" value={form.id_vente} onChange={(event) => { const sale = sales.find((item) => String(item.id) === String(event.target.value)); setForm({ ...form, id_vente: event.target.value, id_client: sale?.client_id || "" }); }} options={sales.filter((item) => item.etat_paiement !== "payé").map((item) => ({ value: item.id, label: `VTE-${item.id} - reste ${formatCurrency(Number(item.montant_total_vente) - Number(item.montant_payee))}` }))}/><Input label="Motif" value={form.libelle || ""} onChange={(event) => setForm({ ...form, libelle: event.target.value })}/><Input label="Montant reçu" type="number" value={form.montant_paye || ""} onChange={(event) => setForm({ ...form, montant_paye: event.target.value })}/><Select label="Devise" value={form.um} onChange={(event) => setForm({ ...form, um: event.target.value })} options={["USD", "CDF"]}/><Select label="Mode" value={form.type_paiement} onChange={(event) => setForm({ ...form, type_paiement: event.target.value })} options={["Comptant", "Crédit", "Anticipation"]}/></>}
      </div>
    </Modal>
  </div>;
}
