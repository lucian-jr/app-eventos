import './App.css'

// Router
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Contexts
import { AuthProvider, useAuth } from './context/AuthContext'

// Components 
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

// Pages
import Home from "./pages/Home/Home"
import Login from './pages/Login/Login'
import CreateEvent from './pages/CreateEvent/CreateEvent'
import Dashboard from './pages/Dashboard/Dashboard'

const BASENAME = import.meta.env.BASE_URL || "/app-eventos";

function AppShell() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full min-h-[100vh] flex justify-center items-center">
        <p>Carregando...</p>
      </div>
    );
  }

  const pageHeight = user
    ? "container max-w-5xl mx-auto min-h-[60vh] mb-[3rem] mt-[2rem] px-4"
    : "w-full min-h-[100vh] flex justify-center items-center";

  return (
    <>
      {user && <Navbar />}
      <div className={pageHeight}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-event"
            element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/:id"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" replace />}
          />
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
