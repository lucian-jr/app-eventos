import type { ReactNode } from "react";

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Enquanto verifica autenticação
  if (loading) {
    return (
      <div className="w-full min-h-[100vh] flex justify-center items-center">
        <p>Carregando...</p>
      </div>
    );
  }

  // Se não estiver logado → redireciona pro login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Se estiver logado → renderiza a rota normalmente
  return children;
}
