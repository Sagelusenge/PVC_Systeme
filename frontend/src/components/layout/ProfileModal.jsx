import { useEffect, useState } from "react";
import { Camera, Save, Trash2 } from "lucide-react";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";

export default function ProfileModal({ open, user, onClose, onSave }) {
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({ nom_utilisateur: user?.nom_utilisateur || "", email: user?.email || "", photo_url: user?.photo_url || "", mot_de_passe_actuel: "", nouveau_mot_de_passe: "" });
      setError("");
    }
  }, [open, user]);

  const choosePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 500 * 1024) {
      setError("Choisissez une image JPG, PNG ou WebP de moins de 500 Ko.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, photo_url: reader.result }));
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    setBusy(true); setError("");
    try {
      const payload = { ...form };
      if (!payload.nouveau_mot_de_passe) {
        delete payload.nouveau_mot_de_passe;
        delete payload.mot_de_passe_actuel;
      }
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const initials = (form.nom_utilisateur || "U").slice(0, 2).toUpperCase();
  return <Modal open={open} title="Mon profil" onClose={onClose} footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" icon={Save} disabled={busy} onClick={submit}>{busy ? "Enregistrement..." : "Enregistrer"}</Button></>}>
    {error && <div className="form-error">{error}</div>}
    <div className="profile-photo-row">
      <div className="profile-preview">{form.photo_url ? <img src={form.photo_url} alt="Photo de profil" /> : initials}</div>
      <div className="profile-photo-actions">
        <label className="btn btn-sm"><Camera /> Choisir une photo<input className="visually-hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={choosePhoto} /></label>
        {form.photo_url && <Button size="sm" icon={Trash2} onClick={() => setForm({ ...form, photo_url: "" })}>Retirer</Button>}
        <small>JPG, PNG ou WebP, 500 Ko maximum.</small>
      </div>
    </div>
    <div className="form-grid profile-form">
      <Input label="Nom utilisateur" value={form.nom_utilisateur || ""} onChange={(event) => setForm({ ...form, nom_utilisateur: event.target.value })} required />
      <Input label="Adresse email" type="email" value={form.email || ""} onChange={(event) => setForm({ ...form, email: event.target.value })} />
      <Input label="Mot de passe actuel" type="password" value={form.mot_de_passe_actuel || ""} onChange={(event) => setForm({ ...form, mot_de_passe_actuel: event.target.value })} autoComplete="current-password" />
      <Input label="Nouveau mot de passe" type="password" value={form.nouveau_mot_de_passe || ""} onChange={(event) => setForm({ ...form, nouveau_mot_de_passe: event.target.value })} autoComplete="new-password" />
    </div>
  </Modal>;
}
