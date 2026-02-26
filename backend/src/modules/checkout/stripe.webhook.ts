import express from 'express';
import Stripe from 'stripe';
import { env } from '../../config/env.js';
import { stripe } from '../../config/stripe.js';
import { logger } from '../../utils/logger.js';
import { processSuccessfulPayment } from './checkout.service.js';

export const stripeWebhookRouter = express.Router();

stripeWebhookRouter.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return res.status(200).json({ skipped: true });
  }

  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe signature' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.warn('Invalid Stripe webhook signature', err);
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    const userId = paymentIntent.metadata?.user_id;
    const rawBookIds = paymentIntent.metadata?.book_ids;

    if (!userId || !rawBookIds) {
      logger.warn('Payment intent missing metadata', paymentIntent.id);
      return res.status(200).json({ received: true, skipped: true });
    }

    let bookIds: string[] = [];

    try {
      bookIds = JSON.parse(rawBookIds) as string[];
    } catch {
      logger.warn('Invalid book_ids metadata json', { paymentIntentId: paymentIntent.id });
      return res.status(200).json({ received: true, skipped: true });
    }

    try {
      await processSuccessfulPayment(paymentIntent.id, userId, bookIds);
      logger.info('Stripe webhook processed', { paymentIntentId: paymentIntent.id });
    } catch (error) {
      logger.error('Failed processing Stripe webhook', error);
      return res.status(500).json({ error: 'Webhook handling failed' });
    }
  }

  return res.status(200).json({ received: true });
});
