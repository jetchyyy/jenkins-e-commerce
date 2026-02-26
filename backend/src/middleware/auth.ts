import { NextFunction, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { unauthorized } from '../utils/http.js';

export type AuthRole = 'superadmin' | 'customer';

export type AuthUser = {
  id: string;
  email: string;
  role: AuthRole;
};

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;

    if (!token) {
      throw unauthorized('Missing bearer token');
    }

    const {
      data: { user },
      error: authError
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw unauthorized('Invalid token');
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw unauthorized('Profile not found');
    }

    req.user = {
      id: profile.id,
      email: profile.email,
      role: profile.role
    };

    next();
  } catch (error) {
    next(error);
  }
};
