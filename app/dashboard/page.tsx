"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import HeaderDashboard from "@/components/DashboardHeader";
import Image from "next/image";
import PointsSection from "@/components/PointsSection";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import OnboardingPopup from "@/components/OnboardingPopup";
import { BookAvatarNoDetails } from "@/components/BookAvatarNoDetails";
import { DashboardFooter } from "@/components/DashboardFooter";
import ContributionGraph from "@/components/ContributionGraph";
import StreakRewardSystem from "@/components/StreakRewardSystem";

export default function Dashboard() {
  const supabase = createClientComponentClient<Database>();
  const [currentlyReading, setCurrentlyReading] = useState([]);
  const [stats, setStats] = useState<{
    books_read: number;
    pages_read: number;
    reading_time_minutes: number;
  } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboard, setShowUnboard] = useState(false);
  const router = useRouter();
  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };
  useEffect(() => {
    getUser();
  }, [supabase]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const {
        data: { onboarded },
        error,
      } = await supabase.from("user_preferences").select("onboarded").single();
      if (onboarded != true) {
        setShowUnboard(false);
      }
    } catch {
      console.log("error checking onboarded");
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

      const { count, error } = await supabase
        .from("reading_list")
        .select("*", { count: "exact", head: true })
        .eq("status", "Finished")
        .eq("user_id", user.id);
      // Always set default stats, whether there's an error or no data
      setStats({
        books_read: count || 0,
        pages_read: statsResponse.data?.pages_read || 0,
        reading_time_minutes: statsResponse.data?.reading_time_minutes || 0,
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
        <div className="z-50">
          <HeaderDashboard />
        </div>
        {user && showOnboard ? (
          <OnboardingPopup
            isOpen={true}
            onClose={function (): void {
              setShowUnboard(false);
            }}
            userId={user.id}
          />
        ) : null}
        <h1 className="text-3xl md:text-4xl font-extrabold">My Dashboard</h1>

        {/* Reading Stats */}
        <div className="card bg-base-200 shadow-xl -z-10">
          <div className="card-body">
            <h2 className="card-title text-xl md:text-2xl font-bold">
              Reading Stats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block w-8 h-8 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    ></path>
                  </svg>
                </div>
                <div className="stat-title">Books Read</div>
                <div className="stat-value">{stats?.books_read || 0}</div>
              </div>
              <div className="stat">
                <div className="stat-figure text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block w-8 h-8 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    ></path>
                  </svg>
                </div>
                <div className="stat-title">Pages Read</div>
                <div className="stat-value">{stats?.pages_read || 0}</div>
              </div>
              <div className="stat">
                <div className="stat-figure text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block w-8 h-8 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <div className="stat-title">Reading Time</div>
                <div className="stat-value">
                  {Math.floor((stats?.reading_time_minutes || 0) / 60)} hours
                </div>
                <div className="stat-desc">
                  {(stats?.reading_time_minutes || 0) % 60} minutes
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card bg-base-200 shadow-xl -z-10">
          <div className="card-body">
            {/* <h2 className="card-title text-xl md:text-2xl font-bold">
              Point Streak{" "}
              <Image src={"/coin.png"} height={25} width={25} alt="coin" />
            </h2> */}

            <div className="m-auto">
              <StreakRewardSystem
                onUpdate={() => {
                  getUser();
                }}
              />
              <p className="m-auto mt-5 block text-lg opacity-90 text-center">
                Come back daily to earn points.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
