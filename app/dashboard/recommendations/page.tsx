"use client";

import BookAvatar from "@/components/BookAvatar";
import HeaderDashboard from "@/components/DashboardHeader";
import { Volume } from "@/interfaces/GoogleAPI";
import { getUser } from "@/libs/supabase/queries";
import { Database } from "@/types/supabase";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { useTranslations } from "next-intl";
import { useNextStep } from "nextstepjs";
import { useEffect, useState } from "react";

export default function Recommendations() {
  const { startNextStep } = useNextStep();
  const t = useTranslations("BookRecommendations");
  const [isLoading, setIsLoading] = useState(true);
  const [booksLoaded, setBooksLoaded] = useState(false);
  const [bookSuggestions, setBookSuggestions] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUserCall = async () => {
      const user = await getUser(supabase);
      if (user) {
        setUser(user);
      } else {
        console.log("User not authenticated");
      }
    };
    getUserCall();
  }, [supabase]);
  useEffect(() => {
    fetchRecommendations();
  }, []);

  async function fetchRecommendations() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/recommendations/v2");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            data.error || "Unknown error"
          }`
        );
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data || data.length == 0) {
        throw new Error("Invalid recommendations data received");
      }
      const volumesWithImages = data.filter(
        (item: any) => item.volumeInfo.imageLinks
      );
      setBookSuggestions(volumesWithImages);
      startNextStep("recommendationsTour");
      setBooksLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error("Error fetching recommendations:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function addToReadingList(book: Volume) {
    if (user) {
      const { error } = await supabase.from("reading_list").upsert({
        user_id: user.id,
        book_id: book.id,
        status: "To Read",
      });

      if (error) console.error("Error adding book to reading list:", error);
      else {
        // Optionally, you could remove the book from recommendations here
        fetchRecommendations(); // Refresh the list
      }
    }
  }

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-6xl mx-auto space-y-8">
        <div className="sticky top-0 z-50 bg-base-100">
          <HeaderDashboard />
        </div>
        <div className="gap-2 flex">
          <h1 className="text-3xl md:text-4xl font-extrabold">{t("title")}</h1>
          <div className="badge badge-primary my-auto inline-block">Beta</div>
        </div>
        {isLoading && (
          <div className="flex justify-center items-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}
        {error && (
          <div className="text-center text-red-500">Error: {error}</div>
        )}

        {!isLoading && !error && (
          <>
            {bookSuggestions.length === 0 ? (
              <p className="text-center">{t("norecommendations_warning")}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 ">
                {bookSuggestions.map((x, index) => (
                  <div key={`book-suggestion-${x.id}-${index}`} className="">
                    <BookAvatar vol={x} isBlurred={false} allowAdd={true} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
