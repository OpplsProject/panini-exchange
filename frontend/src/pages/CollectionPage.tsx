import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import type { Sticker, Team, Collection } from '../types';
import StickerCard from '../components/StickerCard';

type Filter = 'todos' | 'tengo' | 'me_faltan' | 'repetidas';

export default function CollectionPage() {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [collection, setCollection] = useState<Collection>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [filter, setFilter] = useState<Filter>('todos');
  const [saving, setSaving] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([api.getStickers(), api.getTeams(), api.getMyCollection()])
      .then(([s, t, c]) => {
        setStickers(s);
        setTeams(t);
        setCollection(c);
      })
      .catch(() => setError('Error al cargar los datos'))
      .finally(() => setLoading(false));
  }, []);

  const updateSticker = useCallback(async (stickerId: number, delta: number) => {
    const current = collection[stickerId] || 0;
    const newQty = Math.max(0, current + delta);

    setCollection(prev => {
      const next = { ...prev };
      if (newQty === 0) delete next[stickerId];
      else next[stickerId] = newQty;
      return next;
    });

    setSaving(prev => new Set(prev).add(stickerId));
    try {
      await api.updateSticker(stickerId, newQty);
    } catch {
      // Revert on error
      setCollection(prev => {
        const next = { ...prev };
        if (current === 0) delete next[stickerId];
        else next[stickerId] = current;
        return next;
      });
    } finally {
      setSaving(prev => {
        const next = new Set(prev);
        next.delete(stickerId);
        return next;
      });
    }
  }, [collection]);

  const filteredStickers = stickers.filter(s => {
    const qty = collection[s.id] || 0;
    if (selectedTeam !== 'all' && s.team !== selectedTeam) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.number.toLowerCase().includes(search.toLowerCase()) && !s.code.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'tengo') return qty > 0;
    if (filter === 'me_faltan') return qty === 0;
    if (filter === 'repetidas') return qty >= 2;
    return true;
  });

  const totalCount = stickers.length;
  const haveCount = stickers.filter(s => (collection[s.id] || 0) > 0).length;
  const missingCount = totalCount - haveCount;
  const duplicateCount = stickers.filter(s => (collection[s.id] || 0) >= 2).length;
  const percent = totalCount > 0 ? Math.round((haveCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-4xl animate-spin mb-3">⚽</div>
          <p className="text-gray-500">Cargando colección...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Stats Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 flex-wrap">
            <Stat label="Total" value={totalCount} color="text-gray-700" />
            <Stat label="Tengo" value={haveCount} color="text-green-600" />
            <Stat label="Me faltan" value={missingCount} color="text-red-500" />
            <Stat label="Repetidas" value={duplicateCount} color="text-yellow-600" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-32 bg-gray-200 rounded-full h-3">
              <div
                className="bg-panini-green h-3 rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-sm font-bold text-gray-700">{percent}%</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar figurita..."
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-panini-blue flex-1 min-w-40"
          />
          <div className="flex gap-1 flex-wrap">
            {(['todos', 'tengo', 'me_faltan', 'repetidas'] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-panini-blue text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'todos' ? 'Todas' : f === 'tengo' ? 'Tengo' : f === 'me_faltan' ? 'Me faltan' : 'Repetidas'}
              </button>
            ))}
          </div>
        </div>

        {/* Team Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedTeam('all')}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedTeam === 'all' ? 'bg-panini-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos los equipos
          </button>
          <button
            onClick={() => setSelectedTeam('ESPECIALES')}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedTeam === 'ESPECIALES' ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ⭐ Especiales
          </button>
          {['A','B','C','D','E','F','G','H','I','J','K','L'].map(group => (
            <div key={group} className="flex gap-1">
              {teams.filter(t => t.group === group).map(team => {
                const teamStickers = stickers.filter(s => s.team === team.id);
                const teamHave = teamStickers.filter(s => (collection[s.id] || 0) > 0).length;
                const isSelected = selectedTeam === team.id;
                return (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeam(isSelected ? 'all' : team.id)}
                    className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                      isSelected ? 'bg-panini-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={`${team.name}: ${teamHave}/${teamStickers.length}`}
                  >
                    {team.flag} {team.name}
                    <span className={`text-xs ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}>
                      {teamHave}/{teamStickers.length}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Sticker Count */}
      <p className="text-sm text-gray-500 mb-3">
        Mostrando {filteredStickers.length} figurita{filteredStickers.length !== 1 ? 's' : ''}
        {selectedTeam !== 'all' && ` de ${teams.find(t => t.id === selectedTeam)?.name ?? 'Especiales'}`}
      </p>

      {/* Sticker Grid */}
      {filteredStickers.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📭</div>
          <p>No hay figuritas que coincidan con los filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {filteredStickers.map(sticker => (
            <div key={sticker.id} className={saving.has(sticker.id) ? 'opacity-70' : ''}>
              <StickerCard
                sticker={sticker}
                quantity={collection[sticker.id] || 0}
                onIncrement={() => updateSticker(sticker.id, 1)}
                onDecrement={() => updateSticker(sticker.id, -1)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
