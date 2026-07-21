import { describe, expect, it } from 'vitest';
import { summarize, type TicketRow } from '../src/stats.js';

const now = new Date('2026-07-21T12:00:00Z');

function ticket(partial: Partial<TicketRow>): TicketRow {
  return {
    status: 'open',
    created_at: now,
    resolved_at: null,
    ...partial,
  };
}

describe('summarize', () => {
  it('returns zeroed summary for no tickets', () => {
    expect(summarize([], now)).toEqual({
      total: 0,
      byStatus: { open: 0, in_progress: 0, resolved: 0 },
      avgResolutionHours: null,
      createdLast7Days: 0,
    });
  });

  it('counts tickets by status', () => {
    const summary = summarize(
      [
        ticket({ status: 'open' }),
        ticket({ status: 'open' }),
        ticket({ status: 'in_progress' }),
        ticket({ status: 'resolved', resolved_at: now }),
      ],
      now,
    );

    expect(summary.total).toBe(4);
    expect(summary.byStatus).toEqual({ open: 2, in_progress: 1, resolved: 1 });
  });

  it('averages resolution time in hours only over resolved tickets', () => {
    const created = new Date('2026-07-20T12:00:00Z');
    const summary = summarize(
      [
        // resolved 24h after creation
        ticket({ status: 'resolved', created_at: created, resolved_at: now }),
        // resolved 12h after creation
        ticket({
          status: 'resolved',
          created_at: new Date('2026-07-21T00:00:00Z'),
          resolved_at: now,
        }),
        // open ticket must not affect the average
        ticket({ status: 'open', created_at: created }),
      ],
      now,
    );

    // (24 + 12) / 2 = 18
    expect(summary.avgResolutionHours).toBe(18);
  });

  it('counts only tickets created within the last 7 days', () => {
    const summary = summarize(
      [
        ticket({ created_at: now }), // today
        ticket({ created_at: new Date('2026-07-16T12:00:00Z') }), // 5 days ago
        ticket({ created_at: new Date('2026-07-10T12:00:00Z') }), // 11 days ago
      ],
      now,
    );

    expect(summary.createdLast7Days).toBe(2);
  });
});
