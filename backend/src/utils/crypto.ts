import { randomBytes } from 'crypto';

export const generateRandomPassword = (length = 24): string => {
  return randomBytes(length).toString('base64url').slice(0, length);
};
