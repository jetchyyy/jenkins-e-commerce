import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../api/client';
import { cartStore } from '../../store/cart.store';
import { useBooks } from '../../hooks/useBooks';
import { formatCurrency } from '../../lib/format';

/* ══════════════════════════════════════════════════════
   Cart Page — /cart
   Full-bleed books.jpg background, lists cart items,
   proceed to checkout button.
   ══════════════════════════════════════════════════════ */
export const CartPage = () => {
    const { bookIds, remove, clear } = cartStore();
    const { data } = useBooks();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Filter only books currently in cart
    const cartBooks = (data?.books ?? []).filter((b) => bookIds.includes(b.id));
    const total = cartBooks.reduce((sum, b) => sum + b.price_cents, 0);
    const currency = cartBooks[0]?.currency ?? 'USD';

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
        } catch (err) {
            setMessage((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section
            className="relative min-h-screen py-28 px-4 bg-cover bg-center bg-fixed"
            style={{ backgroundImage: "url('/images/books.jpg')" }}
        >
            <div className="absolute inset-0 bg-[#050e1f]/82" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-800/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-3xl space-y-8">

                {/* Header */}
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-px w-10 bg-blue-400/50" />
                        <span className="text-blue-300 text-xs font-bold uppercase tracking-[0.3em]">Your Selection</span>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <h1 className="font-heading text-4xl font-bold text-white">
                            Cart
                            {bookIds.length > 0 && (
                                <span className="ml-3 text-xl font-normal text-white/40">({bookIds.length} {bookIds.length === 1 ? 'item' : 'items'})</span>
                            )}
                        </h1>
                        <Link
                            to="/books"
                            className="text-blue-400 hover:text-blue-300 text-sm font-semibold no-underline transition-colors"
                        >
                            ← Continue Shopping
                        </Link>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

                {/* Empty state */}
                {bookIds.length === 0 && !isSuccess && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <p className="text-white/40 text-lg font-medium">Your cart is empty</p>
                        <Link
                            to="/books"
                            className="rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold px-6 py-2.5 text-sm no-underline transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-blue-500/30"
                        >
                            Browse Books
                        </Link>
                    </div>
                )}

                {/* Success */}
                {isSuccess && (
                    <div className="bg-green-500/15 border border-green-400/25 rounded-2xl p-8 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center mx-auto">
                            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <p className="text-green-300 font-bold text-lg">Purchase complete!</p>
                        <p className="text-green-400/70 text-sm">Your books are now in your library.</p>
                        <Link to="/library" className="inline-block mt-2 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-2.5 text-sm no-underline transition-all duration-200">
                            Go to Library
                        </Link>
                    </div>
                )}

                {/* Cart items */}
                {cartBooks.length > 0 && (
                    <div className="space-y-4">
                        {cartBooks.map((book) => (
                            <div
                                key={book.id}
                                className="flex items-center flex-wrap gap-4 bg-white/6 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/8 transition-all duration-200"
                            >
                                <img
                                    src={book.cover_url}
                                    alt={book.title}
                                    className="w-16 h-20 object-cover rounded-xl shadow-lg flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-heading font-bold text-white text-base leading-snug truncate">{book.title}</h3>
                                    <p className="text-white/40 text-xs mt-0.5">by {book.author}</p>
                                    <p className="text-blue-400 font-bold text-sm mt-1.5">{formatCurrency(book.price_cents, book.currency)}</p>
                                </div>
                                <button
                                    onClick={() => remove(book.id)}
                                    className="w-8 h-8 rounded-full bg-white/8 hover:bg-red-500/20 border border-white/10 hover:border-red-400/30 flex items-center justify-center flex-shrink-0 transition-all duration-200 group"
                                    title="Remove"
                                >
                                    <svg className="w-3.5 h-3.5 text-white/40 group-hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}

                        {/* Order summary */}
                        <div className="bg-white/6 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4 mt-6">
                            <h3 className="text-white font-bold text-base">Order Summary</h3>
                            <div className="space-y-2">
                                {cartBooks.map((b) => (
                                    <div key={b.id} className="flex justify-between text-sm">
                                        <span className="text-white/50 truncate max-w-[200px]">{b.title}</span>
                                        <span className="text-white/70 font-medium flex-shrink-0 ml-4">{formatCurrency(b.price_cents, b.currency)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="h-px bg-white/10" />
                            <div className="flex justify-between items-center">
                                <span className="text-white font-bold">Total</span>
                                <span className="text-white font-black text-xl">{formatCurrency(total, currency)}</span>
                            </div>

                            {/* Error */}
                            {message && !isSuccess && (
                                <p className="text-red-300 text-sm font-medium">{message}</p>
                            )}

                            {/* Checkout */}
                            <button
                                onClick={checkout}
                                disabled={loading || bookIds.length === 0}
                                className="w-full rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 text-base transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-400/40 hover:-translate-y-0.5"
                            >
                                {loading ? 'Processing…' : 'Proceed to Checkout'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

