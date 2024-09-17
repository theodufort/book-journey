"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import Link from "next/link";
import BookCard from "@/components/BookCard";

const supabase = createClientComponentClient<Database>();

export default function BooksLike({ params }: { params: { id: string[] } }) {
  const fullSlug = params.id.join('/');
  const isbn = fullSlug.split('-').pop() || '';
  const decodedTitle = fullSlug.slice(0, -isbn.length - 1).replace(/-/g, ' ');
  const [books, setBooks] = useState<any[]>([]);
  const [mainBook, setMainBook] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchBooksLike() {
      setLoading(true);

      console.log("Fetching books like for ISBN:", isbn);

      const { data: booksLikeData, error: booksLikeError } = await supabase
        .from("books_like")
        .select("books")
        .eq("id", isbn)
        .single();

      if (booksLikeError) {
        console.error("Error fetching books_like:", booksLikeError);
        setError("Error loading similar books. Please try again later.");
        setLoading(false);
        return;
      }

      console.log("Books like data:", booksLikeData);

      if (booksLikeData && booksLikeData.books.length > 0) {
        const { data: mainBookData, error: mainBookError } = await supabase
          .from("books")
          .select("isbn_13, data")
          .eq("isbn_13", isbn);
        console.log("Main book data:", mainBookData);

        if (mainBookError) {
          console.error("Error fetching main book:", mainBookError);
          setError("Error loading main book details. Please try again later.");
          setLoading(false);
          return;
        }

        if (mainBookData && mainBookData.length > 0) {
          setMainBook(mainBookData[0]);

          const { data: booksData, error: booksError } = await supabase
            .from("books")
            .select("isbn_13, data")
            .in("isbn_13", booksLikeData.books);

          if (booksError) {
            console.error("Error fetching similar books:", booksError);
            setError("Error loading book details. Please try again later.");
          } else if (booksData) {
            console.log("Similar books data:", booksData);
            setBooks(booksData);
          }
        } else {
          console.error("Main book not found");
          setError("Main book not found.");
        }
      } else {
        console.log("No similar books found");
        setError("No similar books found.");
      }
      setLoading(false);
    }

    fetchBooksLike();
  }, [isbn]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const mainBookTitle = mainBook?.data?.volumeInfo?.title || "Unknown Book";

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Books Like {mainBookTitle}</h1>
      {books.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <BookCard key={book.isbn_13} book={book} />
          ))}
        </div>
      ) : (
        <p>No similar books found.</p>
      )}
      <Link href="/books-like" className="btn btn-primary">
        Back to Search
      </Link>
    </div>
  );
}
