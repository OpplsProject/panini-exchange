import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'bg-white text-panini-blue'
        : 'text-white hover:bg-blue-700'
    }`;

  return (
    <nav className="bg-panini-blue shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/coleccion" className="flex items-center gap-2">
            <span className="text-2xl">⚽</span>
            <span className="text-white font-bold text-lg hidden sm:block">Panini Mundial 2026</span>
          </Link>

          {user && (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link to="/coleccion" className={linkClass('/coleccion')}>
                Mi Colección
              </Link>
              <Link to="/comparar" className={linkClass('/comparar')}>
                Intercambiar
              </Link>
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-blue-400">
                <span className="text-blue-200 text-sm hidden sm:block">@{user.username}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs bg-panini-red hover:bg-red-700 text-white px-3 py-1.5 rounded-md transition-colors"
                >
                  Salir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
