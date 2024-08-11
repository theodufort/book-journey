"use client";

import { useEffect, useState } from "react";
import HeaderDashboard from "@/components/DashboardHeader";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Volume } from "@/interfaces/GoogleAPI";
import { Database } from "@/types/supabase";
import BookAvatar from "@/components/BookAvatar";

export default function Recommendations() {
  const [isLoading, setIsLoading] = useState(true);
  const [booksLoaded, setBooksLoaded] = useState(false);
  const [bookSuggestions, setBookSuggestions] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  async function fetchRecommendations() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/recommendations");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            data.error || "Unknown error"
          }`
        );
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data || data.length == 0) {
        throw new Error("Invalid recommendations data received");
      }
      const volumesWithImages = data.filter(
        (item: any) => item.volumeInfo.imageLinks
      );
      setBookSuggestions(volumesWithImages);
      setBooksLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error("Error fetching recommendations:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function addToReadingList(book: Volume) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from("reading_list").insert({
        user_id: user.id,
        book_id: book.id,
        status: "To Read",
      });

      if (error) console.error("Error adding book to reading list:", error);
      else {
        // Optionally, you could remove the book from recommendations here
        fetchRecommendations(); // Refresh the list
      }
    }
  }

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-6xl mx-auto space-y-8">
        <HeaderDashboard />

        <h1 className="text-3xl md:text-4xl font-extrabold">
          Book Recommendations
        </h1>

        {isLoading && (
          <div className="flex justify-center items-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}
        {error && (
          <div className="text-center text-red-500">Error: {error}</div>
        )}

        {!isLoading && !error && (
          <>
            {bookSuggestions.length === 0 ? (
              <p className="text-center">
                No recommendations available at the moment.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {bookSuggestions.map((x, index) => (
                  <div key={`book-suggestion-${x.id}-${index}`}>
                    <BookAvatar vol={x} isBlurred={false} allowAdd={true} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
