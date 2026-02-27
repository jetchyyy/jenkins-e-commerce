import { useState } from 'react';
import { Book } from '../../lib/zodSchemas';
import { PriceTag } from './PriceTag';
import { BookDetailModal } from './BookDetailModal';

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
}) => (
  <article className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(30,42,94,0.08)] hover:shadow-[0_8px_40px_rgba(29,78,216,0.18)] hover:-translate-y-1.5 transition-all duration-300 border border-[#d1e4ff]">

    {/* Cover image with quick-view overlay */}
    <div className="relative overflow-hidden">
      <img
        src={book.cover_url}
        alt={book.title}
        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {index < 2 && (
        <span className="absolute top-3 left-3 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md">
          New
        </span>
      )}
      <div className="absolute inset-0 bg-[#0c1a40]/0 group-hover:bg-[#0c1a40]/55 transition-all duration-300 flex items-center justify-center">
        <button
          onClick={onViewDetails}
          className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-white text-[#1e3a8a] font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full hover:bg-blue-50 shadow-lg"
        >
          Quick View
        </button>
      </div>
    </div>

    {/* Body */}
    <div className="flex flex-col flex-1 p-5 space-y-3">
      <div className="flex-1">
        <h3 className="font-heading text-base font-bold text-[#1e3a8a] line-clamp-2 leading-snug">
          {book.title}
        </h3>
        <p className="text-xs text-slate-400 mt-1">by {book.author}</p>
      </div>

      <div className="h-px bg-slate-100" />

      <div className="flex items-center justify-between">
        <PriceTag amount={book.price_cents} currency={book.currency} />
        <div className="flex text-amber-400 text-xs gap-0.5">★★★★★</div>
      </div>

      <button
        onClick={onViewDetails}
        className="w-full rounded-xl bg-[#1e3a8a] hover:bg-[#163080] px-3 py-2.5 text-xs font-bold text-white transition-all duration-200 shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5"
      >
        View Details
      </button>
    </div>
  </article>
);

