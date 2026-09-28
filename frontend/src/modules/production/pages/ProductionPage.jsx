import { useState } from "react";
import { Factory, FileDown, Gauge, PackageCheck, Pencil, Plus, TimerReset, Trash2 } from "lucide-react";
import useFetch from "../../../hooks/useFetch";
import { createProduct, createProductionEntry, deleteProduct, listProducts, listProductionEntries, updateProduct } from "../services/production.api";
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

export default function ProductionPage() {
  const state = useFetch(async () => ({ products: await listProducts(), entries: await listProductionEntries() }), []);
  const [modal, setModal] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  if (state.loading) return <Loader />;
  const products = state.data?.products || [];
  const entries = state.data?.entries || [];

  const open = (type, row = null) => {
    setModal(type); setSelectedId(row?.id || null); setError("");
    setForm(type === "product"
      ? row ? { code: row.code, libelle: row.libelle, unite: row.unite, prix_unitaire: row.prix_unitaire, stock_actuel: row.stock_actuel } : { unite: "PIECE", stock_actuel: 0 }
      : { id_produit_fini: products[0]?.id || "", unite_mesure: "PIECE", date_entree: new Date().toISOString().slice(0, 16) });
  };
  const submit = async () => {
    try {
      if (modal === "product") {
        const payload = { ...form, prix_unitaire: Number(form.prix_unitaire), stock_actuel: Number(form.stock_actuel || 0) };
        if (!payload.code) delete payload.code;
        if (selectedId) await updateProduct(selectedId, payload); else await createProduct(payload);
      } else {
        await createProductionEntry({ ...form, id_produit_fini: Number(form.id_produit_fini), quantite_entree: Number(form.quantite_entree), cout_production_unitaire: Number(form.cout_production_unitaire || 0) });
      }
      setModal(null); setSelectedId(null); await state.refresh();
    } catch (err) { setError(err.message); }
  };
  const removeProduct = async (row) => {
    if (!window.confirm(`Supprimer le produit ${row.code} - ${row.libelle} ?`)) return;
    try { await deleteProduct(row.id); await state.refresh(); } catch (err) { setError(err.message); setModal("message"); }
  };
  const exportProducts = () => exportTablePdf({
    title: "Etat des produits finis",
    columns: [{ key: "code", label: "Code" }, { key: "libelle", label: "Produit" }, { key: "unite", label: "Unite" }, { key: "stock_actuel", label: "Stock" }, { key: "prix_unitaire", label: "Prix unitaire" }, { label: "Valeur", value: (row) => Number(row.stock_actuel) * Number(row.prix_unitaire) }],
    rows: products, filename: "etat-produits-finis.pdf",
  });
  const value = products.reduce((sum, row) => sum + Number(row.stock_actuel) * Number(row.prix_unitaire), 0);
  const columns = [
    { key: "code", label: "Code PF", render: (item) => <span className="mono" style={{ color: "var(--blue-soft)" }}>{item}</span> },
    { key: "libelle", label: "Produit fini", render: (item, row) => <><span className="primary-cell">{item}</span><span className="secondary-cell">Unite: {row.unite}</span></> },
    { key: "stock_actuel", label: "Stock", numeric: true, render: (item, row) => <strong>{item} {row.unite}</strong> },
    { key: "prix_unitaire", label: "Prix unitaire", numeric: true, render: formatCurrency },
    { key: "valeur", label: "Valeur stock", numeric: true, render: (_, row) => formatCurrency(Number(row.stock_actuel) * Number(row.prix_unitaire)) },
    { key: "actions", label: "Actions", render: (_, row) => <div className="row-actions"><button className="icon-btn table-action" title="Modifier" onClick={() => open("product", row)}><Pencil /></button><button className="icon-btn table-action danger" title="Supprimer" onClick={() => removeProduct(row)}><Trash2 /></button></div> },
  ];
  return <div className="page">
    <header className="page-header"><div><span className="eyebrow">Suivi de fabrication</span><h1>Production PVC</h1><p>Produits finis, arrivages de l'atelier et quantités disponibles.</p></div><div className="page-actions"><Button icon={FileDown} onClick={exportProducts}>Imprimer le stock</Button><Button onClick={() => open("product")} icon={Plus}>Nouveau produit</Button><Button variant="primary" onClick={() => open("entry")} icon={Factory}>Ajouter une production</Button></div></header>
    <section className="metrics"><StatCard label="Valeur des produits" value={formatCurrency(value)} detail="Stock valorisé au prix de vente" icon={PackageCheck}/><StatCard label="Produits suivis" value={products.length} detail="Produits disponibles" icon={Factory} tone="green"/><StatCard label="Productions enregistrées" value={entries.length} detail="Arrivages venant de l'atelier" icon={TimerReset} tone="orange"/><StatCard label="Suivi de l'usine" value="ACTIF" detail="Production suivie" icon={Gauge} tone="green" progress={96}/></section>
    <section className="panel"><div className="panel-head"><div><h2>Produits finis</h2><p>Codes automatiques, quantités et valeur</p></div><Badge>{products.length} produit(s)</Badge></div><Table columns={columns} rows={products}/></section>
    <section className="panel"><div className="panel-head"><div><h2>Dernières productions</h2><p>Quantités reçues depuis l'atelier</p></div><Badge>{entries.length} opération(s)</Badge></div><Table rows={entries} columns={[{key:"id",label:"N°"},{key:"id_produit_fini",label:"Produit"},{key:"date_entree",label:"Date",render:formatDate},{key:"quantite_entree",label:"Quantité",numeric:true},{key:"cout_production_unitaire",label:"Coût unitaire",numeric:true,render:formatCurrency}]}/></section>
    <Modal open={modal === "product" || modal === "entry"} title={modal === "product" ? selectedId ? "Modifier le produit fini" : "Nouveau produit fini" : "Nouvelle entree de production"} onClose={() => setModal(null)} footer={<><Button onClick={() => setModal(null)}>Annuler</Button><Button variant="primary" onClick={submit}>Enregistrer</Button></>}>
      {error && <div className="form-error">{error}</div>}<div className="form-grid" style={{ marginTop: 12 }}>{modal === "product" ? <><Input label="Code automatique" value={form.code || "Genere apres enregistrement"} disabled/><Input label="Libelle" value={form.libelle || ""} onChange={(event) => setForm({ ...form, libelle: event.target.value })}/><Input label="Unite" value={form.unite || ""} onChange={(event) => setForm({ ...form, unite: event.target.value })}/><Input label="Prix unitaire" type="number" value={form.prix_unitaire || ""} onChange={(event) => setForm({ ...form, prix_unitaire: event.target.value })}/></> : <><Select label="Produit fini" value={form.id_produit_fini} onChange={(event) => setForm({ ...form, id_produit_fini: event.target.value })} options={products.map((row) => ({ value: row.id, label: `${row.code} - ${row.libelle}` }))}/><Input label="Quantite produite" type="number" value={form.quantite_entree || ""} onChange={(event) => setForm({ ...form, quantite_entree: event.target.value })}/><Select label="Unite" value={form.unite_mesure} onChange={(event) => setForm({ ...form, unite_mesure: event.target.value })} options={["PIECE", "KG", "Litre"]}/><Input label="Cout unitaire" type="number" value={form.cout_production_unitaire || ""} onChange={(event) => setForm({ ...form, cout_production_unitaire: event.target.value })}/></>}</div>
    </Modal>
    <Modal open={modal === "message"} title="Operation impossible" onClose={() => setModal(null)} footer={<Button variant="primary" onClick={() => setModal(null)}>Fermer</Button>}><div className="form-error">{error}</div></Modal>
  </div>;
}
