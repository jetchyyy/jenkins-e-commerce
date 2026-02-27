import { Router } from 'express';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { supabaseAuth } from '../../config/supabase.js';
import { authMiddleware } from '../../middleware/auth.js';
import { bootstrapSuperadmin } from './bootstrapSuperadmin.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { loginRateLimit, registerRateLimit } from '../../middleware/rateLimit.js';
import { badRequest, tooManyRequests, unauthorized } from '../../utils/http.js';

export const authRoutes = Router();

authRoutes.post(
  '/register',
  registerRateLimit,
  asyncHandler(async (req, res) => {
    if (!supabaseAuth) {
      throw badRequest('Server auth configuration is incomplete. Missing SUPABASE_ANON_KEY.');
    }

    const payload = z
      .object({
        email: z.string().email(),
        password: z.string().min(8),
        full_name: z.string().min(1),
        captcha_token: z.string().min(1).optional()
      })
      .parse(req.body);

    if (env.TURNSTILE_SECRET_KEY) {
      const isCaptchaValid = await verifyTurnstile({
        secret: env.TURNSTILE_SECRET_KEY,
        token: payload.captcha_token,
        remoteIp: req.ip
      });

      if (!isCaptchaValid) {
        throw badRequest('Captcha verification failed. Please try again.');
      }
    }

    const { data, error } = await supabaseAuth.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          full_name: payload.full_name
        }
      }
    });

    if (error) {
      if (error.message.toLowerCase().includes('email rate limit exceeded')) {
        throw tooManyRequests('Email signup limit reached. Please try again in about 1 hour, or use Google sign-in.');
      }
      throw badRequest(error.message);
    }

    res.status(201).json({
      session: data.session
        ? {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token
          }
        : null,
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email ?? payload.email
          }
        : null
    });
  })
);

authRoutes.post(
  '/login',
  loginRateLimit,
  asyncHandler(async (req, res) => {
    if (!supabaseAuth) {
      throw badRequest('Server auth configuration is incomplete. Missing SUPABASE_ANON_KEY.');
    }

    const payload = z
      .object({
        email: z.string().email(),
        password: z.string().min(1)
      })
      .parse(req.body);

    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email: payload.email,
      password: payload.password
    });

    if (error || !data.session) {
      throw unauthorized('Invalid login credentials');
    }

    res.json({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      }
    });
  })
);

const verifyTurnstile = async ({ secret, token, remoteIp }: { secret: string; token?: string; remoteIp?: string }) => {
  if (!token) {
    return false;
  }

  const form = new URLSearchParams();
  form.append('secret', secret);
  form.append('response', token);
  if (remoteIp) {
    form.append('remoteip', remoteIp);
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form
  });

  if (!response.ok) {
    return false;
  }

  const payload = (await response.json()) as { success?: boolean };
  return payload.success === true;
};

authRoutes.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

authRoutes.post(
  '/system/bootstrap',
  asyncHandler(async (req, res) => {
    if (!env.BOOTSTRAP_TOKEN || req.header('x-bootstrap-token') !== env.BOOTSTRAP_TOKEN) {
      return res.status(401).json({ error: 'Invalid bootstrap token' });
    }

    await bootstrapSuperadmin();
    return res.json({ ok: true });
  })
);
