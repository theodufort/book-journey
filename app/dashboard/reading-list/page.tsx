"use client";
import { useEffect, useState } from "react";
import HeaderDashboard from "@/components/DashboardHeader";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { Volume } from "@/interfaces/GoogleAPI";
import { ReadingListItem } from "@/interfaces/ReadingList";
import CollapsibleSection from "@/components/CollapsibleSection";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import PointsSection from "@/components/PointsSection";
import RecentActivitySection from "@/components/RecentActivitySection";
import { Database, Json } from "@/types/supabase";
import { checkBookExists } from "@/libs/supabase-helpers";

export default function ReadingList() {
  const supabase = createClientComponentClient<Database>();
  const [readingList, setReadingList] = useState<ReadingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    "To Read": true,
    Reading: true,
    Finished: true,
  });

  async function updateBookProgress(bookId: string, status: string) {
    if (!user) return;

    try {
      // Check if the book is already finished
      const { data: existingBook, error: fetchError } = await supabase
        .from("reading_list")
        .select("status")
        .eq("user_id", user.id)
        .eq("book_id", bookId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from("reading_list")
        .update({ status })
        .eq("user_id", user.id)
        .eq("book_id", bookId);

      if (updateError) throw updateError;

      // Only award points if the book wasn't previously finished and is now being marked as finished
      if (status === "Finished" && existingBook?.status !== "Finished") {
        const { error: pointsError } = await supabase.rpc("increment_points", {
          user_id: user.id,
          points_to_add: 10 // Adjust this value as needed
        });

        if (pointsError) throw pointsError;
      }

      setReadingList((prevList) =>
        prevList.map((book) =>
          book.id === bookId ? { ...book, status } : book
        )
      );
    } catch (error) {
      console.error("Error updating book progress:", error);
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        await fetchReadingList(data.user.id);
      } else {
        console.log("User not authenticated");
      }
    };
    getUser();
  }, [supabase]);

  async function fetchReadingList(userId: string) {
    setLoading(true);
    try {
      const { data: booksData, error: booksError } = await supabase
        .from("reading_list")
        .select(
          `
          book_id::text, 
          status
        `
        )
        .eq("user_id", userId);

      if (booksError) {
        console.error("Error fetching reading list:", booksError);
        setReadingList([]);
      } else {
        // Fetch book details from our API route
        const bookDetails = await Promise.all(
          booksData.map(async (item) => {
            const cache = await checkBookExists(item.book_id);
            if (cache == null) {
              try {
                const response = await fetch(`/api/books/${item.book_id}`);
                if (!response.ok) {
                  throw new Error(
                    `Failed to fetch book details for ${item.book_id}`
                  );
                }
                const bookData: Volume = await response.json();
                const { data, error } = await supabase.from("books").insert({
                  isbn_13: item.book_id,
                  data: bookData as unknown as Json,
                });
                return {
                  data: bookData,
                  book_id: item.book_id,
                  status: item.status,
                };
              } catch (error) {
                console.error(error);
                return null;
              }
            } else {
              return {
                data: cache,
                book_id: item.book_id,
                status: item.status,
              };
            }
          })
        );
        // Filter out any null results from failed fetches
        const validBookDetails = bookDetails.filter((book) => book != null);
        setReadingList(validBookDetails);
        setLoading(false);
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
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  }

  const toReadBooks = readingList.filter((item) => item.status === "To Read");
  const readingBooks = readingList.filter((item) => item.status === "Reading");
  const finishedBooks = readingList.filter(
    (item) => item.status === "Finished"
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

        <h1 className="text-3xl md:text-4xl font-extrabold">
          My Reading List
          <button
            className="btn btn-primary float-end"
            onClick={() => router.push("/dashboard/reading-list/add")}
          >
            Add to Reading List
          </button>
        </h1>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PointsSection />
            <RecentActivitySection />
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
                    status="To Read"
                    title={`To Read (${toReadBooks.length})`}
                    isExpanded={expandedSections["To Read"]}
                    onToggle={() => toggleSection("To Read")}
                    books={toReadBooks.map((item) => item.data)}
                    onUpdate={() => fetchReadingList(user.id)}
                  />
                  <CollapsibleSection
                    status="Reading"
                    title={`Currently Reading (${readingBooks.length})`}
                    isExpanded={expandedSections["Reading"]}
                    onToggle={() => toggleSection("Reading")}
                    books={readingBooks.map((item) => item.data)}
                    onUpdate={() => fetchReadingList(user.id)}
                  />
                  <CollapsibleSection
                    status="Finished"
                    title={`Finished (${finishedBooks.length})`}
                    isExpanded={expandedSections["Finished"]}
                    onToggle={() => toggleSection("Finished")}
                    books={finishedBooks.map((item) => item.data)}
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
