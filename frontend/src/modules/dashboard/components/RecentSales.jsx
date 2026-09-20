import Table from "../../../components/common/Table";
import Badge from "../../../components/common/Badge";
import { formatCurrency } from "../../../utils/currency";
import { formatDate } from "../../../utils/dates";
export default function RecentSales({ rows = [] }) { const columns=[{key:"date_vente",label:"Date",render:formatDate},{key:"client",label:"Client",render:(v)=><span className="primary-cell">{v||"Client comptoir"}</span>},{key:"type_paiement",label:"Mode"},{key:"etat_paiement",label:"Etat",render:(v)=><Badge tone={v==="payé"?"green":"orange"}>{v}</Badge>},{key:"montant_total_vente",label:"Total",numeric:true,render:formatCurrency}]; return <Table columns={columns} rows={rows} keyField="id_vente" />; }
