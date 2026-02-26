import { Link } from 'react-router-dom';
import { Book } from '../../lib/zodSchemas';
import { PriceTag } from './PriceTag';
import { cartStore } from '../../store/cart.store';

export const BookCard = ({ book }: { book: Book }) => {
  const add = cartStore((s) => s.add);

  return (
    <article className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <img src={book.cover_url} alt={book.title} className="h-56 w-full object-cover" />
      <div className="space-y-2 p-4">
        <h3 className="text-lg font-semibold">{book.title}</h3>
        <p className="text-sm text-slate-600">by {book.author}</p>
        <PriceTag amount={book.price_cents} currency={book.currency} />
        <div className="flex gap-2 pt-2">
          <Link to={`/books/${book.id}`} className="rounded border px-3 py-1 text-sm">
            Details
          </Link>
          <button onClick={() => add(book.id)} className="rounded bg-brand-700 px-3 py-1 text-sm text-white">
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
};
