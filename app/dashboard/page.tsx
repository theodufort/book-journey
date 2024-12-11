"use client";
import HeaderDashboard from "@/components/DashboardHeader";
import HabitCard from "@/components/HabitCard";
import HabitConsistencyGraph from "@/components/HabitConsistencyGraph";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useNextStep } from "nextstepjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const supabase = createClientComponentClient<Database>();

export default function Dashboard() {
  const t = useTranslations("Dashboard");
  const [currentlyReading, setCurrentlyReading] = useState([]);
  const [stats, setStats] = useState<{
    books_read: number;
    pages_read: number;
    reading_time_minutes: number;
  } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboard, setShowOnboard] = useState(false);
  const [habitRefreshTrigger, setHabitRefreshTrigger] = useState(0);
  const router = useRouter();

  const { startNextStep, currentTour } = useNextStep();
  console.log(currentTour);
  const handleStartTour = () => {
    startNextStep("dashboardTour");
  };

  const logUserActivity = async () => {
    if (!user) return;

    // Fetch the latest active_at entry for this user
    const { data, error } = await supabase
      .from("user_connection_activity")
      .select("active_at")
      .eq("user_id", user.id)
      .order("active_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching user activity:", error);
      return;
    }

    const now: any = new Date();
    let shouldInsert = true;

    if (data && data.length > 0) {
      const lastActiveAt: any = new Date(data[0].active_at);
      const timeDifference = now - lastActiveAt;

      // Check if more than 1 hour has passed
      if (timeDifference <= 60 * 60 * 1000) {
        shouldInsert = false;
      }
    }

    if (shouldInsert) {
      const { error: insertError } = await supabase
        .from("user_connection_activity")
        .insert([{ user_id: user.id, active_at: now.toISOString() }]);

      if (insertError) {
        console.error("Error inserting user activity:", insertError);
      }
    }
  };

  const handleHabitChange = useCallback(() => {
    setHabitRefreshTrigger((prev) => prev + 1);
  }, []);

  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };

  useEffect(() => {
    getUser();
  }, []); // Empty dependency array ensures this runs once

  const hasLoggedActivity = useRef(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();

      if (!hasLoggedActivity.current) {
        logUserActivity();
        hasLoggedActivity.current = true;
      }
      handleStartTour();
    } else {
      setLoading(false);
    }
  }, [user]);

  async function fetchDashboardData() {
    try {
      const {
        data: { onboarded },
        error,
      } = await supabase
        .from("user_preferences")
        .select("onboarded")
        .eq("user_id", user.id)
        .single();

      if (onboarded != true) {
        setShowOnboard(true);
      }
    } catch {
      console.log("Error checking onboarded status.");
    }
    try {
      const { data: readingListResponse } = await supabase
        .from("reading_list")
        .select("id,book_id,status")
        .eq("user_id", user.id)
        .eq("status", "Reading")
        .limit(5);

      // Fetch book details from our API route
      const bookDetails = await Promise.all(
        readingListResponse.map(async (item) => {
          try {
            const response = await fetch(`/api/books/${item.book_id}`);
            if (!response.ok) {
              throw new Error(
                `Failed to fetch book details for ${item.book_id}`
              );
            }
            const bookData = await response.json();
            return {
              ...bookData,
              book_id: item.book_id,
              status: item.status,
            };
          } catch (error) {
            console.error(error);
            return null;
          }
        })
      );

      const statsResponse = await supabase
        .from("reading_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // Filter out any null results from failed fetches
      const validBookDetails = bookDetails.filter((book) => book !== null);
      setCurrentlyReading(validBookDetails);

      if (statsResponse.error) {
        console.error("Error fetching reading stats:", statsResponse.error);
      }

      const { count } = await supabase
        .from("reading_list")
        .select("*", { count: "exact", head: true })
        .eq("status", "Finished")
        .eq("user_id", user.id);

      // Set default stats
      setStats({
        books_read: count || 0,
        pages_read: statsResponse.data?.pages_read || 0,
        reading_time_minutes: statsResponse.data?.pages_read * 1 || 0,
      });
    } catch (error) {
      console.error("Unexpected error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }
  if (loading) {
    return (
      <main className="min-h-screen p-8 pb-24 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-6xl mx-auto space-y-8">
        <div className="sticky top-0 z-50 bg-base-100">
          <HeaderDashboard />
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold">{t("title")}</h1>

        {/* Reading Stats */}
        <div className="card bg-base-200 shadow-xl" id="dashboard_stats">
          <div className="card-body">
            <h2 className="card-title text-xl md:text-2xl font-bold">
              {t("subtitle1")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <p className="text-2xl">📚</p>
                </div>
                <div className="stat-title">{t("stat_title1")}</div>
                <div className="stat-value">{stats?.books_read || 0}</div>
              </div>
              <div className="stat">
                <div className="stat-figure text-primary">
                  <p className="text-2xl">📖</p>
                </div>
                <div className="stat-title">{t("stat_title2")}</div>
                <div className="stat-value">{stats?.pages_read || 0}</div>
              </div>
              <div className="stat">
                <div className="stat-figure text-primary">
                  <p className="text-2xl">⏳</p>
                </div>
                <div className="stat-title">{t("stat_title3")}</div>
                <div className="stat-value">
                  {Math.floor((stats?.reading_time_minutes || 0) / 60)}{" "}
                  {t("hour_unit")}
                </div>
                <div className="stat-desc">
                  {(stats?.reading_time_minutes || 0) % 60} {t("minute_unit")}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full" id="dashboard_booknook">
          <button
            className="btn btn-primary w-full"
            onClick={() => router.push("dashboard/book-nook")}
          >
            {t("start_reading")}
          </button>
        </div>
        {/* Habit Card and Habit Consistency Graph */}
        <div
          className="grid md:grid-cols-4 grid-cols-1 gap-4 items-stretch"
          id="dashboard_habit"
        >
          {/* Habit Card (1/4 width) */}
          <div className="md:col-span-1">
            <div className="h-full flex">
              <HabitCard onHabitChange={handleHabitChange} />
            </div>
          </div>

          {/* Habit Consistency Graph (3/4 width) */}
          <div className="md:col-span-3">
            <div className="h-full">
              <HabitConsistencyGraph
                initialDays={7}
                key={habitRefreshTrigger}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
