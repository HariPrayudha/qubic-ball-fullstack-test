import { STATUS_LABELS, type TicketStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

/**
 * Status ramp: neutral (new) -> amber (being worked) -> emerald (done).
 * A coloured dot accompanies the text so colour is never the only signal.
 */
const STYLES: Record<TicketStatus, { chip: string; dot: string }> = {
  open: {
    chip: 'bg-stone-100 text-stone-800 ring-stone-300',
    dot: 'bg-stone-500',
  },
  in_progress: {
    chip: 'bg-amber-100 text-amber-900 ring-amber-300',
    dot: 'bg-amber-500',
  },
  resolved: {
    chip: 'bg-emerald-100 text-emerald-900 ring-emerald-300',
    dot: 'bg-emerald-600',
  },
};

export function TicketStatusBadge({
  status,
  className,
}: {
  status: TicketStatus;
  className?: string;
}) {
  const style = STYLES[status];

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        style.chip,
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', style.dot)} aria-hidden />
      {STATUS_LABELS[status]}
    </span>
  );
}
