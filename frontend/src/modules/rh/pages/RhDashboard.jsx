import { useState } from "react";
import { BadgeCheck, Banknote, Clock, FileDown, LogOut, Pencil, Plus, Trash2, UsersRound } from "lucide-react";
import useFetch from "../../../hooks/useFetch";
import { createPayroll, createPersonnel, createPresence, deletePayroll, deletePersonnel, deletePresence, listPayroll, listPayrollPayments, listPersonnel, listPresences, updatePersonnel, updatePresence } from "../services/rh.api";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import Table from "../../../components/common/Table";
import Badge from "../../../components/common/Badge";
import Loader from "../../../components/common/Loader";
import StatCard from "../../dashboard/components/StatCard";
import { formatCurrency } from "../../../utils/currency";
import { exportTablePdf } from "../../../utils/pdf";

const nowLocal = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const toLocal = (value) => value ? new Date(new Date(value).getTime() - new Date(value).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";
const dateTime = (value) => value ? new Date(value).toLocaleString("fr-FR") : "-";

export default function RhDashboard() {
  const state = useFetch(async () => ({ personnel: await listPersonnel(), presences: await listPresences(), payroll: await listPayroll(), payments: await listPayrollPayments() }), []);
  const [tab, setTab] = useState("personnel");
  const [modal, setModal] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  if (state.loading) return <Loader />;
  const { personnel = [], presences = [], payroll = [], payments = [] } = state.data || {};

  const openPersonnel = (row = null) => { setModal("personnel"); setSelectedId(row?.id || null); setError(""); setForm(row ? { nom: row.nom, postnom: row.postnom || "", prenom: row.prenom || "", numtelephon: row.numtelephon || "", adresse: row.adresse || "", statut: Boolean(row.statut) } : { statut: true }); };
  const openPresence = (row = null) => { setModal("presence"); setSelectedId(row?.id || null); setError(""); setForm(row ? { id_agent: row.id_agent, heure_arrivee: toLocal(row.heure_arrivee), heure_sortie: toLocal(row.heure_sortie), est_ferie: Boolean(row.est_ferie) } : { id_agent: personnel[0]?.id || "", heure_arrivee: nowLocal(), heure_sortie: "", est_ferie: false }); };
  const openPayroll = (row = null) => { const agent = row || payroll[0]; setModal("payroll"); setSelectedId(null); setError(""); setForm({ id_agent: agent?.id_agent || "", periode: new Date().toISOString().slice(0, 7), montant_paye: agent?.montant_net || "", devise: "USD", mode_paiement: "Banque", reference_paiement: "" }); };
  const selectedPayroll = payroll.find((row) => Number(row.id_agent) === Number(form.id_agent));

  const submit = async () => {
    try {
      if (modal === "personnel") {
        if (selectedId) await updatePersonnel(selectedId, form); else await createPersonnel(form);
      } else if (modal === "presence") {
        const payload = { ...form, id_agent: Number(form.id_agent), heure_arrivee: new Date(form.heure_arrivee).toISOString(), heure_sortie: form.heure_sortie ? new Date(form.heure_sortie).toISOString() : null };
        if (selectedId) await updatePresence(selectedId, payload); else await createPresence(payload);
      } else if (modal === "payroll") {
        const payload = { ...form, id_agent: Number(form.id_agent), periode: `${form.periode}-01` };
        if (payload.montant_paye === "") delete payload.montant_paye; else payload.montant_paye = Number(payload.montant_paye);
        await createPayroll(payload);
      }
      setModal(null); await state.refresh();
    } catch (err) { setError(err.message); }
  };
  const remove = async (kind, row) => {
    if (!window.confirm("Confirmer la suppression de cette ligne ?")) return;
    try { if (kind === "personnel") await deletePersonnel(row.id); if (kind === "presence") await deletePresence(row.id); if (kind === "payment") await deletePayroll(row.id); await state.refresh(); } catch (err) { setError(err.message); }
  };
  const closeAttendance = async (row) => { try { await updatePresence(row.id, { heure_sortie: new Date().toISOString() }); await state.refresh(); } catch (err) { setError(err.message); } };
  const payslip = (payment) => exportTablePdf({
    title: `Bulletin de paie - ${payment.agent}`,
    subtitle: `Periode ${String(payment.periode).slice(0, 7)} | ${payment.mode_paiement}`,
    summary: [["Reference", payment.reference_paiement || `PAIE-${payment.id}`], ["Statut", payment.statut], ["Devise", payment.devise]],
    columns: [{key:"rubrique",label:"Rubrique"},{key:"montant",label:"Montant"}],
    rows: [{rubrique:"Salaire de base",montant:payment.montant_base},{rubrique:"Avantages",montant:payment.avantages},{rubrique:"Retenues",montant:`-${payment.retenues}`},{rubrique:"Net a payer",montant:payment.montant_net},{rubrique:"Montant paye",montant:payment.montant_paye}],
    filename: `bulletin-${payment.id}-${String(payment.periode).slice(0,7)}.pdf`, orientation: "portrait",
  });
  const exportCurrent = () => {
    if (tab === "personnel") exportTablePdf({ title: "Etat du personnel", columns: [{key:"id",label:"Matricule"},{label:"Agent",value:(row)=>[row.nom,row.postnom,row.prenom].filter(Boolean).join(" ")},{key:"numtelephon",label:"Telephone"},{key:"adresse",label:"Adresse"},{key:"statut",label:"Actif"}], rows: personnel, filename: "etat-personnel.pdf" });
    if (tab === "presences") exportTablePdf({ title: "Etat des presences", columns: [{key:"agent",label:"Agent"},{key:"heure_arrivee",label:"Arrivee"},{key:"heure_sortie",label:"Sortie"},{key:"est_ferie",label:"Ferie"}], rows: presences, filename: "etat-presences.pdf" });
    if (tab === "paie") exportTablePdf({ title: "Journal de paie", columns: [{key:"agent",label:"Agent"},{key:"periode",label:"Periode"},{key:"montant_net",label:"Net"},{key:"montant_paye",label:"Paye"},{key:"mode_paiement",label:"Mode"},{key:"statut",label:"Statut"}], rows: payments, filename: "journal-paie.pdf" });
  };

  const pcols = [{key:"id",label:"Matricule",render:(value)=><span className="mono">AG-{String(value).padStart(4,"0")}</span>},{key:"nom",label:"Agent",render:(value,row)=><strong>{[value,row.postnom,row.prenom].filter(Boolean).join(" ")}</strong>},{key:"numtelephon",label:"Telephone"},{key:"adresse",label:"Adresse"},{key:"statut",label:"Statut",render:(value)=><Badge tone={value?"green":"red"}>{value?"Actif":"Inactif"}</Badge>},{key:"actions",label:"Actions",render:(_,row)=><div className="row-actions"><button className="icon-btn table-action" title="Modifier" onClick={()=>openPersonnel(row)}><Pencil/></button><button className="icon-btn table-action danger" title="Supprimer" onClick={()=>remove("personnel",row)}><Trash2/></button></div>}];
  const presenceCols = [{key:"id",label:"ID"},{key:"agent",label:"Agent",render:(value)=><strong>{value}</strong>},{key:"heure_arrivee",label:"Arrivee",render:dateTime},{key:"heure_sortie",label:"Sortie",render:dateTime},{key:"est_ferie",label:"Ferie",render:(value)=><Badge tone={value?"orange":"green"}>{value?"Oui":"Non"}</Badge>},{key:"actions",label:"Actions",render:(_,row)=><div className="row-actions">{!row.heure_sortie&&<button className="icon-btn table-action" title="Pointer la sortie" onClick={()=>closeAttendance(row)}><LogOut/></button>}<button className="icon-btn table-action" title="Modifier" onClick={()=>openPresence(row)}><Pencil/></button><button className="icon-btn table-action danger" title="Supprimer" onClick={()=>remove("presence",row)}><Trash2/></button></div>}];
  const payrollCols = [{key:"agent",label:"Agent",render:(value)=><strong>{value}</strong>},{key:"nom_poste",label:"Poste"},{key:"salaire_mensuel",label:"Base",numeric:true,render:formatCurrency},{key:"avantages",label:"Avantages",numeric:true,render:formatCurrency},{key:"retenues",label:"Retenues",numeric:true,render:formatCurrency},{key:"montant_net",label:"Net a payer",numeric:true,render:formatCurrency},{key:"actions",label:"Action",render:(_,row)=><Button size="sm" variant="primary" icon={Banknote} onClick={()=>openPayroll(row)}>Creer la paie</Button>}];
  const paymentCols = [{key:"periode",label:"Periode",render:(value)=>String(value).slice(0,7)},{key:"agent",label:"Agent"},{key:"montant_net",label:"Net",numeric:true,render:formatCurrency},{key:"montant_paye",label:"Paye",numeric:true,render:formatCurrency},{key:"mode_paiement",label:"Mode"},{key:"statut",label:"Statut",render:(value)=><Badge tone={value==="Paye"?"green":"orange"}>{value}</Badge>},{key:"actions",label:"Actions",render:(_,row)=><div className="row-actions"><button className="icon-btn table-action" title="Bulletin PDF" onClick={()=>payslip(row)}><FileDown/></button><button className="icon-btn table-action danger" title="Supprimer" onClick={()=>remove("payment",row)}><Trash2/></button></div>}];
  const total = payroll.reduce((sum,row)=>sum+Number(row.montant_net||0),0);
  return <div className="page">
    <header className="page-header"><div><span className="eyebrow">Ressources humaines // usine</span><h1>Personnel, Presences & Paie</h1><p>Effectifs, pointages, calcul et paiement des remunerations.</p></div><div className="page-actions"><Button icon={FileDown} onClick={exportCurrent}>Etat PDF</Button>{tab==="personnel"&&<Button variant="primary" icon={Plus} onClick={()=>openPersonnel()}>Nouvel agent</Button>}{tab==="presences"&&<Button variant="primary" icon={Clock} onClick={()=>openPresence()}>Nouveau pointage</Button>}{tab==="paie"&&<Button variant="primary" icon={Banknote} onClick={()=>openPayroll()}>Creer une paie</Button>}</div></header>
    {error&&<div className="form-error">{error}</div>}
    <section className="metrics"><StatCard label="Effectif total" value={personnel.length} detail="Agents enregistres" icon={UsersRound}/><StatCard label="Agents actifs" value={personnel.filter(row=>row.statut).length} detail="Disponibles" icon={BadgeCheck} tone="green"/><StatCard label="Pointages ouverts" value={presences.filter(row=>!row.heure_sortie).length} detail="Sortie non pointee" icon={Clock} tone="orange"/><StatCard label="Masse salariale nette" value={formatCurrency(total)} detail="Base + avantages - retenues" icon={Banknote}/></section>
    <div className="toolbar"><div className="tabs"><button className={`tab ${tab==="personnel"?"active":""}`} onClick={()=>setTab("personnel")}>Personnel</button><button className={`tab ${tab==="presences"?"active":""}`} onClick={()=>setTab("presences")}>Presences</button><button className={`tab ${tab==="paie"?"active":""}`} onClick={()=>setTab("paie")}>Paie</button></div></div>
    <section className="panel"><div className="panel-head"><div><h2>{tab==="personnel"?"Registre du personnel":tab==="presences"?"Pointages d'arrivee et de sortie":"Preparation de la paie"}</h2><p>{tab==="paie"?"Selectionnez un agent pour enregistrer son paiement mensuel":"Actions de creation, modification et suppression"}</p></div><Badge>{tab}</Badge></div><Table rows={tab==="personnel"?personnel:tab==="presences"?presences:payroll} columns={tab==="personnel"?pcols:tab==="presences"?presenceCols:payrollCols}/></section>
    {tab==="paie"&&<section className="panel"><div className="panel-head"><div><h2>Journal des paiements de salaire</h2><p>Bulletins PDF et historique mensuel</p></div><Badge>{payments.length} paiements</Badge></div><Table rows={payments} columns={paymentCols}/></section>}
    <Modal open={modal==="personnel"} title={selectedId?"Modifier l'agent":"Nouvel agent"} onClose={()=>setModal(null)} footer={<><Button onClick={()=>setModal(null)}>Annuler</Button><Button variant="primary" onClick={submit}>Enregistrer</Button></>}><div className="form-grid"><Input label="Nom" value={form.nom||""} onChange={event=>setForm({...form,nom:event.target.value})}/><Input label="Postnom" value={form.postnom||""} onChange={event=>setForm({...form,postnom:event.target.value})}/><Input label="Prenom" value={form.prenom||""} onChange={event=>setForm({...form,prenom:event.target.value})}/><Input label="Telephone" value={form.numtelephon||""} onChange={event=>setForm({...form,numtelephon:event.target.value})}/><Input className="full" label="Adresse" value={form.adresse||""} onChange={event=>setForm({...form,adresse:event.target.value})}/></div></Modal>
    <Modal open={modal==="presence"} title={selectedId?"Modifier le pointage":"Nouveau pointage"} onClose={()=>setModal(null)} footer={<><Button onClick={()=>setModal(null)}>Annuler</Button><Button variant="primary" onClick={submit}>Enregistrer</Button></>}><div className="form-grid"><Select label="Agent" value={form.id_agent||""} onChange={event=>setForm({...form,id_agent:event.target.value})} options={personnel.filter(row=>row.statut).map(row=>({value:row.id,label:[row.nom,row.postnom,row.prenom].filter(Boolean).join(" ")}))}/><Select label="Jour ferie" value={String(Boolean(form.est_ferie))} onChange={event=>setForm({...form,est_ferie:event.target.value==="true"})} options={[{value:"false",label:"Non"},{value:"true",label:"Oui"}]}/><Input label="Heure d'arrivee" type="datetime-local" value={form.heure_arrivee||""} onChange={event=>setForm({...form,heure_arrivee:event.target.value})}/><Input label="Heure de sortie" type="datetime-local" value={form.heure_sortie||""} onChange={event=>setForm({...form,heure_sortie:event.target.value})}/></div></Modal>
    <Modal open={modal==="payroll"} title="Creer une paie mensuelle" onClose={()=>setModal(null)} footer={<><Button onClick={()=>setModal(null)}>Annuler</Button><Button variant="primary" onClick={submit}>Enregistrer le paiement</Button></>}>
      {error&&<div className="form-error">{error}</div>}<div className="form-grid"><Select label="Agent" value={form.id_agent||""} onChange={event=>{const row=payroll.find(item=>Number(item.id_agent)===Number(event.target.value));setForm({...form,id_agent:event.target.value,montant_paye:row?.montant_net||""})}} options={payroll.filter(row=>row.statut).map(row=>({value:row.id_agent,label:`${row.agent} - ${row.nom_poste||"Sans poste"}`}))}/><Input label="Periode" type="month" value={form.periode||""} onChange={event=>setForm({...form,periode:event.target.value})}/><Input label="Montant paye" type="number" value={form.montant_paye??""} onChange={event=>setForm({...form,montant_paye:event.target.value})}/><Select label="Devise" value={form.devise||"USD"} onChange={event=>setForm({...form,devise:event.target.value})} options={["USD","CDF"]}/><Select label="Mode de paiement" value={form.mode_paiement||"Banque"} onChange={event=>setForm({...form,mode_paiement:event.target.value})} options={["Banque","Especes","Mobile Money"]}/><Input label="Reference" value={form.reference_paiement||""} onChange={event=>setForm({...form,reference_paiement:event.target.value})}/></div>{selectedPayroll&&<div className="accounting-summary" style={{marginTop:14}}><div><strong>{formatCurrency(selectedPayroll.salaire_mensuel)}</strong><span>Base</span></div><div><strong>{formatCurrency(selectedPayroll.avantages)}</strong><span>Avantages</span></div><div><strong>{formatCurrency(selectedPayroll.montant_net)}</strong><span>Net a payer</span></div></div>}
    </Modal>
  </div>;
}
