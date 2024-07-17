"use client";
import { useEffect, useState } from "react";
import HeaderDashboard from "@/components/DashboardHeader";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { Volume } from "@/interfaces/GoogleAPI";
import CollapsibleSection from "@/components/CollapsibleSection";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import PointsSection from "@/components/PointsSection";
import RecentActivitySection from "@/components/RecentActivitySection";
import { Database } from "@/types/supabase";

export default function ReadingList() {
  const supabase = createClientComponentClient<Database>();
  const [readingList, setReadingList] = useState<Volume[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    "To Read": true,
    Reading: true,
    Finished: true,
  });

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        await fetchReadingList(data.user.id);
      } else {
        console.log("User not authenticated");
        setLoading(false);
      }
    };
    getUser();
  }, [supabase]);

  async function fetchReadingList(userId: string) {
    console.log(userId);
    setLoading(true);
    try {
      const { data: readingListData, error: readingListError } = await supabase
        .from("reading_list")
        .select(
          `
          id, 
          book_id, 
          status
        `
        )
        .eq("user_id", userId);

      if (readingListError) {
        console.error("Error fetching reading list:", readingListError);
        setReadingList([]);
      } else {
        // Fetch book details from our API route
        const bookDetails = await Promise.all(
          readingListData.map(async (item) => {
            try {
              const response = await fetch(`/api/books/${item.book_id}`);
              if (!response.ok) {
                throw new Error(`Failed to fetch book details for ${item.book_id}`);
              }
              const bookData = await response.json();
              return { ...bookData, status: item.status };
            } catch (error) {
              console.error(error);
              return null;
            }
          })
        );
        // Filter out any null results from failed fetches
        const validBookDetails = bookDetails.filter(book => book !== null);
        setReadingList(validBookDetails);
      }

      // Fetch reading stats separately
      const { data: statsData, error: statsError } = await supabase
        .from("reading_stats")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (statsError) {
        if (statsError.code === "PGRST116") {
          console.log("No reading stats found for the user");
          // Handle the case where no stats exist (e.g., create default stats)
        } else {
          console.error("Error fetching reading stats:", statsError);
        }
      } else {
        console.log("Reading stats:", statsData);
        // Handle the stats data as needed
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  }

  const toReadBooks = readingList.filter(
    (item: any) => item.status === "To Read"
  );
  const readingBooks = readingList.filter(
    (item: any) => item.status === "Reading"
  );
  const finishedBooks = readingList.filter(
    (item: any) => item.status === "Finished"
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

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
        <HeaderDashboard />

        <h1 className="text-3xl md:text-4xl font-extrabold">My Reading List</h1>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PointsSection />
            <RecentActivitySection userId={user?.id} />
          </div>
          {readingList.length === 0 ? (
            <div className="text-center p-8 bg-base-200 rounded-box">
              <h2 className="text-2xl font-bold mb-4">
                Your reading list is empty
              </h2>
              <p className="mb-4">
                Start adding books to your reading list to keep track of what
                you want to read!
              </p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  router.push("/dashboard/recommendations");
                }}
              >
                Find Books to Read
              </button>
            </div>
          ) : (
            <>
              {loading ? (
                <div className="flex justify-center items-center">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : (
                <>
                  <CollapsibleSection
                    title={`To Read (${toReadBooks.length})`}
                    isExpanded={expandedSections["To Read"]}
                    onToggle={() => toggleSection("To Read")}
                    books={toReadBooks}
                    onUpdate={() => fetchReadingList(user.id)}
                  />
                  <CollapsibleSection
                    title={`Currently Reading (${readingBooks.length})`}
                    isExpanded={expandedSections["Reading"]}
                    onToggle={() => toggleSection("Reading")}
                    books={readingBooks}
                    onUpdate={() => fetchReadingList(user.id)}
                  />
                  <CollapsibleSection
                    title={`Finished (${finishedBooks.length})`}
                    isExpanded={expandedSections["Finished"]}
                    onToggle={() => toggleSection("Finished")}
                    books={finishedBooks}
                    onUpdate={() => fetchReadingList(user.id)}
                  />
                </>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
