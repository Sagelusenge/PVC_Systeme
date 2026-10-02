import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../modules/auth/hooks/useAuth";
import { ROLES } from "../utils/permissions";
export default function RoleRoute({ roles = [] }) {
  const { user } = useAuth();
  return user?.nom_role === ROLES.ADMIN || roles.includes(user?.nom_role) ? <Outlet /> : <Navigate to="/" replace />;
}
