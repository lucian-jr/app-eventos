import './App.css'

import { useEffect, useState } from 'react'

// Router
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Contexts
import { AuthProvider, useAuth } from './context/AuthContext'

// Components 
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'

// Pages
import Home from "./pages/Home/Home"
import Login from './pages/Login/Login'
import type { userType } from './services/auth/auth.types'



const BASENAME = import.meta.env.BASE_URL || "/app-eventos";

function AppShell() {
  const { user } = useAuth();
  const [u, setU] = useState<userType | null | undefined>();

  useEffect(() => {
    if (user) setU(user)
  }, [user])

  if (user === null) {
    return (
      <div className="w-full min-h-[100vh] flex justify-center items-center">
        <p>Carregando...</p>
      </div>
    );
  }

  const pageHeight = u
    ? "container max-w-5xl mx-auto min-h-[60vh] mb-[3rem] mt-[2rem] px-4"
    : "w-full min-h-[100vh] flex justify-center items-center";

  return (
    <>
      {u && <Navbar />}
      <div className={pageHeight}>
        <Routes>
          <Route path="/" element={u ? <Home /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={!u ? <Login /> : <Navigate to="/" replace />} />
        </Routes>
      </div>
      {u && <Footer />}
    </>
  );
}



export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={BASENAME}>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}
