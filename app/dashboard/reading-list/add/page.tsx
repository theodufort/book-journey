// app/dashboard/add-book.tsx
"use client";

import HeaderDashboard from "@/components/DashboardHeader";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { FirstBookTemplate } from "@/components/FirstBookTemplate";
import { BookSearchResult } from "@/interfaces/BookSearch";
import { Database } from "@/types/supabase";
import { Resend } from "resend";

export default function AddBook() {
  const supabase = createClientComponentClient<Database>();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      setUser(data.user);
    };

    getUser();
  }, [supabase]);
  const searchBooks = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/books/search?q=${encodeURIComponent(searchQuery)}`
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
    if (count == 0) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from: "welcome@mybookquest.com",
        to: user == null ? "theodufort05@gmail.com" : user.email,
        subject: "Congrats on adding your first book!",
        react: FirstBookTemplate(),
      });
    }
    const { error } = await supabase.from("reading_list").insert({
      user_id: user.id,
      book_id: isbn,
      status: status,
    });

    if (error) {
      setError("Failed to add book to reading list");
      console.error(error);
    } else {
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

        <form onSubmit={searchBooks} className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or ISBN"
            className="input input-bordered w-full max-w-lg"
          />
          <button
            type="submit"
            className="btn btn-primary ml-2"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && <p className="text-error">{error}</p>}

        <div className="space-y-4">
          {searchResults.map((book, index) => (
            <div
              key={`search-result-${book.id}-${index}`}
              className="card lg:card-side bg-base-100 shadow-xl"
            >
              <figure className="p-4">
                {book.volumeInfo.imageLinks?.thumbnail && (
                  <img
                    src={book.volumeInfo.imageLinks.thumbnail}
                    alt={book.volumeInfo.title}
                    className="rounded-lg"
                  />
                )}
              </figure>
              <div className="card-body">
                <h2 className="card-title">{book.volumeInfo.title}</h2>
                <p>{book.volumeInfo.authors?.join(", ")}</p>
                <p>{book.volumeInfo.publishedDate}</p>
                <p>{book.volumeInfo.description?.substring(0, 200)}...</p>
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
