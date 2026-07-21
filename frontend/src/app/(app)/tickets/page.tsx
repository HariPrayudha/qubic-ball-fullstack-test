'use client';

import {
  InboxIcon,
  MessageSquareIcon,
  PlusIcon,
  RefreshCwIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { CreateTicketDialog } from '@/components/create-ticket-dialog';
import { RequireAuth } from '@/components/require-auth';
import { TicketDetailDialog } from '@/components/ticket-detail-dialog';
import { TicketStatusBadge } from '@/components/ticket-status-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/format';
import { useTickets } from '@/lib/hooks';
import { STATUS_LABELS, TICKET_STATUSES, type Ticket, type TicketStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

type Filter = TicketStatus | 'all';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  ...TICKET_STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] })),
];

function TicketsView() {
  const { user } = useAuth();
  // Feature split follows the brief: customers open tickets, admins triage
  // them (filter by status, update status, respond).
  const isAdmin = !!user?.is_admin;
  const [filter, setFilter] = useState<Filter>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: tickets, isLoading, isError, refetch, isFetching } = useTickets(
    filter === 'all' ? undefined : filter,
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Tickets</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? 'Every customer ticket across the workspace.'
              : 'Track the support tickets you have opened.'}
          </p>
        </div>

        {!isAdmin && (
          <Button
            onClick={() => setCreateOpen(true)}
            className="h-11 w-full cursor-pointer sm:h-9 sm:w-auto"
          >
            <PlusIcon className="size-4" aria-hidden />
            New ticket
          </Button>
        )}
      </div>

      {/* Status filter — segmented control (admin feature) */}
      {isAdmin && (
      <div
        role="tablist"
        aria-label="Filter tickets by status"
        className="flex w-full gap-1 overflow-x-auto rounded-xl border bg-white/70 p-1 backdrop-blur-sm sm:w-fit"
      >
        {FILTERS.map(({ value, label }) => {
          const active = filter === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(value)}
              className={cn(
                // Grow to fill the full-width bar on mobile, but never shrink
                // below the label (the container scrolls if space runs out).
                'grow shrink-0 sm:grow-0',
                'cursor-pointer rounded-lg px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 py-12 text-center">
          <TriangleAlertIcon className="size-8 text-destructive" aria-hidden />
          <div>
            <p className="font-medium">Couldn&apos;t load tickets</p>
            <p className="text-sm text-muted-foreground">
              Check that the API is running, then try again.
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()} className="cursor-pointer">
            <RefreshCwIcon className={cn('size-4', isFetching && 'animate-spin')} aria-hidden />
            Try again
          </Button>
        </div>
      )}

      {/* Empty */}
      {tickets && tickets.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-white/50 py-14 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <InboxIcon className="size-6" aria-hidden />
          </span>
          <div>
            <p className="font-medium">No tickets found</p>
            <p className="text-sm text-muted-foreground">
              {filter !== 'all'
                ? `No tickets with status “${STATUS_LABELS[filter as TicketStatus]}”.`
                : isAdmin
                  ? 'No customer tickets have been opened yet.'
                  : 'Create your first ticket to get started.'}
            </p>
          </div>
          {!isAdmin && (
            <Button onClick={() => setCreateOpen(true)} className="cursor-pointer">
              <PlusIcon className="size-4" aria-hidden />
              New ticket
            </Button>
          )}
        </div>
      )}

      {/* List */}
      {tickets && tickets.length > 0 && (
        <ul className="space-y-3">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <TicketRow
                ticket={ticket}
                showOwner={!!user?.is_admin}
                onOpen={() => setSelectedId(ticket.id)}
              />
            </li>
          ))}
        </ul>
      )}

      <CreateTicketDialog open={createOpen} onOpenChange={setCreateOpen} />
      <TicketDetailDialog
        ticketId={selectedId}
        onOpenChange={(open) => !open && setSelectedId(null)}
      />
    </div>
  );
}

function TicketRow({
  ticket,
  showOwner,
  onOpen,
}: {
  ticket: Ticket;
  showOwner: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'w-full cursor-pointer rounded-xl border bg-white/80 p-4 text-left backdrop-blur-sm',
        'transition-colors duration-200 hover:border-primary/40 hover:bg-white',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h2 className="truncate font-medium">{ticket.subject}</h2>
          <p className="line-clamp-1 text-sm text-muted-foreground">{ticket.description}</p>
        </div>
        <TicketStatusBadge status={ticket.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>{formatDate(ticket.created_at)}</span>
        {showOwner && ticket.owner && <span>by {ticket.owner.name}</span>}
        {!!ticket.responses_count && (
          <span className="inline-flex items-center gap-1">
            <MessageSquareIcon className="size-3.5" aria-hidden />
            {ticket.responses_count}
          </span>
        )}
      </div>
    </button>
  );
}

export default function TicketsPage() {
  return (
    <RequireAuth>
      <TicketsView />
    </RequireAuth>
  );
}
