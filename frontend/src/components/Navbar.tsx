import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    api.getUnreadCount().then(r => setUnread(r.count)).catch(() => {});
    const interval = setInterval(() => {
      api.getUnreadCount().then(r => setUnread(r.count)).catch(() => {});
    }, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [user]);

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

  const locationText = user?.locality && user?.province
    ? `${user.locality}, ${user.province}`
    : user?.locality || user?.province || null;

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
              <Link to="/repetidas" className={linkClass('/repetidas')}>
                Repetidas
              </Link>
              <Link to="/mensajes" className={`relative ${linkClass('/mensajes')}`}>
                Mensajes
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-panini-red text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>

              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-blue-400">
                <Link to="/perfil" className="hidden sm:block text-right hover:opacity-80 transition-opacity">
                  <div className="text-blue-200 text-sm font-medium">@{user.username}</div>
                  {locationText
                    ? <div className="text-blue-300 text-xs">📍 {locationText}</div>
                    : <div className="text-blue-400 text-xs italic">+ agregar ubicación</div>
                  }
                </Link>
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
