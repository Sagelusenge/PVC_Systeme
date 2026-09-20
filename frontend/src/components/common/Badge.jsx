export default function Badge({ tone = "default", children }) { return <span className={`badge ${tone}`}>{children}</span>; }
