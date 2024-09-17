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
    title: string;
    cover_image: string;
  };
}

export default function BooksLikeDirectory() {
  const [booksLike, setBooksLike] = useState<BookLike[]>([]);
  const [books, setBooks] = useState<{ [key: string]: Book }>({});

  useEffect(() => {
    async function fetchBooksLike() {
      const { data: booksLikeData, error: booksLikeError } = await supabase
        .from("books_like")
        .select("*")
        .limit(10);

      if (booksLikeError) {
        console.error("Error fetching books_like:", booksLikeError);
        return;
      }

      if (booksLikeData) {
        setBooksLike(booksLikeData);
        const allBookIds = booksLikeData.flatMap(item => [item.id, ...item.books]);
        const uniqueBookIds = [...new Set(allBookIds)];

        const { data: booksData, error: booksError } = await supabase
          .from("books")
          .select("isbn_13, data->title, data->cover_image")
          .in("isbn_13", uniqueBookIds);

        if (booksError) {
          console.error("Error fetching books:", booksError);
        } else if (booksData) {
          const bookMap = booksData.reduce((acc, book) => {
            acc[book.isbn_13] = book as Book;
            return acc;
          }, {} as { [key: string]: Book });
          setBooks(bookMap);
        }
      }
    }

    fetchBooksLike();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Books Like</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {booksLike.map((item) => (
          <div key={item.id} className="card bg-base-100 shadow-xl">
            <figure>
              <Image
                src={books[item.id]?.data.cover_image || "/placeholder-book-cover.jpg"}
                alt={`Cover of ${books[item.id]?.data.title}`}
                width={200}
                height={300}
                className="w-full h-64 object-cover"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{books[item.id]?.data.title}</h2>
              <p>Similar books:</p>
              <ul className="list-disc list-inside">
                {item.books.slice(0, 3).map((isbn) => (
                  <li key={isbn}>{books[isbn]?.data.title}</li>
                ))}
              </ul>
              <div className="card-actions justify-end">
                <Link href={`/books-like/${item.id}`} className="btn btn-primary">
                  View More
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
