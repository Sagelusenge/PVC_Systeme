import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import MainLayout from "../components/layout/MainLayout";
import Loader from "../components/common/Loader";

const LoginPage = lazy(() => import("../modules/auth/pages/LoginPage"));
const DashboardPage = lazy(() => import("../modules/dashboard/pages/DashboardPage"));
const StockDashboard = lazy(() => import("../modules/stock/pages/StockDashboard"));
const ProductionPage = lazy(() => import("../modules/production/pages/ProductionPage"));
const VentesPage = lazy(() => import("../modules/ventes/pages/VentesPage"));
const CommandesPage = lazy(() => import("../modules/commandes/pages/CommandesPage"));
const ClientsPage = lazy(() => import("../modules/clients/pages/ClientsPage"));
const ComptabiliteDashboard = lazy(() => import("../modules/comptabilite/pages/ComptabiliteDashboard"));
const EcrituresPage = lazy(() => import("../modules/comptabilite/pages/EcrituresPage"));
const JournalOperationsPage = lazy(() => import("../modules/comptabilite/pages/JournalOperationsPage"));
const GrandLivrePage = lazy(() => import("../modules/comptabilite/pages/GrandLivrePage"));
const BalanceGeneralePage = lazy(() => import("../modules/comptabilite/pages/BalanceGeneralePage"));
const BilanPage = lazy(() => import("../modules/comptabilite/pages/BilanPage"));
const RhDashboard = lazy(() => import("../modules/rh/pages/RhDashboard"));
const ImmobilisationsPage = lazy(() => import("../modules/immobilisations/pages/ImmobilisationsPage"));
const RapportsPage = lazy(() => import("../modules/rapports/pages/RapportsPage"));
const UsersPage = lazy(() => import("../modules/administration/pages/UsersPage"));
const UserGuidePage = lazy(() => import("../modules/guide/pages/UserGuidePage"));

export default function AppRoutes() {
  return <Suspense fallback={<Loader fullPage />}><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}><Route element={<MainLayout />}>
      <Route index element={<DashboardPage />} />
      <Route element={<RoleRoute roles={["Magasinier","Agent d'achat","Responsable production","Direction"]}/>}><Route path="stock" element={<StockDashboard />} /></Route>
      <Route element={<RoleRoute roles={["Responsable production","Direction"]}/>}><Route path="production" element={<ProductionPage />} /></Route>
      <Route element={<RoleRoute roles={["Commercial","Caissier","Direction"]}/>}><Route path="ventes" element={<VentesPage />} /></Route>
      <Route element={<RoleRoute roles={["Commercial","Direction"]}/>}><Route path="commandes" element={<CommandesPage />} /></Route>
      <Route element={<RoleRoute roles={["Commercial","Caissier","Direction"]}/>}><Route path="clients" element={<ClientsPage />} /></Route>
      <Route element={<RoleRoute roles={["Comptable","Direction","Auditeur"]}/>}>
        <Route path="comptabilite" element={<ComptabiliteDashboard />} />
        <Route path="comptabilite/journal" element={<JournalOperationsPage />} />
        <Route path="comptabilite/grand-livre" element={<GrandLivrePage />} />
        <Route path="comptabilite/balance" element={<BalanceGeneralePage />} />
        <Route path="comptabilite/bilan" element={<BilanPage />} />
      </Route>
      <Route element={<RoleRoute roles={["Comptable","Direction"]}/>}><Route path="comptabilite/ecritures" element={<EcrituresPage />} /></Route>
      <Route element={<RoleRoute roles={["RH","Direction"]}/>}><Route path="rh" element={<RhDashboard />} /></Route>
      <Route element={<RoleRoute roles={["Responsable immobilisations","Comptable","Direction"]}/>}><Route path="immobilisations" element={<ImmobilisationsPage />} /></Route>
      <Route element={<RoleRoute roles={["Comptable","Direction","Auditeur"]}/>}><Route path="rapports" element={<RapportsPage />} /></Route>
      <Route element={<RoleRoute roles={[]}/>}><Route path="administration" element={<UsersPage />} /></Route>
      <Route path="guide" element={<UserGuidePage />} />
    </Route></Route>
  </Routes></Suspense>;
}
