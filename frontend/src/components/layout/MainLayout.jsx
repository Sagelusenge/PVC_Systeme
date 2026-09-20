import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ErrorBoundary from "../common/ErrorBoundary";

export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  return <div className="app-shell"><Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} /><div className="app-content"><Header onMenu={() => setMenuOpen((value) => !value)} /><main className="main-content"><ErrorBoundary resetKey={location.pathname}><Outlet /></ErrorBoundary></main></div></div>;
}
