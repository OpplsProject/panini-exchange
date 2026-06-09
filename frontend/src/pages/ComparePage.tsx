import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { CompareResult, Sticker } from '../types';
import StickerCard from '../components/StickerCard';

export default function ComparePage() {
  const [username, setUsername] = useState('');
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'receive' | 'give'>('receive');

  async function handleCompare(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const data = await api.compareWith(username.trim());
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al comparar');
    } finally {
      setLoading(false);
    }
  }

  const noop = () => {};

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-1">🔄 Comparar Colecciones</h2>
        <p className="text-gray-500 text-sm mb-4">
          Ingresá el nombre de usuario de otro coleccionista para ver qué figuritas pueden intercambiar.
        </p>

        <form onSubmit={handleCompare} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">@</span>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="nombre_de_usuario"
              className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-panini-blue"
              required
              minLength={3}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-panini-blue hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-lg transition-colors"
          >
            {loading ? '...' : 'Comparar'}
          </button>
        </form>

        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {result && (
        <>
          {/* User info + message button */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center justify-between gap-4">
            <div>
              <span className="font-bold text-gray-800 text-lg">@{result.otherUser.username}</span>
              {(result.otherUser.locality || result.otherUser.province) && (
                <span className="ml-2 text-gray-500 text-sm">
                  📍 {[result.otherUser.locality, result.otherUser.province].filter(Boolean).join(', ')}
                </span>
              )}
            </div>
            <Link
              to={`/mensajes?with=${result.otherUser.username}`}
              className="bg-panini-green hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
            >
              💬 Enviar mensaje
            </Link>
          </div>

          {/* Match Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <MatchCard
              icon="📥"
              title={`@${result.otherUser.username} te puede dar`}
              count={result.theyCanGiveMe.length}
              color="blue"
              description="Figuritas que les sobran a ellos y a vos te faltan"
            />
            <div className="bg-gradient-to-br from-panini-green to-green-600 rounded-xl p-4 text-white text-center shadow-sm flex flex-col items-center justify-center">
              <div className="text-4xl font-black">{result.matchCount}</div>
              <div className="text-green-100 text-sm mt-1">intercambios posibles</div>
              {result.matchCount > 0 && (
                <div className="text-2xl mt-1">🤝</div>
              )}
            </div>
            <MatchCard
              icon="📤"
              title={`Vos le podés dar a @${result.otherUser.username}`}
              count={result.iCanGiveThem.length}
              color="green"
              description="Figuritas que te sobran a vos y a ellos les faltan"
            />
          </div>

          {result.theyCanGiveMe.length === 0 && result.iCanGiveThem.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-3">😕</div>
              <p className="font-medium">No hay intercambios posibles con @{result.otherUser.username}</p>
              <p className="text-sm mt-1">Necesitan tener figuritas repetidas que al otro le falten</p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                <TabButton
                  active={tab === 'receive'}
                  onClick={() => setTab('receive')}
                  label={`📥 Me pueden dar (${result.theyCanGiveMe.length})`}
                />
                <TabButton
                  active={tab === 'give'}
                  onClick={() => setTab('give')}
                  label={`📤 Les puedo dar (${result.iCanGiveThem.length})`}
                />
              </div>

              {tab === 'receive' && (
                <StickerList stickers={result.theyCanGiveMe} highlight="receive" noop={noop} />
              )}
              {tab === 'give' && (
                <StickerList stickers={result.iCanGiveThem} highlight="give" noop={noop} />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function MatchCard({ icon, title, count, color, description }: {
  icon: string; title: string; count: number; color: string; description: string;
}) {
  const bg = color === 'blue' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200';
  const num = color === 'blue' ? 'text-panini-blue' : 'text-panini-green';
  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-3xl font-black ${num}`}>{count}</div>
      <div className="font-semibold text-gray-800 text-sm mt-1">{title}</div>
      <div className="text-gray-500 text-xs mt-0.5">{description}</div>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
        active ? 'bg-panini-blue text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}

function StickerList({ stickers, highlight, noop }: {
  stickers: Sticker[]; highlight: 'give' | 'receive'; noop: () => void;
}) {
  if (stickers.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <div className="text-4xl mb-2">📭</div>
        <p>No hay figuritas en esta categoría</p>
      </div>
    );
  }

  // Group by team
  const byTeam: Record<string, Sticker[]> = {};
  for (const s of stickers) {
    const key = s.teamName;
    if (!byTeam[key]) byTeam[key] = [];
    byTeam[key].push(s);
  }

  return (
    <div className="space-y-4">
      {Object.entries(byTeam).map(([teamName, teamStickers]) => (
        <div key={teamName} className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            {teamStickers[0].flag && <span>{teamStickers[0].flag}</span>}
            {teamName}
            <span className="text-sm font-normal text-gray-400">({teamStickers.length})</span>
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {teamStickers.map(s => (
              <StickerCard
                key={s.id}
                sticker={s}
                quantity={1}
                onIncrement={noop}
                onDecrement={noop}
                readonly
                highlight={highlight}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
