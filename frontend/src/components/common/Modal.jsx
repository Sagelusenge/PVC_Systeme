import { X } from "lucide-react";
import { createPortal } from "react-dom";
export default function Modal({ open, title, children, footer, onClose }) {
  if (!open) return null;
  return createPortal(<div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal" role="dialog" aria-modal="true"><header className="modal-header"><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Fermer"><X /></button></header><div className="modal-body">{children}</div>{footer && <footer className="modal-footer">{footer}</footer>}</section></div>, document.body);
}
