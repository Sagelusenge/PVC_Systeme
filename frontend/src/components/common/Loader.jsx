export default function Loader({ fullPage = false }) {
  return <div className="loading" style={fullPage ? { minHeight: "100vh" } : undefined}><div><div className="spinner" />Synchronisation ERP...</div></div>;
}
