import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al enviar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-panini-blue via-blue-700 to-panini-green flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-panini-blue p-6 text-center">
          <div className="text-5xl mb-2">⚽</div>
          <h1 className="text-white text-2xl font-bold">Panini Mundial 2026</h1>
        </div>

        <div className="p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📧</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">¡Revisá tu email!</h2>
              <p className="text-gray-500 text-sm mb-6">
                Si el email <strong>{email}</strong> está registrado, vas a recibir un enlace para restablecer tu contraseña.
              </p>
              <Link to="/login" className="text-panini-blue font-semibold hover:underline text-sm">
                ← Volver al login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-800 text-center mb-1">Recuperar contraseña</h2>
              <p className="text-gray-500 text-sm text-center mb-5">
                Ingresá tu email y te enviamos un enlace para crear una nueva contraseña.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-panini-blue"
                    placeholder="tucorreo@email.com"
                    required
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-panini-blue hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg transition-colors"
                >
                  {loading ? 'Enviando...' : 'Enviar enlace'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-4">
                <Link to="/login" className="text-panini-blue font-semibold hover:underline">
                  ← Volver al login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
