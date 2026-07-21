'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ApiError } from '@/lib/client';
import { useCreateTicket } from '@/lib/hooks';

const schema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(255),
  description: z
    .string()
    .min(10, 'Please describe the issue (at least 10 characters)')
    .max(5000),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTicketDialog({ open, onOpenChange }: Props) {
  const createTicket = useCreateTicket();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Start from a clean form every time the dialog is opened.
  useEffect(() => {
    if (open) reset({ subject: '', description: '' });
  }, [open, reset]);

  async function onSubmit(values: FormValues) {
    try {
      await createTicket.mutateAsync(values);
      toast.success('Ticket created');
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        for (const [field, messages] of Object.entries(err.errors)) {
          setError(field as keyof FormValues, { message: messages[0] });
        }
        return;
      }
      toast.error(err instanceof ApiError ? err.message : 'Unable to create ticket');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">New support ticket</DialogTitle>
          <DialogDescription>
            Describe your issue and our team will get back to you.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <form
            id="create-ticket-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g. Cannot log in to my account"
                aria-invalid={!!errors.subject}
                className="h-11"
                {...register('subject')}
              />
              {errors.subject && (
                <p className="text-sm text-destructive">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={6}
                placeholder="Tell us what happened, what you expected, and any steps to reproduce it…"
                aria-invalid={!!errors.description}
                className="resize-none"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
          </form>
        </DialogBody>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" className="cursor-pointer" />}>
            Cancel
          </DialogClose>
          <Button
            type="submit"
            form="create-ticket-form"
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            {isSubmitting && <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />}
            {isSubmitting ? 'Submitting…' : 'Submit ticket'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
