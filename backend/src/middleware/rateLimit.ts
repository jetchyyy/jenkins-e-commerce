import rateLimitImport from 'express-rate-limit';

const rateLimitFactory = ((rateLimitImport as any).default ?? rateLimitImport) as (...args: any[]) => any;

export const apiRateLimit = rateLimitFactory({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});

export const loginRateLimit = rateLimitFactory({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many login attempts. Please wait 10 minutes before trying again.'
  }
});

export const registerRateLimit = rateLimitFactory({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many registration attempts. Please wait 15 minutes before trying again.'
  }
});
