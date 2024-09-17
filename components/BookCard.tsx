import Image from "next/image";
import Link from "next/link";

interface BookCardProps {
  book: {
    isbn_13: string;
    data: {
      volumeInfo: {
        title: string;
        authors?: string[];
        imageLinks?: {
          thumbnail?: string;
        };
      };
    };
  };
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  return (
    <div className="card bg-base-100 shadow-xl">
      <figure>
        <Image
          src={
            book.data.volumeInfo.imageLinks?.thumbnail ||
            "/placeholder-book-cover.jpg"
          }
          alt={`Cover of ${book.data.volumeInfo.title}`}
          width={150}
          height={225}
          className="w-full h-48 object-cover"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{book.data.volumeInfo.title}</h2>
        <p>{book.data.volumeInfo.authors?.join(", ") || "Unknown Author"}</p>
        <div className="card-actions justify-end">
          <Link
            href={`/books-like/${encodeURIComponent(book.data.volumeInfo.title)}/${book.isbn_13}`}
            className="btn btn-primary"
          >
            Find Similar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
