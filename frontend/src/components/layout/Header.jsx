import { useState } from "react";
import { CalendarDays, Menu, Power } from "lucide-react";
import useAuth from "../../modules/auth/hooks/useAuth";
import DailyTip from "./DailyTip";
import ProfileModal from "./ProfileModal";

export default function Header({ onMenu }) {
  const { user, logout, updateProfile } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const initials = (user?.nom_utilisateur || "U").slice(0, 2).toUpperCase();
  return <header className="topbar">
    <div className="topbar-group">
      <button className="icon-btn mobile-menu" onClick={onMenu} aria-label="Menu"><Menu /></button>
      <div className="topbar-control"><CalendarDays size={15} /> Exercice: <strong>{new Date().getFullYear()} - Actif</strong></div>
      <div className="topbar-control currency-toggle">Devise: <button className="active">USD</button><button>FC</button></div>
    </div>
    <div className="topbar-group">
      <DailyTip />
      <button className="user-box user-trigger" onClick={() => setProfileOpen(true)} title="Modifier mon profil"><div><strong>{user?.nom_utilisateur || "Utilisateur"}</strong><small>{user?.nom_role || "Compte ERP"}</small></div><span className="avatar">{user?.photo_url ? <img src={user.photo_url} alt="" /> : initials}</span></button>
      <button className="icon-btn" onClick={logout} title="Deconnexion"><Power /></button>
      <ProfileModal open={profileOpen} user={user} onClose={() => setProfileOpen(false)} onSave={updateProfile} />
    </div>
  </header>;
}
