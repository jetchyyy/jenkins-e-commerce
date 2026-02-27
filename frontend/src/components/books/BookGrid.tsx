import { Book } from '../../lib/zodSchemas';
import { BookCard } from './BookCard';

export const BookGrid = ({ books }: { books: Book[] }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
};

