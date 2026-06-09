import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { Sticker, Collection } from '../types';
import StickerCard from '../components/StickerCard';

const PROVINCES = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán', 'Otro país',
];

type Tab = 'mis-repetidas' | 'buscar';

interface SearchResult {
  id: number;
  username: string;
  locality: string;
  province: string;
  quantity: number;
}

export default function MyDuplicatesPage() {
  const [tab, setTab] = useState<Tab>('mis-repetidas');

  // --- Mis Repetidas ---
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [collection, setCollection] = useState<Collection>({});
  const [loadingCol, setLoadingCol] = useState(true);
  const [saving, setSaving] = useState<Set<number>>(new Set());
  const [teamFilter, setTeamFilter] = useState('all');

  // --- Buscar ---
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Sticker[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [province, setProvince] = useState('');
  const [locality, setLocality] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [searchSticker, setSearchSticker] = useState<Sticker | null>(null);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    Promise.all([api.getStickers(), api.getMyCollection()])
      .then(([s, c]) => { setStickers(s); setCollection(c); })
      .finally(() => setLoadingCol(false));
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
      setCollection(prev => {
        const next = { ...prev };
        if (current === 0) delete next[stickerId];
        else next[stickerId] = current;
        return next;
      });
    } finally {
      setSaving(prev => { const n = new Set(prev); n.delete(stickerId); return n; });
    }
  }, [collection]);

  const duplicates = stickers.filter(s => (collection[s.id] || 0) >= 2);
  const filteredDuplicates = teamFilter === 'all'
    ? duplicates
    : duplicates.filter(s => s.team === teamFilter || s.group === teamFilter);

  // Teams that have duplicates
  const teamsWithDups = Array.from(new Set(duplicates.map(s => s.team)));

  // Autocomplete
  function handleQueryChange(val: string) {
    setQuery(val);
    setSelectedSticker(null);
    setSearchResults(null);
    clearTimeout(debounceRef.current);
    if (val.length < 1) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      const res = await api.searchStickerSuggestions(val);
      setSuggestions(res);
      setShowSuggestions(true);
    }, 200);
  }

  function selectSuggestion(s: Sticker) {
    setSelectedSticker(s);
    setQuery(`${s.number} — ${s.name}`);
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchResults(null);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSticker) return;
    setSearching(true);
    setSearchResults(null);
    try {
      const { sticker, users } = await api.searchDuplicates(selectedSticker.id, province || undefined, locality || undefined);
      setSearchSticker(sticker);
      setSearchResults(users);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <TabBtn active={tab === 'mis-repetidas'} onClick={() => setTab('mis-repetidas')}
          label={`🔁 Mis Repetidas ${duplicates.length > 0 ? `(${duplicates.length})` : ''}`} />
        <TabBtn active={tab === 'buscar'} onClick={() => setTab('buscar')}
          label="🔍 Buscar figurita" />
      </div>

      {/* ── MIS REPETIDAS ── */}
      {tab === 'mis-repetidas' && (
        <>
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <p className="text-gray-500 text-sm">
              Estas son las figuritas que tenés en cantidad ≥ 2. Podés ofrecerlas para intercambio.
              Usá los botones <span className="font-bold">+/−</span> en <Link to="/coleccion" className="text-panini-blue underline">Mi Colección</Link> para marcar cuántas repetidas tenés.
            </p>
          </div>

          {loadingCol ? (
            <div className="flex justify-center py-12"><div className="text-4xl animate-spin">⚽</div></div>
          ) : duplicates.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">📭</div>
              <p className="font-medium">Todavía no tenés figuritas repetidas</p>
              <p className="text-sm mt-1">Andá a <Link to="/coleccion" className="text-panini-blue underline">Mi Colección</Link> y marcá con <strong>+</strong> las que tenés más de una vez.</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4">
                  <Stat label="Tipos distintos" value={duplicates.length} color="text-panini-blue" />
                  <Stat label="Total unidades extra" value={duplicates.reduce((acc, s) => acc + (collection[s.id] || 0) - 1, 0)} color="text-yellow-600" />
                  <Stat label="Equipos" value={teamsWithDups.filter(t => t !== 'ESPECIALES').length} color="text-green-600" />
                </div>
                {/* Team filter */}
                <select
                  value={teamFilter}
                  onChange={e => setTeamFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-panini-blue"
                >
                  <option value="all">Todos los equipos</option>
                  <option value="FWC">⭐ Especiales FWC</option>
                  {stickers
                    .filter((s, i, arr) => s.team !== 'ESPECIALES' && arr.findIndex(x => x.team === s.team) === i && teamsWithDups.includes(s.team))
                    .map(s => (
                      <option key={s.team} value={s.team}>{s.flag} {s.teamName}</option>
                    ))
                  }
                </select>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {filteredDuplicates.map(sticker => (
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
            </>
          )}
        </>
      )}

      {/* ── BUSCAR FIGURITA ── */}
      {tab === 'buscar' && (
        <>
          <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
            <h3 className="font-bold text-gray-800 mb-1">¿Quién tiene una figurita que te falta?</h3>
            <p className="text-gray-500 text-sm mb-4">
              Buscá por código o nombre de figurita y filtrá por ubicación para encontrar coleccionistas cerca tuyo.
            </p>

            <form onSubmit={handleSearch} className="space-y-3">
              {/* Sticker search with autocomplete */}
              <div className="relative" ref={suggestRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Figurita</label>
                <input
                  type="text"
                  value={query}
                  onChange={e => handleQueryChange(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Ej: ARG 5, Messi, Escudo Francia..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-panini-blue"
                  autoComplete="off"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-56 overflow-y-auto">
                    {suggestions.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => selectSuggestion(s)}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors flex items-center gap-2 border-b border-gray-100 last:border-0"
                      >
                        {s.flag && <span>{s.flag}</span>}
                        <span className="font-mono text-xs text-gray-500 w-16 flex-shrink-0">{s.number}</span>
                        <span className="text-sm text-gray-800">{s.name}</span>
                        <span className={`ml-auto text-xs px-1.5 rounded font-bold ${
                          s.type === 'badge' ? 'bg-purple-100 text-purple-700' :
                          s.type === 'squad' ? 'bg-blue-100 text-blue-700' :
                          s.type === 'special' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {s.type === 'badge' ? 'ESCUDO' : s.type === 'squad' ? 'EQUIPO' : s.type === 'special' ? 'ESP' : 'JUG'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedSticker && (
                  <div className="mt-1 flex items-center gap-2 text-sm text-green-600">
                    ✓ Seleccionada: <strong>{selectedSticker.number}</strong> — {selectedSticker.name}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provincia (opcional)</label>
                  <select
                    value={province}
                    onChange={e => setProvince(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-panini-blue bg-white text-sm"
                  >
                    <option value="">Todas las provincias</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Localidad (opcional)</label>
                  <input
                    type="text"
                    value={locality}
                    onChange={e => setLocality(e.target.value)}
                    placeholder="Ej: Rosario, Mar del Plata..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-panini-blue text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedSticker || searching}
                className="w-full bg-panini-blue hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg transition-colors"
              >
                {searching ? 'Buscando...' : '🔍 Buscar'}
              </button>
            </form>
          </div>

          {/* Results */}
          {searchResults !== null && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                {searchSticker?.flag && <span className="text-2xl">{searchSticker.flag}</span>}
                <div>
                  <div className="font-bold text-gray-800">{searchSticker?.number} — {searchSticker?.name}</div>
                  <div className="text-sm text-gray-500">
                    {searchResults.length === 0
                      ? 'Nadie tiene esta figurita repetida con los filtros seleccionados'
                      : `${searchResults.length} coleccionista${searchResults.length !== 1 ? 's' : ''} la tiene${searchResults.length !== 1 ? 'n' : ''} disponible`
                    }
                  </div>
                </div>
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">😕</div>
                  <p>Nadie tiene esta figurita repetida{province ? ` en ${province}` : ''}</p>
                  <p className="text-sm mt-1">Probá ampliar la búsqueda quitando los filtros de ubicación</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-panini-blue flex items-center justify-center text-white font-bold text-sm">
                          {u.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">@{u.username}</div>
                          {(u.locality || u.province) && (
                            <div className="text-xs text-gray-500">
                              📍 {[u.locality, u.province].filter(Boolean).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">
                          {u.quantity - 1} para dar
                        </span>
                        <Link
                          to={`/mensajes?with=${u.username}`}
                          className="bg-panini-blue hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          💬 Escribir
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
      active ? 'bg-panini-blue text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
    }`}>{label}</button>
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
