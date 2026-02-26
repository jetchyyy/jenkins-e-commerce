import { useState } from 'react';
import { apiFetch } from '../../api/client';
import { cartStore } from '../../store/cart.store';

export const CheckoutButton = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { bookIds, clear } = cartStore();

  const checkout = async () => {
    if (bookIds.length === 0) return;

    setLoading(true);
    setMessage('');

    try {
      const intent = await apiFetch<{ provider: string; client_secret: string }>('/api/checkout/create-intent', {
        method: 'POST',
        body: JSON.stringify({ book_ids: bookIds })
      });

      if (intent.provider === 'mock') {
        await apiFetch('/api/checkout/mock/complete', {
          method: 'POST',
          body: JSON.stringify({ book_ids: bookIds })
        });

        setMessage('Mock payment complete. Your library is updated.');
        clear();
        return;
      }

      setMessage('Stripe intent created. Complete payment on your Stripe client flow.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button disabled={loading || bookIds.length === 0} onClick={checkout} className="rounded bg-brand-700 px-4 py-2 text-white">
        {loading ? 'Processing...' : `Checkout (${bookIds.length})`}
      </button>
      {message && <p className="text-sm text-slate-600">{message}</p>}
    </div>
  );
};
