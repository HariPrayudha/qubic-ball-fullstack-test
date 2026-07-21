export type TicketStatus = 'open' | 'in_progress' | 'resolved';

export const TICKET_STATUSES: TicketStatus[] = ['open', 'in_progress', 'resolved'];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  is_admin: boolean;
}

export interface TicketResponse {
  id: number;
  ticket_id: number;
  message: string;
  author?: User;
  created_at: string;
}

export interface Ticket {
  id: number;
  subject: string;
  description: string;
  status: TicketStatus;
  status_label: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  owner?: User;
  responses?: TicketResponse[];
  responses_count?: number;
}
