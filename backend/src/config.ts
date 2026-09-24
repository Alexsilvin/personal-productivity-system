import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1).default('postgresql://pps:pps@localhost:5432/pps'),
});

export type AppConfig = z.infer<typeof configSchema>;

export const config = configSchema.parse(process.env);
