export const getFriendlyErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.') => {
  const raw = error instanceof Error ? error.message : String(error ?? '');
  const message = raw.trim();
  const lower = message.toLowerCase();

  if (!message) {
    return fallback;
  }

  if (lower.includes('invalid login credentials')) {
    return 'Incorrect email or password. Please try again.';
  }

  if (lower.includes('too many login attempts')) {
    return 'Too many login attempts. Please wait 10 minutes and try again.';
  }

  if (lower.includes('email not confirmed')) {
    return 'Please confirm your email before signing in.';
  }

  if (lower.includes('bucket not found')) {
    return 'File storage is still being prepared. Please try again in a moment.';
  }

  if (lower.includes('networkerror') || lower.includes('failed to fetch')) {
    return 'Cannot reach the server right now. Check your internet and try again.';
  }

  if (lower.includes('duplicate') || lower.includes('already exists')) {
    return 'This record already exists. Please review your input.';
  }

  return message;
};

export const getRetryAtFromRateLimitError = (error: unknown): Date | null => {
  const raw = error instanceof Error ? error.message : String(error ?? '');
  const status = typeof error === 'object' && error !== null && 'status' in error ? Number((error as { status?: unknown }).status) : NaN;
  const message = raw.trim();
  const lower = message.toLowerCase();

  if (!Number.isNaN(status) && status === 429) {
    return new Date(Date.now() + 60 * 1000);
  }

  if (!lower.includes('too many') && !lower.includes('rate limit')) {
    return null;
  }

  const secondsMatch = message.match(/after\s+(\d+)\s+second/i);
  if (secondsMatch) {
    const seconds = Number(secondsMatch[1]);
    if (Number.isFinite(seconds) && seconds > 0) {
      return new Date(Date.now() + seconds * 1000);
    }
  }

  const minutesMatch = message.match(/after\s+(\d+)\s+minute/i);
  if (minutesMatch) {
    const minutes = Number(minutesMatch[1]);
    if (Number.isFinite(minutes) && minutes > 0) {
      return new Date(Date.now() + minutes * 60 * 1000);
    }
  }

  const hoursMatch = message.match(/after\s+(\d+)\s+hour/i);
  if (hoursMatch) {
    const hours = Number(hoursMatch[1]);
    if (Number.isFinite(hours) && hours > 0) {
      return new Date(Date.now() + hours * 60 * 60 * 1000);
    }
  }

  return new Date(Date.now() + 60 * 1000);
};
