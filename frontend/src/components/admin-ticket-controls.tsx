'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon, SendIcon, ShieldCheckIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ApiError } from '@/lib/client';
import { useAddResponse, useUpdateTicketStatus } from '@/lib/hooks';
import { STATUS_LABELS, TICKET_STATUSES, type Ticket, type TicketStatus } from '@/lib/types';

const responseSchema = z.object({
  message: z.string().max(5000, 'Response is too long'),
});

type ResponseValues = z.infer<typeof responseSchema>;

/** Form id linking the scrollable fields to the pinned submit button. */
const RESPONSE_FORM_ID = 'admin-response-form';

/**
 * Admin actions for a ticket.
 *
 * The status select only stages a change locally — nothing is persisted until
 * the admin submits, so a status change can be accompanied by an explanatory
 * response. State is shared between the scrollable fields and the pinned
 * submit button, which lives outside the dialog's scroll area.
 */
export function useAdminTicketActions(ticket: Ticket, onStatusUpdated?: () => void) {
  const updateStatus = useUpdateTicketStatus(ticket.id);
  const addResponse = useAddResponse(ticket.id);

  // Staged (unsaved) status selection.
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const statusChanged = status !== ticket.status;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResponseValues>({
    resolver: zodResolver(responseSchema),
    defaultValues: { message: '' },
  });

  const onSubmit = handleSubmit(async ({ message }) => {
    const trimmed = message.trim();

    if (!statusChanged && !trimmed) {
      setError('message', {
        message: 'Write a response or change the status first.',
      });
      return;
    }

    try {
      if (trimmed) await addResponse.mutateAsync(trimmed);
      if (statusChanged) await updateStatus.mutateAsync(status);

      toast.success(
        statusChanged && trimmed
          ? `Response sent · status set to ${STATUS_LABELS[status]}`
          : statusChanged
            ? `Status set to ${STATUS_LABELS[status]}`
            : 'Response sent',
      );

      reset({ message: '' });

      // Closing is only meaningful once the ticket has actually moved on;
      // for a response-only submit we stay open so it appears in the thread.
      if (statusChanged) onStatusUpdated?.();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Unable to save changes');
    }
  });

  return {
    ticket,
    status,
    setStatus,
    statusChanged,
    register,
    errors,
    isSubmitting,
    onSubmit,
  };
}

export type AdminTicketActions = ReturnType<typeof useAdminTicketActions>;

/** Status select + response textarea. Lives inside the scrollable body. */
export function AdminTicketFields({ actions }: { actions: AdminTicketActions }) {
  const { status, setStatus, register, errors, onSubmit, isSubmitting } = actions;

  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
        <ShieldCheckIcon className="size-4" aria-hidden />
        Admin actions
      </h3>

      <div className="space-y-1.5">
        <Label htmlFor="ticket-status">Update status</Label>
        <Select
          value={status}
          onValueChange={(value) => value && setStatus(value as TicketStatus)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="ticket-status" className="h-10 w-full bg-background sm:w-56">
            {/* Base UI renders the raw value unless a mapper is provided. */}
            <SelectValue>
              {(value) => (value ? STATUS_LABELS[value as TicketStatus] : 'Select status')}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {TICKET_STATUSES.map((option) => (
              <SelectItem key={option} value={option}>
                {STATUS_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <form id={RESPONSE_FORM_ID} onSubmit={onSubmit} noValidate className="space-y-1.5">
        <Label htmlFor="message">Add a response</Label>
        <Textarea
          id="message"
          rows={3}
          placeholder="Explain the update for the customer…"
          aria-invalid={!!errors.message}
          className="resize-none bg-background"
          {...register('message')}
        />
        {errors.message && (
          <p className="text-sm text-destructive">{errors.message.message}</p>
        )}
      </form>
    </section>
  );
}

/** Submit button for the response form. Pinned outside the scroll area. */
export function AdminResponseSubmit({ actions }: { actions: AdminTicketActions }) {
  return (
    <Button
      type="submit"
      form={RESPONSE_FORM_ID}
      disabled={actions.isSubmitting}
      className="cursor-pointer"
    >
      {actions.isSubmitting ? (
        <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />
      ) : (
        <SendIcon className="size-4" aria-hidden />
      )}
      {actions.isSubmitting ? 'Sending…' : 'Send response'}
    </Button>
  );
}
