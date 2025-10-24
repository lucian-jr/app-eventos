import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Person, Lock } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";

const Login = () => {

  const [loginData, setLoginData] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
 

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await login({ login: loginData, password });
    // se logou, o contexto terá user; aqui podemos redirecionar
    navigate("/", { replace: true });
  }

  return (
    <div className="shadow-lg w-md justify-center rounded-xl">
      <div className="animated-bg p-[1.5em] rounded-t-xl">
        <span className="gap-6 text-slate-800 font-extrabold text-3xl flex items-center justify-center mb-3 h-[82.47px]">
          <img src="https://www.meucopoeco.com.br/assets/site/images/logo-branca.svg" width="140px" alt="Meu Copo Eco" />
        </span>
        <h1 className="text-center text-white font-bold text-3xl mb-1">LOGIN</h1>
        <p className="text-center text-white text-14">Acesse sua conta de eventos</p>
      </div>

      <div className="py-6 px-8">
        <form onSubmit={handleSubmit}>
          {error && <p className="msg error-msg">{error}</p>}
          <label>
            <span>Login</span>
            <div className="relative">
              <Person className="absolute top-[14px] left-[14px] opacity-70" />
              <input
                className="iconInput"
                type="loginData"
                name="loginData"
                value={loginData}
                onChange={(e) => setLoginData(e.target.value)}
                required
              />
            </div>
          </label>

          <label>
            <span>Senha</span>
            <div className="relative">
              <Lock className="absolute top-[14px] left-[14px] opacity-70" />
              <input
                className="iconInput"
                type="password"
                name="senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

          </label>

          <div className="flex justify-center">
            <button className="btn btn--filled block animated-bg flex justify-center" disabled={loading}>{loading ? 'Aguarde...' : 'Enviar'}</button>
          </div>

        </form>
      </div>

    </div>
  )
}

export default Login