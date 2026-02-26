import { supabaseAdmin } from '../../config/supabase.js';
import { generateRandomPassword } from '../../utils/crypto.js';
import { logger } from '../../utils/logger.js';

const DEFAULT_SUPERADMIN_EMAIL = 'superadmin@bookstore.local';

export const bootstrapSuperadmin = async (): Promise<void> => {
  const { data: existing, error: existingError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('role', 'superadmin')
    .limit(1);

  if (existingError) {
    throw existingError;
  }

  if ((existing ?? []).length > 0) {
    logger.info('Superadmin exists, bootstrap skipped');
    return;
  }

  const password = generateRandomPassword(20);

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: DEFAULT_SUPERADMIN_EMAIL,
    password,
    email_confirm: true,
    user_metadata: { role: 'superadmin' }
  });

  if (createError || !created.user) {
    throw createError ?? new Error('Failed to create superadmin user');
  }

  const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
    id: created.user.id,
    email: DEFAULT_SUPERADMIN_EMAIL,
    role: 'superadmin'
  });

  if (profileError) {
    throw profileError;
  }

  const { error: bootstrapLogError } = await supabaseAdmin.from('system_bootstrap').insert({
    email: DEFAULT_SUPERADMIN_EMAIL,
    generated_password: password
  });

  if (bootstrapLogError) {
    logger.warn('Unable to persist bootstrap credentials in system_bootstrap', bootstrapLogError.message);
  }

  logger.warn('Superadmin bootstrapped. Store credentials securely now.');
  logger.warn(`SUPERADMIN_EMAIL=${DEFAULT_SUPERADMIN_EMAIL}`);
  logger.warn(`SUPERADMIN_PASSWORD=${password}`);
};
