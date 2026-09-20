export default function Button({ variant = "default", size = "default", icon: Icon, children, className = "", ...props }) {
  return <button className={`btn ${variant !== "default" ? `btn-${variant}` : ""} ${size === "sm" ? "btn-sm" : ""} ${className}`} {...props}>{Icon && <Icon />}{children}</button>;
}
