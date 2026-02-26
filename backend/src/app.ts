import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRateLimit } from './middleware/rateLimit.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { booksRoutes } from './modules/books/books.routes.js';
import { checkoutRoutes } from './modules/checkout/checkout.routes.js';
import { libraryRoutes } from './modules/library/library.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';
import { stripeWebhookRouter } from './modules/checkout/stripe.webhook.js';
import { ordersRoutes } from './modules/library/orders.routes.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(morgan('dev'));
app.use('/api/checkout/webhook', stripeWebhookRouter);
app.use(express.json({ limit: '2mb' }));
app.use(apiRateLimit);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);
