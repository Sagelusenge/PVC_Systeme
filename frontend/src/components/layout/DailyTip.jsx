import { useMemo, useState } from "react";
import { Bell, Check, Lightbulb } from "lucide-react";

const tips = [
  ["Stock fiable", "Enregistrez chaque reception avant toute sortie afin que le CMUP reste juste."],
  ["Journal comptable", "Ajoutez un numero de piece unique a chaque ecriture pour faciliter les controles."],
  ["Suivi client", "Consultez les creances avant de confirmer une nouvelle vente a credit."],
  ["Production", "Declare chaque lot produit le jour meme pour garder le stock commercial a jour."],
  ["Alertes matieres", "Traitez d'abord les references passees sous leur seuil de reapprovisionnement."],
  ["Securite", "Utilisez un mot de passe long et renouvelez-le depuis votre profil en cas de doute."],
  ["Immobilisations", "Verifiez la date et la valeur d'acquisition avant de calculer un amortissement."],
  ["Commandes", "Renseignez une date de livraison realiste pour mieux organiser les expeditions."],
  ["Tableau de bord", "Commencez la journee par les alertes de stock et les creances en attente."],
  ["Tracabilite", "Evitez de modifier une operation terminee sans conserver sa piece justificative."],
];

function localDateKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function DailyTip() {
  const dateKey = localDateKey();
  const storageKey = `pvc_tip_seen_${dateKey}`;
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(() => localStorage.getItem(storageKey) === "1");
  const tip = useMemo(() => {
    const start = new Date(new Date().getFullYear(), 0, 0);
    const day = Math.floor((new Date() - start) / 86400000);
    return tips[day % tips.length];
  }, [dateKey]);

  const acknowledge = () => {
    localStorage.setItem(storageKey, "1");
    setSeen(true);
    setOpen(false);
  };

  return <div className="notification-wrap">
    <button className="icon-btn" title={seen ? "Astuce du jour lue" : "Nouvelle astuce du jour"} onClick={() => !seen && setOpen((value) => !value)} aria-label="Notifications">
      <Bell />{!seen && <span className="notification-dot" />}
    </button>
    {open && <div className="notification-popover" role="status">
      <div className="notification-title"><Lightbulb /><span>Astuce du jour</span></div>
      <strong>{tip[0]}</strong>
      <p>{tip[1]}</p>
      <button className="tip-action" onClick={acknowledge}><Check /> J'ai compris</button>
    </div>}
  </div>;
}
