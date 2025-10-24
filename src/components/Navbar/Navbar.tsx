import { NavLink } from "react-router-dom"
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
    const { logout } = useAuth();

    return (
        <header className="shadow-md bg-[#007B8B]">
            <div className="mx-auto max-w-5xl px-4 h-20 flex items-center justify-between">
                <NavLink to='/'>
                    <span className="gap-6 text-slate-800 font-extrabold text-3xl">
                        <img src="https://www.meucopoeco.com.br/assets/site/images/logo-branca.svg" alt="Meu Copo Eco" />
                    </span>
                </NavLink>
                <nav className="flex items-center gap-6 text-slate-400">
                    <NavLink to='/'>
                        Início
                    </NavLink>
                    <li>
                        <button onClick={logout}>Sair</button>
                    </li>
                </nav>
            </div>
        </header>
    )
}

export default Navbar