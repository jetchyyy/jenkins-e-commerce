import { useState } from 'react';
import { Book } from '../../lib/zodSchemas';
import { PriceTag } from './PriceTag';
import { BookDetailModal } from './BookDetailModal';
import { cartStore } from '../../store/cart.store';

/* ── Standard card used on home page AllBooksSection (self-contained modal) ── */
export const BookCard = ({ book, index = 0 }: { book: Book; index?: number }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <BookCardInner book={book} index={index} onViewDetails={() => setModalOpen(true)} />
      {modalOpen && <BookDetailModal bookId={book.id} onClose={() => setModalOpen(false)} />}
    </>
  );
};

/* ── Controlled card used on BookList (modal hoisted to page level) ── */
export const BookCardModal = ({
  book,
  index = 0,
  onViewDetails,
}: {
  book: Book;
  index?: number;
  onViewDetails: (id: string) => void;
}) => <BookCardInner book={book} index={index} onViewDetails={() => onViewDetails(book.id)} />;

/* ── Shared card UI ── */
const BookCardInner = ({
  book,
  index,
  onViewDetails,
}: {
  book: Book;
  index: number;
  onViewDetails: () => void;
}) => {
  const add = cartStore((state) => state.add);

  return (
    <article className="group flex flex-col bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(30,42,94,0.08)] hover:shadow-[0_8px_40px_rgba(29,78,216,0.18)] hover:-translate-y-1.5 transition-all duration-300 border border-[#d1e4ff] relative h-full">

      {/* Cover image with quick-view overlay */}
      <div className="relative overflow-hidden shrink-0 bg-slate-50 aspect-[3/4] sm:aspect-auto sm:h-64 cursor-pointer" onClick={onViewDetails}>
        <img
          src={book.cover_url}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {index < 2 && (
          <span className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-blue-500 text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded shadow-md z-10">
            New
          </span>
        )}
        <div className="hidden sm:flex absolute inset-0 bg-[#0c1a40]/0 group-hover:bg-[#0c1a40]/55 transition-all duration-300 items-center justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-white text-[#1e3a8a] font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full hover:bg-blue-50 shadow-lg"
          >
            Quick View
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-2 sm:p-5 relative pb-8 sm:pb-5">
        <div className="flex-1 min-h-0">
          <h3 className="font-heading text-[10px] sm:text-base font-bold text-[#1e3a8a] line-clamp-2 leading-[1.2] cursor-pointer" title={book.title} onClick={onViewDetails}>
            {book.title}
          </h3>
          <p className="text-[8px] sm:text-xs text-slate-400 mt-0.5 truncate">by {book.author}</p>
        </div>

        <div className="hidden sm:block h-px bg-slate-100 my-3" />

        <div className="flex items-center justify-between mt-1 sm:mt-0">
          <div className="text-[11px] sm:text-base font-bold text-[#1e3a8a]">
            {book.currency === 'USD' ? '$' : book.currency}{(book.price_cents / 100).toFixed(2)}
          </div>
          <div className="hidden sm:flex text-amber-400 text-xs gap-0.5">★★★★★</div>
        </div>

        {/* Desktop full action buttons */}
        <div className="hidden sm:flex gap-2 mt-3">
          <button
            onClick={() => add(book.id)}
            className="flex-1 rounded-xl bg-[#1e3a8a] hover:bg-[#163080] px-3 py-2.5 text-xs font-bold text-white transition-all duration-200 shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5"
          >
            Add to Cart
          </button>
          <button
            onClick={onViewDetails}
            className="flex-1 rounded-xl border border-slate-200 hover:border-[#1e3a8a] px-3 py-2.5 text-xs font-bold text-slate-600 hover:text-[#1e3a8a] transition-all duration-200"
          >
            Details
          </button>
        </div>

        {/* Mobile quick add floating button */}
        <button
          onClick={() => add(book.id)}
          className="sm:hidden absolute bottom-2 right-2 w-6 h-6 bg-[#1e3a8a] hover:bg-[#163080] text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
          aria-label="Add to cart"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
      </div>
    </article>
  );
};
