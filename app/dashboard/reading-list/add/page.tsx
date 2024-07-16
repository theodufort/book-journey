// app/dashboard/add-book.tsx
"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import HeaderDashboard from "@/components/DashboardHeader";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface BookSearchResult {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    imageLinks?: {
      thumbnail: string;
    };
    industryIdentifiers?: {
      type: string;
      identifier: string;
    }[];
  };
}

export default function AddBook() {
  const supabase = createClientComponentClient();
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
  const searchBooks = async (e: React.FormEvent) => {
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

    const { error } = await supabase.from("reading_list").insert({
      user_id: user.id,
      book_isbn: isbn,
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
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-6xl mx-auto space-y-8">
        <HeaderDashboard />

        <h1 className="text-3xl md:text-4xl font-extrabold">Add a Book</h1>

        <form onSubmit={searchBooks} className="space-y-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or ISBN"
            className="input input-bordered w-full"
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && <p className="text-error">{error}</p>}

        <div className="space-y-4">
          {searchResults.map((book) => (
            <div
              key={book.id}
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
                  >
                    <option disabled selected>
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
