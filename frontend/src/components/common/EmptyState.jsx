import { Database } from "lucide-react";
export default function EmptyState({ title = "Aucune donnee", message = "Les prochains enregistrements apparaitront ici." }) {
  return <div className="empty"><div><Database size={28} /><strong style={{display:"block",marginTop:8}}>{title}</strong><small>{message}</small></div></div>;
}
