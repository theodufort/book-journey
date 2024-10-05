"use client";
import HeaderDashboard from "@/components/DashboardHeader";
import OnboardingPopup from "@/components/OnboardingPopup";
import StreakRewardSystem from "@/components/StreakRewardSystem";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const t = useTranslations("Dashboard");
  const supabase = createClientComponentClient<Database>();
  const [currentlyReading, setCurrentlyReading] = useState([]);
  const [stats, setStats] = useState<{
    books_read: number;
    pages_read: number;
    reading_time_minutes: number;
  } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboard, setShowOnboard] = useState(false);
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
    try {
      const {
        data: { onboarded },
        error,
      } = await supabase
        .from("user_preferences")
        .select("onboarded")
        .eq("user_id", user.id)
        .single();
      console.log("Onboarded: " + onboarded);
      console.log(error);
      if (onboarded != true) {
        setShowOnboard(true);
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
        <div className="z-50">
          <HeaderDashboard />
        </div>
        {user && showOnboard ? (
          <OnboardingPopup
            isOpen={true}
            onClose={function (): void {
              setShowOnboard(false);
            }}
            userId={user.id}
          />
        ) : null}
        <h1 className="text-3xl md:text-4xl font-extrabold">{t("title")}</h1>

        {/* Reading Stats */}
        <div className="card bg-base-200 shadow-xl ">
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
        <div className="card bg-base-200 shadow-xl ">
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
                {t("points_catch")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
