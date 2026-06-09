import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CollectionPage from './pages/CollectionPage';
import ComparePage from './pages/ComparePage';
import AdminPage from './pages/AdminPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import MessagesPage from './pages/MessagesPage';
import MyDuplicatesPage from './pages/MyDuplicatesPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-6">{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-panini-blue">
        <div className="text-white text-center">
          <div className="text-6xl animate-spin mb-4">⚽</div>
          <p className="text-xl font-bold">Panini Mundial 2026</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/coleccion" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/coleccion" replace /> : <RegisterPage />} />
      <Route
        path="/coleccion"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CollectionPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/comparar"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ComparePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/repetidas" element={<ProtectedRoute><AppLayout><MyDuplicatesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
      <Route path="/mensajes" element={<ProtectedRoute><AppLayout><MessagesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to={user ? '/coleccion' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
