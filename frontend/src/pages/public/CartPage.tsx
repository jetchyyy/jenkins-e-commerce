import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';
import { cartStore } from '../../store/cart.store';
import { useBooks } from '../../hooks/useBooks';
import { formatCurrency } from '../../lib/format';
import { ActionModal } from '../../components/feedback/ActionModal';
import { getFriendlyErrorMessage } from '../../lib/feedback';
import { useAuth } from '../../hooks/useAuth';

/* ══════════════════════════════════════════════════════
   Cart Page — /cart
   Full-bleed books.jpg background, lists cart items,
   proceed to checkout button.
   ══════════════════════════════════════════════════════ */
export const CartPage = () => {
    const { bookIds, remove, clear } = cartStore();
    const { data } = useBooks();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; title: string; message: string }>({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });

    // Filter only books currently in cart
    const cartBooks = (data?.books ?? []).filter((b) => bookIds.includes(b.id));
    const total = cartBooks.reduce((sum, b) => sum + b.price_cents, 0);
    const currency = cartBooks[0]?.currency ?? 'USD';

    const checkout = async () => {
        if (bookIds.length === 0) return;
        if (!user) {
            navigate('/login', { state: { from: { pathname: '/cart' } } });
            return;
        }

        setLoading(true);
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
                setModal({
                    isOpen: true,
                    type: 'success',
                    title: 'Purchase Complete',
                    message: 'Your books are now in your library permanently.'
                });
                clear();
                return;
            }
            setModal({
                isOpen: true,
                type: 'success',
                title: 'Payment Pending',
                message: 'Stripe flow is not configured yet. Keep PAYMENT_MODE=mock to test full purchase flow.'
            });
        } catch (err) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Checkout Failed',
                message: getFriendlyErrorMessage(err, 'Checkout failed. Please try again.')
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="relative min-h-screen py-28 px-4 bg-slate-50 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-3xl space-y-8">

                {/* Header */}
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-px w-10 bg-[#1e3a8a]/30" />
                        <span className="text-[#1e3a8a] text-xs font-bold uppercase tracking-[0.3em]">Your Selection</span>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <h1 className="font-heading text-4xl font-bold text-[#1e3a8a]">
                            Cart
                            {bookIds.length > 0 && (
                                <span className="ml-3 text-xl font-normal text-slate-400">({bookIds.length} {bookIds.length === 1 ? 'item' : 'items'})</span>
                            )}
                        </h1>
                        <Link
                            to="/books"
                            className="text-[#1e3a8a] hover:text-blue-600 text-sm font-semibold no-underline transition-colors"
                        >
                            ← Continue Shopping
                        </Link>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-[#d1e4ff] to-transparent" />

                {/* Empty state */}
                {bookIds.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white border border-[#d1e4ff] shadow-sm flex items-center justify-center">
                            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <p className="text-slate-500 text-lg font-medium">Your cart is empty</p>
                        <Link
                            to="/books"
                            className="rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold px-6 py-2.5 text-sm no-underline transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-blue-500/30"
                        >
                            Browse Books
                        </Link>
                    </div>
                )}

                {/* Cart items */}
                {cartBooks.length > 0 && (
                    <div className="space-y-4">
                        {cartBooks.map((book) => (
                            <div
                                key={book.id}
                                className="flex items-start sm:items-center flex-wrap sm:flex-nowrap gap-3 sm:gap-4 bg-white border border-[#d1e4ff] shadow-sm rounded-2xl p-3 sm:p-4 hover:shadow-md transition-all duration-200"
                            >
                                <img
                                    src={book.cover_url}
                                    alt={book.title}
                                    className="w-14 sm:w-16 h-20 object-cover rounded-xl shadow-sm flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0 pr-4 sm:pr-0">
                                    <h3 className="font-heading font-bold text-[#1e3a8a] text-sm sm:text-base leading-snug line-clamp-2">{book.title}</h3>
                                    <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5 line-clamp-1">by {book.author}</p>
                                    <p className="text-[#1e3a8a] font-bold text-xs sm:text-sm mt-1 sm:mt-1.5">{formatCurrency(book.price_cents, book.currency)}</p>
                                </div>
                                <button
                                    onClick={() => remove(book.id)}
                                    className="absolute sm:relative top-3 sm:top-auto right-3 sm:right-auto w-8 h-8 rounded-full bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 flex items-center justify-center flex-shrink-0 transition-all duration-200 group"
                                    title="Remove"
                                >
                                    <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}

                        {/* Order summary */}
                        <div className="bg-white border border-[#d1e4ff] shadow-sm rounded-2xl p-5 sm:p-6 space-y-4 mt-6">
                            <h3 className="text-[#1e3a8a] font-bold text-base">Order Summary</h3>
                            <div className="space-y-2">
                                {cartBooks.map((b) => (
                                    <div key={b.id} className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-slate-500 truncate max-w-[150px] sm:max-w-[200px] flex-shrink">{b.title}</span>
                                        <span className="text-slate-700 font-medium flex-shrink-0 ml-2 sm:ml-4">{formatCurrency(b.price_cents, b.currency)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="h-px bg-[#d1e4ff]" />
                            <div className="flex justify-between items-center">
                                <span className="text-[#1e3a8a] font-bold">Total</span>
                                <span className="text-[#1e3a8a] font-black text-xl">{formatCurrency(total, currency)}</span>
                            </div>

                            {/* Checkout */}
                            <button
                                onClick={checkout}
                                disabled={loading || bookIds.length === 0}
                                className="w-full rounded-xl bg-[#1e3a8a] hover:bg-[#163080] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 text-base transition-all duration-300 shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5"
                            >
                                {loading ? 'Processing…' : 'Proceed to Checkout'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <ActionModal
                isOpen={modal.isOpen}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                confirmLabel={modal.type === 'success' ? 'OK' : 'Close'}
                onConfirm={() => {
                    const isPurchaseComplete = modal.type === 'success' && modal.title === 'Purchase Complete';
                    setModal((prev) => ({ ...prev, isOpen: false }));
                    if (isPurchaseComplete) {
                        navigate('/library');
                    }
                }}
            />
        </section>
    );
};

