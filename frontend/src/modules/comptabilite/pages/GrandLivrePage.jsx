import { useMemo } from "react";
import useFetch from "../../../hooks/useFetch";
import { listOperations } from "../services/comptabilite.api";
import AccountingNav from "../components/AccountingNav";
import Table from "../../../components/common/Table";
import Badge from "../../../components/common/Badge";
import Loader from "../../../components/common/Loader";
import { formatCurrency } from "../../../utils/currency";
import { FileDown } from "lucide-react";
import Button from "../../../components/common/Button";
import { exportTablePdf } from "../../../utils/pdf";

export default function GrandLivrePage(){const state=useFetch(listOperations,[]);const rows=useMemo(()=>{const grouped=new Map();for(const row of state.data||[]){const key=`${row.compte}-${row.sous_compte}`;const current=grouped.get(key)||{id:key,compte:row.compte,compte_intitule:row.compte_intitule,sous_compte:row.sous_compte,sous_compte_intitule:row.sous_compte_intitule,debit:0,credit:0};current.debit+=Number(row.debit||0);current.credit+=Number(row.credit||0);grouped.set(key,current)}return [...grouped.values()].map((row)=>({...row,solde:row.debit-row.credit}))},[state.data]);if(state.loading)return<Loader/>;const columns=[{key:"compte",label:"Compte"},{key:"compte_intitule",label:"Classe comptable"},{key:"sous_compte",label:"Sous-compte"},{key:"sous_compte_intitule",label:"Intitule"},{key:"debit",label:"Total debit",numeric:true,render:(value)=>formatCurrency(value)},{key:"credit",label:"Total credit",numeric:true,render:(value)=>formatCurrency(value)},{key:"solde",label:"Solde",numeric:true,render:(value)=>formatCurrency(value)}];const pdf=()=>exportTablePdf({title:"Grand livre analytique",columns:columns.filter(column=>column.key!=="actions"),rows,filename:"grand-livre.pdf"});return <div className="page"><header className="page-header"><div><span className="eyebrow">Grand livre // regroupement par compte</span><h1>Grand Livre Analytique</h1><p>Cumul des mouvements et solde de chaque sous-compte.</p></div><Button variant="primary" icon={FileDown} onClick={pdf}>PDF / Imprimer</Button></header><AccountingNav/><section className="panel"><div className="panel-head"><h2>Soldes par compte</h2><Badge>{rows.length} comptes</Badge></div><Table rows={rows} columns={columns}/></section></div>}
