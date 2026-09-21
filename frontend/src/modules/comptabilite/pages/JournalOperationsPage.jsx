import useFetch from "../../../hooks/useFetch";
import { listOperations } from "../services/comptabilite.api";
import AccountingNav from "../components/AccountingNav";
import Table from "../../../components/common/Table";
import Badge from "../../../components/common/Badge";
import Loader from "../../../components/common/Loader";
import { formatCurrency } from "../../../utils/currency";
import { formatDate } from "../../../utils/dates";
import { FileDown } from "lucide-react";
import Button from "../../../components/common/Button";
import { exportTablePdf } from "../../../utils/pdf";

export default function JournalOperationsPage(){const state=useFetch(listOperations,[]);if(state.loading)return<Loader/>;const rows=state.data||[];const columns=[{key:"date_ecriture",label:"Date",render:formatDate},{key:"numdocument",label:"Piece",render:(value)=><span className="mono">{value}</span>},{key:"compte",label:"Compte"},{key:"sous_compte",label:"Sous-compte"},{key:"sous_compte_intitule",label:"Intitule"},{key:"libelle",label:"Libelle"},{key:"debit",label:"Debit",numeric:true,render:(value)=>formatCurrency(value)},{key:"credit",label:"Credit",numeric:true,render:(value)=>formatCurrency(value)}];const pdf=()=>exportTablePdf({title:"Journal des operations",columns:[{key:"date_ecriture",label:"Date"},{key:"numdocument",label:"Piece"},{key:"compte",label:"Compte"},{key:"sous_compte",label:"Sous-compte"},{key:"libelle",label:"Libelle"},{key:"debit",label:"Debit"},{key:"credit",label:"Credit"}],rows,filename:"journal-operations.pdf"});return <div className="page"><header className="page-header"><div><span className="eyebrow">Journal centralisateur // lecture chronologique</span><h1>Journal des Operations</h1><p>Toutes les ecritures classees par date et piece comptable.</p></div><Button variant="primary" icon={FileDown} onClick={pdf}>PDF / Imprimer</Button></header><AccountingNav/><section className="panel"><div className="panel-head"><h2>Mouvements comptabilises</h2><Badge>{rows.length} lignes</Badge></div><Table rows={rows} columns={columns} keyField="id_ecriture"/></section></div>}
