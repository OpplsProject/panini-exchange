import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

const PROVINCES = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán',
  // Otros países
  'Otro país',
];

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [locality, setLocality] = useState('');
  const [province, setProvince] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getMyProfile().then(profile => {
      setLocality(profile.locality || '');
      setProvince(profile.province || '');
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.updateProfile(locality, province);
      // Update auth context with new location
      if (user) login(localStorage.getItem('token')!, { ...user, locality, province });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-40">
      <div className="text-4xl animate-spin">⚽</div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Mi Perfil</h2>
        <p className="text-gray-500 text-sm mb-6">Tu ubicación ayuda a otros coleccionistas a coordinar el intercambio.</p>

        <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="w-12 h-12 rounded-full bg-panini-blue flex items-center justify-center text-white text-xl font-bold">
            {user?.username[0].toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-gray-800">@{user?.username}</div>
            <div className="text-sm text-gray-500">{user?.email}</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Localidad / Ciudad</label>
            <input
              type="text"
              value={locality}
              onChange={e => setLocality(e.target.value)}
              placeholder="Ej: Mar del Plata, Rosario, CABA..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-panini-blue"
              maxLength={80}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provincia / País</label>
            <select
              value={province}
              onChange={e => setProvince(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-panini-blue bg-white"
            >
              <option value="">— Seleccioná —</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-panini-blue hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg transition-colors"
          >
            {saving ? 'Guardando...' : saved ? '✓ Guardado!' : 'Guardar ubicación'}
          </button>
        </form>
      </div>
    </div>
  );
}
