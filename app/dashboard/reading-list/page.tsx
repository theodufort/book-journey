"use client";
import CollapsibleSection from "@/components/CollapsibleSection";
import HeaderDashboard from "@/components/DashboardHeader";
import { Volume } from "@/interfaces/GoogleAPI";
import { ReadingListItem } from "@/interfaces/ReadingList";
import { getUser } from "@/libs/supabase/queries";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useNextStep } from "nextstepjs";
import { useEffect, useState } from "react";

const ITEMS_PER_PAGE = 5; // number of items to fetch per page

export default function ReadingList() {
  const { startNextStep } = useNextStep();
  const t = useTranslations("ReadingList");
  const supabase = createClientComponentClient<Database>();
  const [readingList, setReadingList] = useState<ReadingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // Track current pages for each status
  const [currentPages, setCurrentPages] = useState<{
    [key: string]: number;
  }>({
    "To Read": 1,
    Reading: 1,
    Finished: 1,
    DNF: 1,
  });

  // Track total counts for each status
  const [statusCounts, setStatusCounts] = useState<{
    [key: string]: number;
  }>({
    "To Read": 0,
    Reading: 0,
    Finished: 0,
    DNF: 0,
  });

  const [expandedSections, setExpandedSections] = useState({
    "To Read": false,
    Reading: true,
    Finished: false,
    DNF: false,
  });

  async function updateBookProgress(bookId: string, status: string) {
    if (!user) return;
    // ...existing logic to update book status...
    setReadingList((prevList) =>
      prevList.map((book) =>
        book.book_id === bookId ? { ...book, status } : book
      )
    );
  }

  useEffect(() => {
    const getUserCall = async () => {
      const user = await getUser(supabase);
      if (user) {
        setUser(user);
        // Fetch first page of each status on load
        await fetchAllStatuses(user.id);
        startNextStep("readinglistTour");
      } else {
        console.log("User not authenticated");
      }
    };
    getUserCall();
  }, [supabase]);

  async function fetchAllStatuses(userId: string) {
    setLoading(true);
    try {
      const statuses = ["To Read", "Reading", "Finished", "DNF"];
      const allItems: ReadingListItem[] = [];

      for (const status of statuses) {
        const page = currentPages[status] || 1;
        const { items, totalCount } = await fetchBooksByStatus(
          userId,
          status,
          page
        );
        allItems.push(...items);

        // Store the total count of books for this status
        setStatusCounts((prev) => ({
          ...prev,
          [status]: totalCount,
        }));
      }

      setReadingList(allItems);
    } catch (error) {
      console.error("Unexpected error:", error);
      setReadingList([]);
    } finally {
      setLoading(false);
    }
  }

  // Fetch books for a specific status and page, also get total count
  async function fetchBooksByStatus(
    userId: string,
    status: string,
    page: number
  ): Promise<{ items: ReadingListItem[]; totalCount: number }> {
    const offset = (page - 1) * ITEMS_PER_PAGE;

    // Use count: "exact" to retrieve the total number of rows matching the query
    const {
      data: booksData,
      count,
      error: booksError,
    } = await supabase
      .from("reading_list")
      .select("book_id::text, status", { count: "exact" })
      .eq("user_id", userId)
      .eq("status", status)
      .range(offset, offset + ITEMS_PER_PAGE - 1);

    if (booksError) {
      console.error(
        `Error fetching reading list for status ${status}:`,
        booksError
      );
      return { items: [], totalCount: 0 };
    }

    const fetchedItems: any = await Promise.all(
      (booksData || []).map(async (item) => {
        try {
          const response = await fetch(`/api/books/${item.book_id}/v3`);
          if (!response.ok) {
            throw new Error(`Failed to fetch book details for ${item.book_id}`);
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

    return {
      items: fetchedItems.filter(
        (book: any) => book !== null
      ) as ReadingListItem[],
      totalCount: count || 0,
    };
  }

  // Handle page changes from CollapsibleSection
  const handlePageChange = async (status: string, newPage: number) => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch the new page of items for this particular status
      const { items, totalCount } = await fetchBooksByStatus(
        user.id,
        status,
        newPage
      );

      // Update readingList, removing old books of this status and adding the new page
      setReadingList((prev) => {
        const filtered = prev.filter((item) => item.status !== status);
        return [...filtered, ...items];
      });

      // Update current page for that status
      setCurrentPages((prev) => ({ ...prev, [status]: newPage }));

      // Update total count (in case it changed, though it normally shouldn't)
      setStatusCounts((prev) => ({
        ...prev,
        [status]: totalCount,
      }));
    } catch (err) {
      console.error("Error changing page:", err);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading && readingList.length === 0) {
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
              {loading && readingList.length === 0 ? (
                <div className="flex justify-center items-center">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : (
                <>
                  <CollapsibleSection
                    status="To Read"
                    title={`To Read (${statusCounts["To Read"]}📘)`}
                    isExpanded={expandedSections["To Read"]}
                    onToggle={() => toggleSection("To Read")}
                    books={toReadBooks}
                    onUpdate={updateBookProgress}
                    setReadingList={setReadingList}
                    currentPage={currentPages["To Read"]}
                    onPageChange={(newPage) =>
                      handlePageChange("To Read", newPage)
                    }
                    itemsPerPage={ITEMS_PER_PAGE}
                  />
                  <CollapsibleSection
                    status="Reading"
                    title={`Currently Reading (${statusCounts["Reading"]}📘)`}
                    isExpanded={expandedSections["Reading"]}
                    onToggle={() => toggleSection("Reading")}
                    books={readingBooks}
                    onUpdate={updateBookProgress}
                    setReadingList={setReadingList}
                    currentPage={currentPages["Reading"]}
                    onPageChange={(newPage) =>
                      handlePageChange("Reading", newPage)
                    }
                    itemsPerPage={ITEMS_PER_PAGE}
                  />
                  <CollapsibleSection
                    status="Finished"
                    title={`Finished (${statusCounts["Finished"]}📘)`}
                    isExpanded={expandedSections["Finished"]}
                    onToggle={() => toggleSection("Finished")}
                    books={finishedBooks}
                    onUpdate={updateBookProgress}
                    setReadingList={setReadingList}
                    currentPage={currentPages["Finished"]}
                    onPageChange={(newPage) =>
                      handlePageChange("Finished", newPage)
                    }
                    itemsPerPage={ITEMS_PER_PAGE}
                  />
                  <CollapsibleSection
                    status="DNF"
                    title={`Did Not Finish (${statusCounts["DNF"]}📘)`}
                    isExpanded={expandedSections["DNF"]}
                    onToggle={() => toggleSection("DNF")}
                    books={dnfBooks}
                    onUpdate={updateBookProgress}
                    setReadingList={setReadingList}
                    currentPage={currentPages["DNF"]}
                    onPageChange={(newPage) => handlePageChange("DNF", newPage)}
                    itemsPerPage={ITEMS_PER_PAGE}
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
