import { BookGrid } from '../../components/books/BookGrid';
import { CheckoutButton } from '../../components/checkout/CheckoutButton';
import { useBooks } from '../../hooks/useBooks';

export const BookList = () => {
  const { data, isLoading, error } = useBooks();

  if (isLoading) return <p>Loading books...</p>;
  if (error) return <p>{(error as Error).message}</p>;

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-bold">Book Catalog</h2>
        <CheckoutButton />
      </div>
      <BookGrid books={data?.books ?? []} />
    </section>
  );
};
