import { useParams } from 'react-router-dom';
import { PriceTag } from '../../components/books/PriceTag';
import { useBook } from '../../hooks/useBooks';
import { cartStore } from '../../store/cart.store';

export const BookDetails = () => {
  const { id = '' } = useParams();
  const { data, isLoading, error } = useBook(id);
  const add = cartStore((state) => state.add);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{(error as Error).message}</p>;
  if (!data?.book) return <p>Not found</p>;

  const book = data.book;

  return (
    <article className="grid gap-8 rounded-xl bg-white p-6 shadow-sm md:grid-cols-2">
      <img src={book.cover_url} alt={book.title} className="h-full w-full rounded-lg object-cover" />
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{book.title}</h1>
        <p className="text-slate-600">by {book.author}</p>
        <p>{book.description}</p>
        <PriceTag amount={book.price_cents} currency={book.currency} />
        <button onClick={() => add(book.id)} className="block rounded bg-brand-700 px-4 py-2 text-white">
          Add to cart
        </button>
      </div>
    </article>
  );
};
