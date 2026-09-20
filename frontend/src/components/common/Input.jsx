export default function Input({ label, className = "", ...props }) { return <label className={`field ${className}`}><span>{label}</span><input {...props} /></label>; }
