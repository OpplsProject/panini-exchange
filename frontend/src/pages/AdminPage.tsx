import { useState } from 'react';

interface Stats {
  totalUsers: number;
  totalStickers: number;
  activeUsers: number;
}

interface UserRow {
  id: number;
  username: string;
  email: string;
  created_at: string;
  stickers_count: number;
  duplicates_count: number;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function fetchAdmin(pwd: string) {
    setLoading(true);
    setError('');
    try {
      const headers = { 'x-admin-password': pwd, 'Content-Type': 'application/json' };
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/users', { headers }),
      ]);
      if (!statsRes.ok) throw new Error('Contraseña incorrecta');
      setStats(await statsRes.json());
      setUsers(await usersRes.json());
      setAuthed(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(id: number, username: string) {
    if (!confirm(`¿Borrar al usuario @${username}? Esta acción no se puede deshacer.`)) return;
    await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': password },
    });
    setUsers(prev => prev.filter(u => u.id !== id));
    if (stats) setStats({ ...stats, totalUsers: stats.totalUsers - 1 });
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🔐</div>
            <h1 className="text-white text-xl font-bold">Panel de Administración</h1>
            <p className="text-gray-400 text-sm mt-1">Panini Mundial 2026</p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-2 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={e => { e.preventDefault(); fetchAdmin(password); }} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña de admin"
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Ingresando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">🔐 Panel de Admin</h1>
            <p className="text-gray-400 text-sm">Panini Mundial 2026</p>
          </div>
          <button
            onClick={() => { setAuthed(false); setPassword(''); }}
            className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            Salir
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard label="Usuarios registrados" value={stats.totalUsers} icon="👤" />
            <StatCard label="Usuarios activos" value={stats.activeUsers} icon="✅" />
            <StatCard label="Figuritas marcadas" value={stats.totalStickers} icon="⚽" />
          </div>
        )}

        {/* Users Table */}
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <h2 className="font-bold text-lg">Usuarios ({users.length})</h2>
            <button
              onClick={() => fetchAdmin(password)}
              className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg transition-colors"
            >
              🔄 Actualizar
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
                  <th className="text-left px-4 py-3">Usuario</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-center px-4 py-3">Figuritas</th>
                  <th className="text-center px-4 py-3">Repetidas</th>
                  <th className="text-left px-4 py-3">Registrado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No hay usuarios registrados
                    </td>
                  </tr>
                )}
                {users.map(user => (
                  <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 font-medium">@{user.username}</td>
                    <td className="px-4 py-3 text-gray-300">{user.email}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-green-900/50 text-green-300 px-2 py-0.5 rounded-full text-xs font-bold">
                        {user.stickers_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-yellow-900/50 text-yellow-300 px-2 py-0.5 rounded-full text-xs font-bold">
                        {user.duplicates_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(user.created_at).toLocaleDateString('es-AR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteUser(user.id, user.username)}
                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-900/30 transition-colors"
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 text-center">
      <div className="text-3xl mb-1">{icon}</div>
      <div className="text-3xl font-black text-white">{value}</div>
      <div className="text-gray-400 text-xs mt-1">{label}</div>
    </div>
  );
}
