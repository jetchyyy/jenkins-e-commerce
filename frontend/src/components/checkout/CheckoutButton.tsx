import { useState } from 'react';
import { apiFetch } from '../../api/client';
import { cartStore } from '../../store/cart.store';

export const CheckoutButton = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { bookIds, clear } = cartStore();

  const checkout = async () => {
    if (bookIds.length === 0) return;
    setLoading(true);
    setMessage('');
    setIsSuccess(false);

    try {
      const intent = await apiFetch<{ provider: string; client_secret: string }>('/api/checkout/create-intent', {
        method: 'POST',
        body: JSON.stringify({ book_ids: bookIds }),
      });

      if (intent.provider === 'mock') {
        await apiFetch('/api/checkout/mock/complete', {
          method: 'POST',
          body: JSON.stringify({ book_ids: bookIds }),
        });
        setMessage('Payment complete! Your library has been updated.');
        setIsSuccess(true);
        clear();
        return;
      }
      setMessage('Stripe intent created — complete payment in your Stripe flow.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        disabled={loading || bookIds.length === 0}
        onClick={checkout}
        className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a8a] hover:bg-[#163080] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 text-sm transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-600/30 hover:-translate-y-0.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {loading ? 'Processing…' : `Checkout (${bookIds.length})`}
      </button>
      {message && (
        <p className={`text-xs font-medium ${isSuccess ? 'text-green-600' : 'text-red-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

