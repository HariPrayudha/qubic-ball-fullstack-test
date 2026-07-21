import type { Ticket, TicketResponse, TicketStatus, User } from './types';

/** Error thrown for any non-2xx API response, carrying validation details. */
export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      res.status,
      (data as { message?: string }).message ?? 'Something went wrong',
      (data as { errors?: Record<string, string[]> }).errors,
    );
  }

  return data as T;
}

const backend = <T>(path: string, init?: RequestInit) =>
  request<T>(`/api/backend/${path}`, init);

/* -------------------------------------------------------------------------- */
/* Session                                                                    */
/* -------------------------------------------------------------------------- */

export const sessionApi = {
  me: () => request<{ user: User | null }>('/api/session').then((r) => r.user),

  login: (email: string, password: string) =>
    request<{ user: User }>('/api/session', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }).then((r) => r.user),

  register: (payload: { name: string; email: string; password: string; password_confirmation: string }) =>
    request<{ user: User }>('/api/session/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).then((r) => r.user),

  logout: () => request<void>('/api/session', { method: 'DELETE' }),
};

/* -------------------------------------------------------------------------- */
/* Tickets                                                                    */
/* -------------------------------------------------------------------------- */

export const ticketsApi = {
  list: (status?: TicketStatus) => {
    const query = status ? `?status=${status}` : '';
    return backend<{ data: Ticket[] }>(`tickets${query}`).then((r) => r.data);
  },

  get: (id: number) => backend<{ data: Ticket }>(`tickets/${id}`).then((r) => r.data),

  create: (payload: { subject: string; description: string }) =>
    backend<{ data: Ticket }>('tickets', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).then((r) => r.data),

  updateStatus: (id: number, status: TicketStatus) =>
    backend<{ data: Ticket }>(`tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }).then((r) => r.data),

  addResponse: (id: number, message: string) =>
    backend<{ data: TicketResponse }>(`tickets/${id}/responses`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }).then((r) => r.data),
};
