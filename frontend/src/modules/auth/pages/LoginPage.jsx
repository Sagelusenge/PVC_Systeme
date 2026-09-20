import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import useAuth from "../hooks/useAuth";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";

export default function LoginPage() {
  const { user, login } = useAuth(); const navigate = useNavigate();
  const [form, setForm] = useState({ nom_utilisateur: "", mot_de_passe: "" }); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(""); try { await login(form); navigate("/"); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  return <div className="login-page">
    <div className="login-grid" />
    <section className="login-panel"><div className="login-card"><div className="login-brand"><img src="/pvc-logo.png" alt="PVC Renovee" /><div><h1>PVC Renovee</h1><p>ERP Industriel & Finance</p></div></div><span className="eyebrow">Authentification securisee</span><h2>Bienvenue</h2><p>Connectez-vous pour acceder au centre de controle.</p><form className="login-form" onSubmit={submit}>{error && <div className="form-error">{error}</div>}<Input label="Nom d'utilisateur ou email" value={form.nom_utilisateur} onChange={(e) => setForm({...form,nom_utilisateur:e.target.value})} autoComplete="username" placeholder="exemple@entreprise.com" required /><Input label="Mot de passe" type="password" value={form.mot_de_passe} onChange={(e) => setForm({...form,mot_de_passe:e.target.value})} autoComplete="current-password" placeholder="Votre mot de passe" required /><Button variant="primary" icon={LogIn} disabled={busy}>{busy ? "Connexion..." : "Se connecter"}</Button></form><div className="login-security"><span className="live-dot" />Connexion chiffree et journalisee</div></div></section>
  </div>;
}
