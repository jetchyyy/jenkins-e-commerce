import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  BOOTSTRAP_TOKEN: z.string().optional(),
  PAYMENT_MODE: z.enum(['stripe', 'mock']).default('stripe')
}).transform((raw) => ({
  ...raw,
  SUPABASE_ANON_KEY: raw.SUPABASE_ANON_KEY ?? raw.VITE_SUPABASE_ANON_KEY
}));

export const env = envSchema.parse(process.env);
