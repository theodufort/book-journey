"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/libs/supabaseClient";
import HeaderDashboard from "@/components/DashboardHeader";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  async function fetchRecommendations() {
    const user = await supabase.auth.getUser();
    if (user.data.user) {
      const { data, error } = await supabase
        .from("recommendations")
        .select("*, books(*)")
        .eq("user_id", user.data.user.id);

      if (error) console.error("Error fetching recommendations:", error);
      else setRecommendations(data);
    }
  }

  async function addToReadingList(bookId) {
    const user = await supabase.auth.getUser();
    if (user.data.user) {
      const { error } = await supabase.from("reading_list").insert({
        user_id: user.data.user.id,
        book_id: bookId,
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((recommendation) => (
            <div key={recommendation.id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">{recommendation.books.title}</h2>
                <p>{recommendation.books.author}</p>
                <p>{recommendation.books.category}</p>
                <p>Reason: {recommendation.reason}</p>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-primary"
                    onClick={() => addToReadingList(recommendation.book_id)}
                  >
                    Add to Reading List
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
