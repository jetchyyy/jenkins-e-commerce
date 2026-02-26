import { ReactNode, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { env } from '../../lib/env';
import { authStore } from '../../store/auth.store';
import { apiFetch } from '../../api/client';

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const syncSession = async (accessToken: string | null) => {
      if (!accessToken) {
        authStore.getState().clearAuth();
        return;
      }

      try {
        const me = await apiFetch<{ user: { id: string; email: string; role: 'superadmin' | 'customer' } }>('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        authStore.getState().setAuth({ accessToken, user: me.user });
      } catch {
        authStore.getState().clearAuth();
      }
    };

    void supabase.auth.getSession().then(({ data }) => syncSession(data.session?.access_token ?? null));

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSession(session?.access_token ?? null);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return <>{children}</>;
};
