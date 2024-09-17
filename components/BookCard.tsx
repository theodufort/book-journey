import Image from "next/image";
import Link from "next/link";
import { FC } from "react";

interface BookCardProps {
  book: {
    isbn_13: string;
    data?: {
      volumeInfo?: {
        title?: string;
        authors?: string[];
        imageLinks?: {
          thumbnail?: string;
        };
      };
    };
  };
}

const BookCard: FC<BookCardProps> = ({ book }) => {
  const title = book.data?.volumeInfo?.title || "Unknown Title";
  const authors =
    book.data?.volumeInfo?.authors?.join(", ") || "Unknown Author";
  const thumbnailUrl =
    book.data?.volumeInfo?.imageLinks?.thumbnail ||
    "/placeholder-book-cover.jpg";

  return (
    <div className="card bg-base-100 shadow-xl">
      <figure>
        <Image
          src={thumbnailUrl}
          alt={`Cover of ${title}`}
          width={150}
          height={225}
          className="w-full h-48 object-cover"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p>{authors}</p>
        <div className="card-actions justify-end">
          <Link
            href={`/books-like/${encodeURIComponent(title).replace(
              /%20/g,
              "-"
            )}-${book.isbn_13}`}
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
