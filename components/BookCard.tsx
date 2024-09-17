import Image from "next/image";
import Link from "next/link";

interface BookCardProps {
  book: {
    isbn: string;
    title: string;
    author: string;
    cover_image: string;
  };
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  return (
    <div className="card bg-base-100 shadow-xl">
      <figure>
        <Image
          src={book.cover_image || "/placeholder-book-cover.jpg"}
          alt={`Cover of ${book.title}`}
          width={200}
          height={300}
          className="w-full h-64 object-cover"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{book.title}</h2>
        <p>{book.author}</p>
        <div className="card-actions justify-end">
          <Link href={`/books-like/${book.isbn}`} className="btn btn-primary">
            Find Similar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
