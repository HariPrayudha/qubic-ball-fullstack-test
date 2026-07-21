import type { Pool, RowDataPacket } from 'mysql2/promise';

/** A single ticket row, reduced to the fields the statistics need. */
export interface TicketRow {
  status: string;
  created_at: Date;
  resolved_at: Date | null;
}

export interface StatsSummary {
  total: number;
  byStatus: {
    open: number;
    in_progress: number;
    resolved: number;
  };
  /** Average hours between creation and resolution, or null if none resolved. */
  avgResolutionHours: number | null;
  /** Tickets created within the last 7 days (relative to `now`). */
  createdLast7Days: number;
}

const HOUR_MS = 1000 * 60 * 60;
const WEEK_MS = HOUR_MS * 24 * 7;

/**
 * Pure aggregation function — no I/O — so it can be unit tested with plain data.
 */
export function summarize(tickets: TicketRow[], now: Date = new Date()): StatsSummary {
  const byStatus = { open: 0, in_progress: 0, resolved: 0 };

  let resolutionSumMs = 0;
  let resolvedWithTimestamp = 0;
  let createdLast7Days = 0;

  for (const ticket of tickets) {
    if (ticket.status === 'open') byStatus.open += 1;
    else if (ticket.status === 'in_progress') byStatus.in_progress += 1;
    else if (ticket.status === 'resolved') byStatus.resolved += 1;

    if (ticket.resolved_at) {
      resolutionSumMs += ticket.resolved_at.getTime() - ticket.created_at.getTime();
      resolvedWithTimestamp += 1;
    }

    if (now.getTime() - ticket.created_at.getTime() <= WEEK_MS) {
      createdLast7Days += 1;
    }
  }

  const avgResolutionHours =
    resolvedWithTimestamp > 0
      ? Math.round((resolutionSumMs / resolvedWithTimestamp / HOUR_MS) * 100) / 100
      : null;

  return {
    total: tickets.length,
    byStatus,
    avgResolutionHours,
    createdLast7Days,
  };
}

/**
 * Fetch the minimal ticket columns from the database and summarize them.
 */
export async function getTicketStats(pool: Pool): Promise<StatsSummary> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT status, created_at, resolved_at FROM tickets',
  );

  const tickets: TicketRow[] = rows.map((row) => ({
    status: String(row.status),
    created_at: new Date(row.created_at),
    resolved_at: row.resolved_at ? new Date(row.resolved_at) : null,
  }));

  return summarize(tickets);
}
