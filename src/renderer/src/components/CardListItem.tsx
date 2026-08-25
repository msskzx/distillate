import type { Card } from '../../../shared/cards'
import { StatusBadge } from './StatusBadge'

export function CardListItem({ card, selected, onSelect }: { card: Card; selected: boolean; onSelect(): void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`grid w-full gap-3 border-b border-zinc-800 px-4 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300 ${
        selected ? 'bg-zinc-800/90' : 'bg-zinc-900/30 hover:bg-zinc-900'
      }`}
    >
      <span className="line-clamp-2 text-sm font-semibold leading-5 text-zinc-100">{card.challenge}</span>
      <span className="flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-xs text-zinc-500">
          {card.project} · {card.agent}
        </span>
        <StatusBadge status={card.status} />
      </span>
      <time className="text-xs text-zinc-600" dateTime={card.createdAt}>
        {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(card.createdAt))}
      </time>
    </button>
  )
}
