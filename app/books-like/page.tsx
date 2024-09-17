"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import Link from "next/link";
import Image from "next/image";

const supabase = createClientComponentClient<Database>();

interface BookLike {
  id: string;
  books: string[];
}

interface Book {
  isbn_13: string;
  data: {
    volumeInfo?: {
      title?: string;
      imageLinks?: {
        thumbnail?: string;
      };
    };
  };
}

export default function BooksLikeDirectory() {
  const [booksLike, setBooksLike] = useState<BookLike[]>([]);
  const [books, setBooks] = useState<{ [key: string]: Book }>({});

  useEffect(() => {
    async function fetchBooksLike() {
      try {
        const { data: booksLikeData, error: booksLikeError } = await supabase
          .from("books_like")
          .select("*")
          .limit(10);

        if (booksLikeError) {
          throw new Error(`Error fetching books_like: ${booksLikeError.message}`);
        }

        if (!booksLikeData || booksLikeData.length === 0) {
          console.log("No books_like data found");
          return;
        }

        console.log("Books Like Data:", booksLikeData);
        setBooksLike(booksLikeData);

        const allBookIds = booksLikeData.flatMap((item) => [
          item.id,
          ...item.books,
        ]);
        const uniqueBookIds = [...new Set(allBookIds)];

        console.log("Unique Book IDs:", uniqueBookIds);

        const { data: booksData, error: booksError } = await supabase
          .from("books")
          .select("isbn_13, data")
          .in("isbn_13", uniqueBookIds);

        if (booksError) {
          throw new Error(`Error fetching books: ${booksError.message}`);
        }

        if (!booksData || booksData.length === 0) {
          console.log("No books data found");
          return;
        }

        console.log("Books Data:", booksData);

        const bookMap = booksData.reduce((acc, book) => {
          if (book.isbn_13 && book.data) {
            acc[book.isbn_13] = book;
          } else {
            console.log("Invalid book data:", book);
          }
          return acc;
        }, {} as { [key: string]: Book });

        console.log("Book Map:", bookMap);
        setBooks(bookMap);
      } catch (error) {
        console.error("Error in fetchBooksLike:", error);
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchBooksLike();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Books Like</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {booksLike.map((item) => {
          const mainBook = books[item.id];
          return (
            <div key={item.id} className="card bg-base-100 shadow-xl">
              <figure>
                <Image
                  src={
                    mainBook?.data?.volumeInfo?.imageLinks?.thumbnail ||
                    "/placeholder-book-cover.jpg"
                  }
                  alt={`Cover of ${
                    mainBook?.data?.volumeInfo?.title || "Unknown Book"
                  }`}
                  width={150}
                  height={225}
                  className="h-48"
                />
              </figure>
              <div className="card-body">
                <h2 className="card-title">
                  {mainBook?.data?.volumeInfo?.title || "Unknown Title"}
                </h2>
                <p>Similar books:</p>
                <ul className="list-disc list-inside">
                  {item.books.slice(0, 3).map((isbn) => {
                    console.log(books);
                    return (
                      <li key={isbn}>
                        {books[isbn]?.data?.volumeInfo?.title || "Unknown Book"}
                      </li>
                    );
                  })}
                </ul>
                <div className="card-actions justify-end">
                  <Link
                    href={`/books-like/${encodeURIComponent(
                      mainBook?.data?.volumeInfo?.title || item.id
                    )}`}
                    className="btn btn-primary"
                  >
                    View More
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
