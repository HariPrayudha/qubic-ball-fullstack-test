import 'dotenv/config';
import { z } from 'zod';

/**
 * Validate and coerce environment variables once at startup so the rest of
 * the service can rely on a typed, well-formed config object.
 */
const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().default('qubic_tickets'),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', z.treeifyError(parsed.error));
  process.exit(1);
}

export const config = parsed.data;
