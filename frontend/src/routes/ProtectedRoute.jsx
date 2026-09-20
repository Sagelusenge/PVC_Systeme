import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../modules/auth/hooks/useAuth";
import Loader from "../components/common/Loader";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullPage />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
