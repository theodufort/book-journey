"use client";
import CollapsibleSection from "@/components/CollapsibleSection";
import HeaderDashboard from "@/components/DashboardHeader";
import { Volume } from "@/interfaces/GoogleAPI";
import { ReadingListItem } from "@/interfaces/ReadingList";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useNextStep } from "nextstepjs";
import { useEffect, useState } from "react";

export default function ReadingList() {
  const { startNextStep, currentTour } = useNextStep();
  console.log(currentTour);
  const handleStartTour = () => {
    startNextStep("readinglistTour");
  };
  const t = useTranslations("ReadingList");
  const supabase = createClientComponentClient<Database>();
  const [readingList, setReadingList] = useState<ReadingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    "To Read": false,
    Reading: true,
    Finished: false,
    DNF: false,
  });

  async function updateBookProgress(bookId: string, status: string) {
    //Currently needs fixing as always creating user_activity of type book_added
    if (!user) return;

    try {
      //   // Check if the book is already finished
      //   const { data: existingBook, error: fetchError } = await supabase
      //     .from("reading_list")
      //     .select("status")
      //     .eq("user_id", user.id)
      //     .eq("book_id", bookId)
      //     .single();

      //   if (fetchError) throw fetchError;

      //   const { error: updateError } = await supabase
      //     .from("reading_list")
      //     .update({ status })
      //     .eq("user_id", user.id)
      //     .eq("book_id", bookId);

      //   if (updateError) throw updateError;

      //   // Add activity record
      //   if (existingBook?.status !== status) {
      //     let activityType;
      //     let details: { book_id: string; title?: string; new_status: string };

      //     if (existingBook?.status === "To Read" && status === "Reading") {
      //       activityType = "book_started";
      //     } else if (status === "Finished") {
      //       activityType = "book_finished";
      //     } else {
      //       activityType = "book_added";
      //     }

      //     // Fetch book details to get the title
      //     const bookDetails = readingList.find((book) => book.book_id === bookId);
      //     const bookTitle = bookDetails?.data.volumeInfo.title || "Unknown Title";

      //     details = {
      //       book_id: bookId,
      //       title: bookTitle,
      //       new_status: status,
      //     };

      //     const { error: activityError } = await supabase
      //       .from("user_activity")
      //       .insert({
      //         user_id: user.id,
      //         activity_type: activityType,
      //         details: details,
      //         created_at: new Date().toISOString(),
      //       });

      //     if (activityError) throw activityError;
      //   }

      //   // Only award points if the book wasn't previously finished and is now being marked as finished
      //   if (status === "Finished" && existingBook?.status !== "Finished") {
      //     const pointsToAward = 10; // Adjust this value as needed

      //     // Update user_points
      //     const { data: userPoints, error: userPointsError } = await supabase
      //       .from("user_points")
      //       .select("points, points_earned")
      //       .eq("user_id", user.id)
      //       .single();

      //     if (userPointsError) throw userPointsError;

      //     const newPoints = (userPoints?.points || 0) + pointsToAward;
      //     const newPointsEarned =
      //       (userPoints?.points_earned || 0) + pointsToAward;

      //     const { error: updatePointsError } = await supabase
      //       .from("user_points")
      //       .upsert({
      //         user_id: user.id,
      //         points: newPoints,
      //         points_earned: newPointsEarned,
      //       });

      //     if (updatePointsError) throw updatePointsError;

      //     // Record the point transaction
      //     const { error: transactionError } = await supabase
      //       .from("point_transactions")
      //       .insert({
      //         user_id: user.id,
      //         points: pointsToAward,
      //         type: "earned",
      //         description: "Finished reading a book",
      //       });

      //     if (transactionError) throw transactionError;

      //     // Add points_earned activity
      //     const { error: pointsActivityError } = await supabase
      //       .from("user_activity")
      //       .insert({
      //         user_id: user.id,
      //         activity_type: "points_earned",
      //         details: {
      //           points: pointsToAward,
      //           reason: "Finished reading a book",
      //         },
      //         created_at: new Date().toISOString(),
      //       });

      //     if (pointsActivityError) throw pointsActivityError;
      //   }

      // Update the reading list state
      setReadingList((prevList) => {
        return prevList.map((book) =>
          book.book_id === bookId ? { ...book, status } : book
        );
      });

      // Refetch the reading list to ensure all data is up to date
      await fetchReadingList(user.id);
    } catch (error) {
      console.error("Error updating book progress:", error);
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        handleStartTour();
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
        // Only fetch details for first page of books initially
        const ITEMS_PER_PAGE = 5;
        const firstPageBooks = booksData.slice(0, ITEMS_PER_PAGE);
        const otherBooks = booksData.slice(ITEMS_PER_PAGE);

        // Fetch detailed data only for first page
        const firstPageDetails = await Promise.all(
          firstPageBooks.map(async (item: any) => {
            try {
              const response = await fetch(`/api/books/${item.book_id}/v3`);
              if (!response.ok) {
                throw new Error(
                  `Failed to fetch book details for ${item.book_id}`
                );
              }
              const bookData: Volume = await response.json();
              return {
                data: bookData,
                book_id: item.book_id,
                status: item.status,
              };
            } catch (error) {
              console.error(error);
              return null;
            }
          })
        );

        // Create placeholder objects for other books
        const otherBooksPlaceholders = otherBooks.map((item: any) => ({
          data: {
            volumeInfo: { title: "Loading...", authors: ["Loading..."] },
          },
          book_id: item.book_id,
          status: item.status,
        }));

        // Combine first page details with placeholders and filter out nulls
        const bookDetails = [...firstPageDetails, ...otherBooksPlaceholders];
        const validBookDetails = bookDetails.filter((book) => book != null);
        setReadingList(validBookDetails as any);
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
  const dnfBooks = readingList.filter((item) => item.status === "DNF");

  const toggleSection = (section: any) => {
    setExpandedSections((prev: any) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) {
    return (
      <main className="min-h-screen p-8 pb-24 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-8 pb-16">
      <section className="max-w-6xl mx-auto space-y-4 sm:space-y-8">
        <div className="sticky top-0 z-50 bg-base-100">
          <HeaderDashboard />
        </div>
        <div className="flex pt-4">
          <h1 className="text-2xl md:text-4xl font-extrabold  my-auto">
            {t("title")}
          </h1>
          <button
            id="readinglist-addbook"
            className="btn btn-primary float-end ml-auto mr-0 my-auto"
            onClick={() => router.push("/dashboard/reading-list/add")}
          >
            <span className="hidden md:block">{t("add_to_list")}</span>
            <span className="block md:hidden text-2xl">+</span>
          </button>
        </div>
        <div className="space-y-8">
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PointsSection />
            <RecentActivitySection />
          </div> */}
          {readingList.length === 0 ? (
            <div className="text-center p-8 bg-base-200 rounded-box">
              <h2 className="text-2xl font-bold mb-4">{t("empty_list")}</h2>
              <p className="mb-4">{t("empty_list_message")}</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  router.push("/dashboard/recommendations");
                }}
              >
                {t("find_books")}
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
                    title={`To Read (${toReadBooks.length}📘)`}
                    isExpanded={expandedSections["To Read"]}
                    onToggle={() => toggleSection("To Read")}
                    books={toReadBooks}
                    onUpdate={updateBookProgress}
                    setReadingList={setReadingList}
                  />
                  <CollapsibleSection
                    status="Reading"
                    title={`Currently Reading (${readingBooks.length}📘)`}
                    isExpanded={expandedSections["Reading"]}
                    onToggle={() => toggleSection("Reading")}
                    books={readingBooks}
                    onUpdate={updateBookProgress}
                    setReadingList={setReadingList}
                  />
                  <CollapsibleSection
                    status="Finished"
                    title={`Finished (${finishedBooks.length}📘)`}
                    isExpanded={expandedSections["Finished"]}
                    onToggle={() => toggleSection("Finished")}
                    books={finishedBooks}
                    onUpdate={updateBookProgress}
                    setReadingList={setReadingList}
                  />
                  <CollapsibleSection
                    status="DNF"
                    title={`Did Not Finish (${dnfBooks.length}📘)`}
                    isExpanded={expandedSections["DNF"]}
                    onToggle={() => toggleSection("DNF")}
                    books={dnfBooks}
                    onUpdate={updateBookProgress}
                    setReadingList={setReadingList}
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

// Add this at the end of the file
