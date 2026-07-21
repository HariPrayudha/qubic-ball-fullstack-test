import express, { type NextFunction, type Request, type Response } from 'express';
import type { Pool } from 'mysql2/promise';
import { getTicketStats } from './stats.js';

/**
 * Build the Express app. The pool is injected so tests could supply a fake.
 */
export function createApp(pool: Pool) {
  const app = express();

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await getTicketStats(pool);
      res.status(200).json(summary);
    } catch (err) {
      next(err);
    }
  });

  // 404 fallback.
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Centralized error handler.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
