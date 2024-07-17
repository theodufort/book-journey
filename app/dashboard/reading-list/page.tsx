"use client";
import { useEffect, useState } from "react";
import HeaderDashboard from "@/components/DashboardHeader";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { ReadingListItem } from "@/interfaces/Dashboard";
import CollapsibleSection from "@/components/CollapsibleSection";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ReadingList() {
  const supabase = createClientComponentClient();
  const [readingList, setReadingList] = useState<ReadingListItem[]>([]);
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
        fetchReadingList(data.user.id);
      } else {
        console.log("User not authenticated");
      }
    };
    getUser();
  }, [supabase]);

  async function fetchReadingList(userId: string) {
    console.log(userId);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reading_list")
        .select(`
          id, 
          book_isbn, 
          status,
          books (
            title,
            author
          )
        `)
        .eq("user_id", userId);

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned, set an empty array
          setReadingList([]);
        } else {
          console.error("Error fetching reading list:", error);
        }
      } else {
        setReadingList(data || []);
      }
    } catch (error) {
      console.error("Unexpected error fetching reading list:", error);
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

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-6xl mx-auto space-y-8">
        <HeaderDashboard />

        <h1 className="text-3xl md:text-4xl font-extrabold">My Reading List</h1>

        {loading ? (
          <div className="text-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : readingList.length === 0 ? (
          <div className="text-center p-8 bg-base-200 rounded-box">
            <h2 className="text-2xl font-bold mb-4">
              Your reading list is empty
            </h2>
            <p className="mb-4">
              Start adding books to your reading list to keep track of what you
              want to read!
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
          <div className="space-y-8">
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
          </div>
        )}
      </section>
    </main>
  );
}
