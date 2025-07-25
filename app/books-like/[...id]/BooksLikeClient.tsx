"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import Link from "next/link";
import BookCard from "@/components/BookCard";

const supabase = createClientComponentClient<Database>();

export default function BooksLikeClient({
  params,
}: {
  params: { id: string[] };
}) {
  const fullSlug = params.id.join("/");
  const isbn = fullSlug.split("-").pop() || "";
  const decodedTitle = fullSlug.slice(0, -isbn.length - 1).replace(/-/g, " ");
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

      if (booksLikeData && booksLikeData.books.length > 0) {
        try {
          const mainBookResponse = await fetch(`/api/books/${isbn}`);
          if (!mainBookResponse.ok) {
            throw new Error("Failed to fetch main book");
          }
          const mainBookData = await mainBookResponse.json();
          console.log("Main book data:", mainBookData);
          setMainBook(mainBookData);

          const similarBooksData = await Promise.all(
            booksLikeData.books.map(async (bookIsbn) => {
              try {
                const response = await fetch(
                  `/api/books/${bookIsbn.trim()}?useProxy=true`
                );
                if (!response.ok) {
                  console.error(`Failed to fetch book with ISBN ${bookIsbn}`);
                  return null;
                }
                return response.json();
              } catch (error) {
                console.error(`Error fetching book with ISBN ${bookIsbn}:`, error);
                return null;
              }
            })
          );
          const validSimilarBooks = similarBooksData.filter(book => book !== null);
          console.log("Similar books data:", validSimilarBooks);
          const formattedBooks = validSimilarBooks.map(book => ({
            isbn_13: book.id,
            data: book
          }));
          setBooks(formattedBooks);
        } catch (error) {
          console.error("Error fetching book details:", error);
          setError("Error loading book details. Please try again later.");
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
