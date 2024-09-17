"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import Link from "next/link";
import BookCard from "@/components/BookCard";

const supabase = createClientComponentClient<Database>();

export default function BooksLike({ params }: { params: { id: string } }) {
  const [books, setBooks] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchBooksLike() {
      setLoading(true);
      const { data: booksLikeData, error: booksLikeError } = await supabase
        .from("books_like")
        .select("books")
        .eq("id", params.id)
        .single();

      if (booksLikeError) {
        console.error(booksLikeError);
        setError("Error loading similar books. Please try again later.");
        setLoading(false);
        return;
      }

      if (booksLikeData) {
        const { data: booksData, error: booksError } = await supabase
          .from("books")
          .select("isbn_13, data")
          .in("isbn_13", booksLikeData.books);

        if (booksError) {
          console.error(booksError);
          setError("Error loading book details. Please try again later.");
        } else if (booksData) {
          setBooks(booksData);
        }
      }
      setLoading(false);
    }

    fetchBooksLike();
  }, [params.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Books Like {params.id}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <BookCard key={book.isbn} book={book} />
        ))}
      </div>
      <Link href="/books-like" className="btn btn-primary">
        Back to Search
      </Link>
    </div>
  );
}
