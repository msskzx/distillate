import type { CardStatus } from '../../../shared/cards'

const styles: Record<CardStatus, string> = {
  unreviewed: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  revisit: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
  reviewed: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
}

const labels: Record<CardStatus, string> = {
  unreviewed: 'Unreviewed',
  revisit: 'Revisit',
  reviewed: 'Distilled',
}

export function StatusBadge({ status }: { status: CardStatus }) {
  return <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status]}`}>{labels[status]}</span>
}
