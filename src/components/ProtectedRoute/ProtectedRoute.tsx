import type { ReactNode } from "react";

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminTokenFromSearch } from "../../utils/adminAccess";


type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const adminToken = adminTokenFromSearch(location.search);

  // Enquanto verifica autenticação
  if (loading) {
    return (
      <div className="w-full min-h-[100vh] flex justify-center items-center">
        <p>Carregando...</p>
      </div>
    );
  }

  // Sem login, o token admin na URL abre o evento. A API confirma o token.
  if (!user && !adminToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Se estiver logado → renderiza a rota normalmente
  return children;
}
