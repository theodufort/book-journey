"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database, Json } from "@/types/supabase";
import Image from "next/image";
import { checkBookExists } from "@/libs/supabase-helpers";
import { Volume } from "@/interfaces/GoogleAPI";

export default function UserProfile({
  params,
}: {
  params: { userId: string };
}) {
  const [profile, setProfile] = useState(null);
  const [readBooks, setReadBooks] = useState([]);
  const [toReadBooks, setToReadBooks] = useState([]);
  const [readingBooks, setReadingBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    async function fetchProfileData() {
      const { data: userData, error: userError } = await supabase.rpc(
        "get_user_metadata",
        {
          user_id: params.userId,
        }
      );

      if (userError) {
        console.error("Error fetching profile:", userError);
      } else {
        setProfile(userData);
      }
      try {
        const { data: booksData, error: booksError } = await supabase
          .from("reading_list")
          .select("id,book_id,status,rating")
          .eq("user_id", params.userId)
          .limit(5);

        // Fetch book details from our API route
        const bookDetails = await Promise.all(
          booksData.map(async (item) => {
            const cache = await checkBookExists(item.book_id);
            console.log(cache);
            if (cache) {
              console.log("fetch");
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
                  ...bookData,
                  book_id: item.book_id,
                  status: item.status,
                };
              } catch (error) {
                console.error(error);
                return null;
              }
            } else {
              return {
                ...cache,
                book_id: item.book_id,
                status: item.status,
              };
            }
          })
        );
        if (booksError) {
          console.error("Error fetching read books:", booksError);
        } else {
          // Filter out any null results from failed fetches
          const validBookDetails = bookDetails.filter((book) => book !== null);
          setReadBooks(
            validBookDetails.filter((book) => (book.status = "Finished"))
          );
          setReadingBooks(
            validBookDetails.filter((book) => (book.status = "Reading"))
          );
          setToReadBooks(
            validBookDetails.filter((book) => (book.status = "To Read"))
          );
        }
      } catch (error) {
        console.error("Unexpected error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, [params.userId, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">User not found</h1>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 pb-24 bg-base-200">
      <section className="max-w-6xl mx-auto space-y-12">
        <div className="bg-base-100 rounded-box p-8 shadow-xl">
          <div className="flex items-center space-x-8">
            <div className="avatar">
              <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <Image
                  src={
                    profile.raw_user_meta_data?.avatar_url ||
                    "/default-avatar.png"
                  }
                  alt={profile.raw_user_meta_data?.full_name || "User"}
                  width={96}
                  height={96}
                />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold">
                {profile.raw_user_meta_data?.full_name || "Anonymous Reader"}
              </h1>
              <p className="text-xl text-base-content/70">
                @{profile.raw_user_meta_data?.username || profile.id}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-base-100 rounded-box p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Reading Journey</h2>
          <div className="stats stats-vertical lg:stats-horizontal shadow">
            <div className="stat">
              <div className="stat-title">Books Read</div>
              <div className="stat-value">{readBooks.length}</div>
            </div>

            <div className="stat">
              <div className="stat-title">Avg Rating</div>
              <div className="stat-value">
                {readBooks.length > 0
                  ? (
                      readBooks.reduce((sum, book) => sum + book.rating, 0) /
                      readBooks.length
                    ).toFixed(1)
                  : "N/A"}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-base-100 rounded-box p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Read Books</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {readBooks.map((book) => (
              <div key={book.id} className="card bg-base-200 shadow-sm">
                <figure className="px-4 pt-4">
                  <Image
                    src={book.cover_image || "/default-book-cover.png"}
                    alt={book.title}
                    width={120}
                    height={180}
                    className="rounded-lg"
                  />
                </figure>
                <div className="card-body items-center text-center p-4">
                  <h3 className="card-title text-sm">{book.title}</h3>
                  <p className="text-xs">{book.author}</p>
                  <div className="rating rating-sm">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <input
                        key={star}
                        type="radio"
                        name={`rating-${book.id}`}
                        className="mask mask-star-2 bg-orange-400"
                        checked={book.rating === star}
                        readOnly
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-base-100 rounded-box p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Books to Read</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {toReadBooks.map((book) => (
              <div key={book.id} className="card bg-base-200 shadow-sm">
                <figure className="px-4 pt-4">
                  <Image
                    src={book.cover_image || "/default-book-cover.png"}
                    alt={book.title}
                    width={120}
                    height={180}
                    className="rounded-lg"
                  />
                </figure>
                <div className="card-body items-center text-center p-4">
                  <h3 className="card-title text-sm">{book.title}</h3>
                  <p className="text-xs">{book.author}</p>
                  <div className="rating rating-sm">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <input
                        key={star}
                        type="radio"
                        name={`rating-${book.id}`}
                        className="mask mask-star-2 bg-orange-400"
                        checked={book.rating === star}
                        readOnly
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
