import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({ label, className = "", type = "text", ...props }) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  return <label className={`field ${className}`}>
    <span>{label}</span>
    {isPassword ? <span className="password-field">
      <input {...props} type={visible ? "text" : "password"} />
      <button type="button" className="password-toggle" aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"} onClick={() => setVisible((value) => !value)}>
        {visible ? <EyeOff /> : <Eye />}
      </button>
    </span> : <input {...props} type={type} />}
  </label>;
}
