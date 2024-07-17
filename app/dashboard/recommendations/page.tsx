"use client";

import { useEffect, useState } from "react";
import HeaderDashboard from "@/components/DashboardHeader";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Volume } from "@/interfaces/GoogleAPI";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<Volume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  async function fetchRecommendations() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/recommendations');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${data.error || 'Unknown error'}`);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!data.recommendations || !Array.isArray(data.recommendations)) {
        throw new Error('Invalid recommendations data received');
      }
      
      // Fetch book details using the search API
      const bookDetails = await Promise.all(
        data.recommendations.map(async (recommendation) => {
          const searchResponse = await fetch(`/api/books/search?q=${encodeURIComponent(recommendation.title)}`);
          const searchData = await searchResponse.json();
          return searchData.items[0]; // Assuming the first result is the most relevant
        })
      );
      
      setRecommendations(bookDetails);
      console.log('Recommendations fetched:', bookDetails.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error("Error fetching recommendations:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function addToReadingList(book: Volume) {
    const { data: { user } } = await supabase.auth.getUser();
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

        {isLoading && <div className="text-center">Loading...</div>}
        {error && <div className="text-center text-red-500">Error: {error}</div>}

        {!isLoading && !error && (
          <>
            {recommendations.length === 0 ? (
              <p className="text-center">No recommendations available at the moment.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((book) => (
                  <div key={book.id} className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <h2 className="card-title">{book.volumeInfo.title}</h2>
                      <p>{book.volumeInfo.authors?.join(', ')}</p>
                      <p>{book.volumeInfo.categories?.join(', ')}</p>
                      <div className="card-actions justify-end">
                        <button
                          className="btn btn-primary"
                          onClick={() => addToReadingList(book)}
                        >
                          Add to Reading List
                        </button>
                      </div>
                    </div>
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
