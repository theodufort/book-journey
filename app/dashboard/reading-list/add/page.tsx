// app/dashboard/add-book.tsx
"use client";

import HeaderDashboard from "@/components/DashboardHeader";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { BookSearchResult } from "@/interfaces/BookSearch";
import { Database } from "@/types/supabase";

export default function AddBook() {
  const supabase = createClientComponentClient<Database>();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "French" },
    { code: "es", name: "Spanish" },
  ];

  useEffect(() => {
    const getUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);

      if (userData.user) {
        const { data: preferenceData, error } = await supabase
          .from("user_preferences")
          .select("preferred_book_language")
          .eq("user_id", userData.user.id)
          .single();

        if (error) {
          console.error("Error fetching user preferences:", error);
          setSelectedLanguage("en"); // Default to English if there's an error
        } else if (preferenceData) {
          setSelectedLanguage(preferenceData.preferred_book_language || "en");
        } else {
          setSelectedLanguage("en"); // Default to English if no preference is set
        }
      }
    };

    getUser();
  }, [supabase]);

  const searchBooks = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/books/search/v3?q=${encodeURIComponent(
          searchQuery
        )}&langRestrict=${selectedLanguage}&language=${selectedLanguage}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }
      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (err) {
      setError("An error occurred while searching for books");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToReadingList = async (book: BookSearchResult, status: string) => {
    const isbn = book.volumeInfo.industryIdentifiers?.find(
      (id) => id.type === "ISBN_13"
    )?.identifier;
    const { count } = await supabase
      .from("reading_list")
      .select("*", { count: "exact", head: true });

    const { error } = await supabase.from("reading_list").upsert({
      user_id: user.id,
      book_id: isbn,
      status: status,
    });

    if (error) {
      setError("Failed to add book to reading list");
      console.error(error);
    } else {
      if (count === 0) {
        try {
          const response = await fetch("/api/email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user: { email: user?.email || "theodufort05@gmail.com" },
              emailType: "firstBook",
            }),
          });

          if (!response.ok) {
            console.error("Failed to send email");
          }
        } catch (emailError) {
          console.error("Error sending email:", emailError);
        }
      }
      router.push("/dashboard/reading-list");
    }
  };

  return (
    <main className="min-h-screen p-8 pb-16">
      <section className="max-w-6xl mx-auto space-y-4">
        <div className="z-50">
          <HeaderDashboard />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold">Add a Book</h1>

        <form
          onSubmit={searchBooks}
          className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2"
        >
          <div className="flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or ISBN"
              className="input input-bordered w-full"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="select select-bordered w-full"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0">
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {error && <p className="text-error">{error}</p>}

        <div className="space-y-4">
          {searchResults.map((book, index) => (
            <div
              key={`search-result-${book.id}-${index}`}
              className="card lg:card-side bg-base-100 shadow-xl"
            >
              <figure className="p-4 w-48 h-64 min-w-[120px] flex items-center justify-center m-auto">
                {book.volumeInfo.imageLinks?.thumbnail ? (
                  <img
                    src={book.volumeInfo.imageLinks.thumbnail}
                    alt={book.volumeInfo.title}
                    className="rounded-lg w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </figure>
              <div className="card-body">
                <h2 className="card-title">{book.volumeInfo.title}</h2>
                <p>{book.volumeInfo.authors?.join(", ")}</p>
                <p>{book.volumeInfo.publishedDate}</p>
                <p>
                  {typeof book.volumeInfo.description === "string"
                    ? book.volumeInfo.description
                        .replace("<p>", "")
                        .replace("</p>", "")
                        .replace("<br>", "")
                        .substring(0, 200) + "..."
                    : "No description available"}
                </p>
                <div className="card-actions justify-end">
                  <select
                    className="select select-bordered"
                    onChange={(e) => addToReadingList(book, e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled hidden>
                      Add to Reading List
                    </option>
                    <option value="To Read">To Read</option>
                    <option value="Reading">Currently Reading</option>
                    <option value="Finished">Finished</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

// Add this at the end of the file
