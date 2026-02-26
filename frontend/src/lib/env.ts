const required = (value: string | undefined, key: string) => {
  if (!value) {
    throw new Error(`Missing env var ${key}`);
  }
  return value;
};

export const env = {
  SUPABASE_URL: required(import.meta.env.VITE_SUPABASE_URL, 'VITE_SUPABASE_URL'),
  SUPABASE_ANON_KEY: required(import.meta.env.VITE_SUPABASE_ANON_KEY, 'VITE_SUPABASE_ANON_KEY'),
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'
};
