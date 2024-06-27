"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/libs/supabaseClient";
import HeaderDashboard from "@/components/DashboardHeader";

export default function Dashboard() {
  const [currentlyReading, setCurrentlyReading] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    const user = await supabase.auth.getUser();
    if (user.data.user) {
      const { data: readingList, error: readingListError } = await supabase
        .from("reading_list")
        .select("*, books(*)")
        .eq("user_id", user.data.user.id)
        .eq("status", "Reading")
        .limit(5);

      if (readingListError)
        console.error("Error fetching reading list:", readingListError);
      else setCurrentlyReading(readingList);

      const { data: readingStats, error: statsError } = await supabase
        .from("reading_stats")
        .select("*")
        .eq("user_id", user.data.user.id)
        .single();

      if (statsError)
        console.error("Error fetching reading stats:", statsError);
      else setStats(readingStats);
    }
  }

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-6xl mx-auto space-y-8">
        <HeaderDashboard />

        <h1 className="text-3xl md:text-4xl font-extrabold">My Dashboard</h1>

        {/* Reading Stats */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Reading Stats</h2>
          {stats && (
            <div>
              <p>Books Read: {stats.books_read}</p>
              <p>Pages Read: {stats.pages_read}</p>
              <p>Reading Time: {stats.reading_time_minutes} minutes</p>
            </div>
          )}
        </div>

        {/* Current Reading List Preview */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Currently Reading</h2>
          {currentlyReading.map((item) => (
            <div key={item.id}>
              <p>
                {item.books.title} by {item.books.author}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
