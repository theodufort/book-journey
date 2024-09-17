"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import Link from "next/link";
import BookCard from "@/components/BookCard";
import { useSearchParams } from "next/navigation";

const supabase = createClientComponentClient<Database>();

export default function BooksLike({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const isbn = searchParams.get("isbn") || params.id;
  const decodedId = decodeURIComponent(params.id);
  const [books, setBooks] = useState<any[]>([]);
  const [mainBook, setMainBook] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchBooksLike() {
      setLoading(true);

      const { data: booksLikeData, error: booksLikeError } = await supabase
        .from("books_like")
        .select("books")
        .eq("id", isbn);
      console.log(isbn);
      console.log(booksLikeData);
      console.log(booksLikeError);

      if (booksLikeError) {
        console.error(booksLikeError);
        setError("Error loading similar books. Please try again later.");
        setLoading(false);
        return;
      }

      if (booksLikeData && booksLikeData.length > 0) {
        const { data: mainBookData, error: mainBookError } = await supabase
          .from("books")
          .select("isbn_13, data")
          .eq("isbn_13", isbn);
        console.log(mainBookData);

        if (mainBookError) {
          console.error(mainBookError);
          setError("Error loading main book details. Please try again later.");
          setLoading(false);
          return;
        }

        if (mainBookData && mainBookData.length > 0) {
          setMainBook(mainBookData[0]);

          const { data: booksData, error: booksError } = await supabase
            .from("books")
            .select("isbn_13, data")
            .in("isbn_13", booksLikeData[0].books);

          if (booksError) {
            console.error(booksError);
            setError("Error loading book details. Please try again later.");
          } else if (booksData) {
            setBooks(booksData);
          }
        } else {
          setError("Main book not found.");
        }
      } else {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <BookCard key={book.isbn_13} book={book} />
        ))}
      </div>
      <Link href="/books-like" className="btn btn-primary">
        Back to Search
      </Link>
    </div>
  );
}
