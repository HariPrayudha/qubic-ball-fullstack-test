'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { ticketsApi } from './client';
import type { TicketStatus } from './types';

export const ticketKeys = {
  all: ['tickets'] as const,
  list: (status?: TicketStatus) => ['tickets', { status: status ?? 'all' }] as const,
  detail: (id: number) => ['tickets', id] as const,
};

export function useTickets(status?: TicketStatus) {
  return useQuery({
    queryKey: ticketKeys.list(status),
    queryFn: () => ticketsApi.list(status),
  });
}

export function useTicket(id: number) {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => ticketsApi.get(id),
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ticketsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ticketKeys.all }),
  });
}

export function useUpdateTicketStatus(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: TicketStatus) => ticketsApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ticketKeys.detail(id) });
      qc.invalidateQueries({ queryKey: ticketKeys.all });
    },
  });
}

export function useAddResponse(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => ticketsApi.addResponse(id, message),
    onSuccess: () => qc.invalidateQueries({ queryKey: ticketKeys.detail(id) }),
  });
}
