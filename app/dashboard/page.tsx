"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import HeaderDashboard from "@/components/DashboardHeader";
import PointsSection from "@/components/PointsSection";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function Dashboard() {
  const supabase = createClientComponentClient();
  const [currentlyReading, setCurrentlyReading] = useState([]);
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
    if (user) fetchDashboardData();
  }, [supabase]);

  async function fetchDashboardData() {
    const { data: readingList, error: readingListError } = await supabase
      .from("reading_list")
      .select("*, books(*)")
      .eq("user_id", user.id)
      .eq("status", "Reading")
      .limit(5);

    if (readingListError)
      console.error("Error fetching reading list:", readingListError);
    else setCurrentlyReading(readingList);

    const { data: readingStats, error: statsError } = await supabase
      .from("reading_stats")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (statsError) console.error("Error fetching reading stats:", statsError);
    else setStats(readingStats);
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
        <PointsSection userId={user.id} />
      </section>
    </main>
  );
}
