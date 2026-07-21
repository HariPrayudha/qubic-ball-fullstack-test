'use client';

import { CalendarIcon, MessageSquareIcon, UserIcon } from 'lucide-react';
import {
  AdminResponseSubmit,
  AdminTicketFields,
  useAdminTicketActions,
} from '@/components/admin-ticket-controls';
import { useAuth } from '@/components/auth-provider';
import { TicketStatusBadge } from '@/components/ticket-status-badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/format';
import { useTicket } from '@/lib/hooks';
import type { Ticket } from '@/lib/types';

interface Props {
  ticketId: number | null;
  onOpenChange: (open: boolean) => void;
}

export function TicketDetailDialog({ ticketId, onOpenChange }: Props) {
  return (
    <Dialog open={ticketId !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {ticketId !== null && (
          <TicketDetailBody ticketId={ticketId} onClose={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Handles the loading / error states before the ticket is available. */
function TicketDetailBody({
  ticketId,
  onClose,
}: {
  ticketId: number;
  onClose: () => void;
}) {
  const { data: ticket, isLoading, isError, refetch } = useTicket(ticketId);

  if (isLoading) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="sr-only">Loading ticket</DialogTitle>
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </DialogHeader>
        <DialogBody className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
        </DialogBody>
      </>
    );
  }

  if (isError || !ticket) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="text-lg">Ticket unavailable</DialogTitle>
          <DialogDescription>
            It may not exist, or you don&apos;t have access to it.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Button variant="outline" onClick={() => refetch()} className="cursor-pointer">
            Try again
          </Button>
        </DialogBody>
      </>
    );
  }

  return <TicketDetailContent ticket={ticket} onClose={onClose} />;
}

function TicketDetailContent({
  ticket,
  onClose,
}: {
  ticket: Ticket;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const isAdmin = !!user?.is_admin;
  // Shared between the scrollable fields and the pinned footer button.
  const adminActions = useAdminTicketActions(ticket, onClose);

  const responses = ticket.responses ?? [];

  return (
    <>
      <DialogHeader>
        <TicketStatusBadge status={ticket.status} className="self-start" />
        <DialogTitle className="text-lg leading-snug">{ticket.subject}</DialogTitle>
        <DialogDescription className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <UserIcon className="size-3.5" aria-hidden />
            {ticket.owner?.name ?? 'Unknown'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarIcon className="size-3.5" aria-hidden />
            {formatDate(ticket.created_at)}
          </span>
        </DialogDescription>
      </DialogHeader>

      <DialogBody className="space-y-5">
        <div className="rounded-xl border bg-muted/40 p-4">
          <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
        </div>

        {/* Reading the conversation is a customer-facing feature; admins get
            the input controls instead (matching the brief's role split). */}
        {!isAdmin && (
          <>
            <Separator />

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-medium">
                <MessageSquareIcon className="size-4 text-muted-foreground" aria-hidden />
                Responses
                <span className="text-muted-foreground">({responses.length})</span>
              </h3>

              {responses.length === 0 ? (
                <p className="rounded-xl border border-dashed py-6 text-center text-sm text-muted-foreground">
                  No responses yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {responses.map((response) => (
                    <li
                      key={response.id}
                      className="rounded-xl border border-stone-200 bg-stone-50 p-3 sm:p-4"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-xs">
                        <span className="min-w-0 truncate font-medium text-foreground">
                          {response.author?.name ?? 'Support'}
                        </span>
                        <span className="shrink-0 text-muted-foreground">
                          {formatDate(response.created_at)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm whitespace-pre-wrap">{response.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {isAdmin && (
          <>
            <Separator />
            <AdminTicketFields actions={adminActions} />
          </>
        )}
      </DialogBody>

      {isAdmin && (
        <DialogFooter>
          <AdminResponseSubmit actions={adminActions} />
        </DialogFooter>
      )}
    </>
  );
}
