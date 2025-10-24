import './App.css'
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


const BASENAME = import.meta.env.BASE_URL || "/app-eventos";

function AppShell() {
  const { user } = useAuth();

  const pageHeight = user
    ? "container max-w-5xl mx-auto min-h-[60vh] mb-[3rem] mt-[2rem] px-4"
    : "w-full min-h-[100vh] flex justify-center items-center";

  return (
    <>
      {user && <Navbar />}
      <div className={pageHeight}>
        <Routes>
          <Route path="/" element={user ? <Home /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
        </Routes>
      </div>
      {user && <Footer />}
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
