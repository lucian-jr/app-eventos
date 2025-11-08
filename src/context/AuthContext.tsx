import { useContext, createContext, type ReactNode, useState, useEffect } from 'react';
import { authLogin, checkIsAuth } from '../services/auth/auth.service';
import type { userType } from '../services/auth/auth.types';

type LoginUserData = { login: string; password: string };

type AuthContextType = {
  user: userType | null | undefined; // undefined = carregando; null = deslogado; objeto = logado
  loading: boolean;
  error: string | null;
  login: (data: LoginUserData) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LS_KEY = "mce:user";
const isLocalhost = window.location.hostname === "localhost";
const redirectLoginUrlBase = "https://www.meucopoeco.com.br/site/login?src=";

export function AuthProvider({ children }: { children: ReactNode }) {
  // ⬇️ inicia como "desconhecido" e "carregando"
  const [user, setUser] = useState<userType | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAuth = async () => {
      setLoading(true);
      try {
        const res = await checkIsAuth();

        if (res.status === "success" && res.user_data) {
          const u: userType = {
            id: res.user_data.id,
            nome: res.user_data.nome,
            email: res.user_data.email
          };
          setUser(u);
          localStorage.setItem(LS_KEY, JSON.stringify(u));
        } else {
          // não autenticado
          if (isLocalhost) {
            const raw = localStorage.getItem(LS_KEY);
            if (raw) {
              try {
                const parsed = JSON.parse(raw) as userType;
                setUser(parsed);
              } catch {
                localStorage.removeItem(LS_KEY);
                setUser(null); // ⬅️ deslogado
              }
            } else {
              setUser(null);   // ⬅️ deslogado
            }
          } else {
            // produção: limpa e redireciona para SSO externo com retorno para a URL atual
            localStorage.removeItem(LS_KEY);
            setUser(null); // ⬅️ deslogado
            const returnUrl = encodeURIComponent(window.location.href);
            window.location.href = `${redirectLoginUrlBase}${returnUrl}`;
          }
        }
      } catch (err) {
        console.error(err);
        setError("Falha ao verificar autenticação.");
        setUser(null); // fallback seguro
      } finally {
        setLoading(false);
      }
    };

    fetchAuth();
  }, []);

  const login = async (data: LoginUserData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authLogin(data);
      if (res.status === "success" && res.user_data) {
        const u: userType = {
          id: res.user_data.id,
          nome: res.user_data.nome,
          email: res.user_data.email
        };
        setUser(u);
        localStorage.setItem(LS_KEY, JSON.stringify(u));
      } else {
        setError(res.message || "Falha ao autenticar.");
      }
    } catch {
      setError("Erro de rede ao autenticar.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(LS_KEY);
    if (isLocalhost) {
      setUser(null); // ⬅️ deslogado (não "carregando")
    } else {
      setUser(null);
      const returnUrl = encodeURIComponent(window.location.origin + "/app-eventos/");
      window.location.href = `${redirectLoginUrlBase}${returnUrl}`;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
