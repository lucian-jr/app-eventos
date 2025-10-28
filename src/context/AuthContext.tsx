import { useContext, createContext, type ReactNode, useState, useEffect } from 'react';
import { authLogin, checkIsAuth } from '../services/auth/auth.service';
import type { userType } from '../services/auth/auth.types';

type LoginUserData = { login: string; password: string };

type AuthContextType = {
    user: userType | null | undefined;
    loading: boolean;
    error: string | null;
    login: (data: LoginUserData) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LS_KEY = "mce:user";

const isLocalhost = window.location.hostname === "localhost";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<userType | null | undefined>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        const fetchAuth = async () => {
            try {
                const res = await checkIsAuth();

                if (res.status === "success" && res.user_data) {
                    const u: userType = { id: res.user_data.id, nome: res.user_data.nome, email: res.user_data.email };

                    setUser(u);
                    localStorage.setItem(LS_KEY, JSON.stringify(u));
                } else {
                    console.log(res.message || "User ainda não autenticado.");

                    if (isLocalhost) {
                        const raw = localStorage.getItem(LS_KEY);

                        if (raw) {
                            try {
                                const parsed = JSON.parse(raw) as userType;
                                setUser(parsed);
                            } catch {
                                localStorage.removeItem(LS_KEY);
                            }
                        } else {
                            setUser(undefined)
                        }

                    } else {
                        setUser(null);
                        localStorage.removeItem(LS_KEY);
                        window.location.href = "https://www.meucopoeco.com.br/site/login?src=https://www.meucopoeco.com.br/app-eventos/";
                    }
                }
            } catch (err) {
                console.error(err);
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
                const u: userType = { id: res.user_data.id, nome: res.user_data.nome, email: res.user_data.email };
                setUser(u);
                localStorage.setItem(LS_KEY, JSON.stringify(u));
            } else {
                setError(res.message || "Falha ao autenticar.");
            }
        } catch (e: any) {
            setError("Erro de rede ao autenticar.");
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(LS_KEY);
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
    return ctx;
}