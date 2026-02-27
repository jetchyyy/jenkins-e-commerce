import { supabase } from '../app/providers/AuthProvider';
import { apiFetch } from './client';

export const authApi = {
  login: async (email: string, password: string) => {
    const { session } = await apiFetch<{ session: { access_token: string; refresh_token: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    const { error } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    });
    if (error) throw error;
  },

  register: async (email: string, password: string, fullName: string, captchaToken?: string) => {
    const payload = await apiFetch<{ session: { access_token: string; refresh_token: string } | null }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        captcha_token: captchaToken
      })
    });

    if (!payload.session) {
      return;
    }

    const { error } = await supabase.auth.setSession({
      access_token: payload.session.access_token,
      refresh_token: payload.session.refresh_token
    });
    if (error) throw error;
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  loginWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/books`,
      },
    });
    if (error) throw error;
  },
};
