import type { Sticker } from '../types';

interface Props {
  sticker: Sticker;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  readonly?: boolean;
  highlight?: 'give' | 'receive';
}

const TYPE_COLORS: Record<string, string> = {
  special: 'bg-yellow-400 text-yellow-900',
  badge: 'bg-purple-500 text-white',
  squad: 'bg-blue-500 text-white',
  player: 'bg-gray-500 text-white',
};

const TYPE_LABELS: Record<string, string> = {
  special: 'ESP',
  badge: 'ESCUDO',
  squad: 'EQUIPO',
  player: 'JUG',
};

export default function StickerCard({ sticker, quantity, onIncrement, onDecrement, readonly, highlight }: Props) {
  const hasSticker = quantity > 0;
  const hasDuplicate = quantity >= 2;

  let borderClass = 'border-2 border-gray-200';
  if (highlight === 'give') borderClass = 'border-2 border-green-500 ring-2 ring-green-200';
  else if (highlight === 'receive') borderClass = 'border-2 border-blue-500 ring-2 ring-blue-200';
  else if (hasDuplicate) borderClass = 'border-2 border-panini-gold';
  else if (hasSticker) borderClass = 'border-2 border-green-400';

  let bgClass = 'bg-gray-100 opacity-50';
  if (hasSticker) bgClass = 'bg-white';
  if (highlight) bgClass = 'bg-white';

  return (
    <div className={`relative rounded-lg p-2 ${borderClass} ${bgClass} transition-all select-none`}>
      {hasDuplicate && !highlight && (
        <span className="absolute -top-1.5 -right-1.5 bg-panini-gold text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center text-yellow-900 shadow">
          {quantity}
        </span>
      )}
      {highlight === 'give' && (
        <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center text-white shadow">✓</span>
      )}
      {highlight === 'receive' && (
        <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center text-white shadow">★</span>
      )}

      <div className="text-center">
        {sticker.flag && (
          <div className="text-2xl mb-0.5">{sticker.flag}</div>
        )}
        <div className="text-xs font-bold text-gray-800 leading-tight truncate" title={sticker.name}>
          {sticker.name}
        </div>
        <div className="text-xs text-gray-500 font-mono">{sticker.number}</div>
        <span className={`inline-block text-xs px-1 rounded mt-0.5 font-bold ${TYPE_COLORS[sticker.type]}`}>
          {TYPE_LABELS[sticker.type]}
        </span>
      </div>

      {!readonly && (
        <div className="flex items-center justify-center gap-1 mt-1.5">
          <button
            onClick={onDecrement}
            disabled={quantity === 0}
            className="w-6 h-6 rounded-full bg-gray-200 hover:bg-red-200 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold flex items-center justify-center transition-colors"
          >
            −
          </button>
          <span className="text-sm font-bold w-4 text-center text-gray-700">{quantity}</span>
          <button
            onClick={onIncrement}
            className="w-6 h-6 rounded-full bg-gray-200 hover:bg-green-200 text-sm font-bold flex items-center justify-center transition-colors"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
