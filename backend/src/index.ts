import { app } from './app.js';
import { env } from './config/env.js';
import { bootstrapSuperadmin } from './modules/auth/bootstrapSuperadmin.js';
import { logger } from './utils/logger.js';

const start = async () => {
  await bootstrapSuperadmin();

  app.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT}`);
  });
};

start().catch((error) => {
  logger.error('Failed to start app', error);
  process.exit(1);
});
