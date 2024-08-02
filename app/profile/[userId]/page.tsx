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
          .eq("user_id", params.userId);

        if (booksError) {
          console.error("Error fetching books:", booksError);
          return;
        }

        // Fetch book details from our API route
        const bookDetails = await Promise.all(
          booksData.map(async (item) => {
            try {
              const response = await fetch(`/api/books/${item.book_id}`);
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
                rating: item.rating,
              };
            } catch (error) {
              console.error(error);
              return null;
            }
          })
        );

        // Filter out any null results from failed fetches
        const validBookDetails = bookDetails.filter((book) => book !== null);
        setReadBooks(
          validBookDetails.filter((book) => book.status === "Finished")
        );
        setReadingBooks(
          validBookDetails.filter((book) => book.status === "Reading")
        );
        setToReadBooks(
          validBookDetails.filter((book) => book.status === "To Read")
        );
      } catch (error) {
        console.error("Unexpected error fetching profile data:", error);
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
          <div className="grid grid-cols-2 grid-rows-1">
            <div className="stats stats-vertical lg:stats-horizontal shadow w-3/5">
              <div className="stat">
                <div className="stat-title">Books Read</div>
                <div className="stat-value">{readBooks.length}</div>
              </div>

              <div className="stat">
                <div className="stat-title">Avg Rating</div>
                <div className="stat-value">
                  {readBooks.length > 0
                    ? (
                        readBooks.reduce(
                          (sum, book) => sum + (book.rating || 0),
                          0
                        ) / readBooks.filter((book) => book.rating > 0).length
                      ).toFixed(1) || "N/A"
                    : "N/A"}
                </div>
              </div>
            </div>
            <div className="w-4/5 flex">
              {readingBooks.length > 0 ? (
                <div
                  key={readingBooks[0].book_id}
                  className="card bg-base-200 shadow-sm"
                >
                  <figure className="px-4 pt-4">
                    <Image
                      src={
                        readingBooks[0].data.volumeInfo.imageLinks?.thumbnail ||
                        "/default-book-cover.png"
                      }
                      alt={readingBooks[0].data.volumeInfo.title}
                      width={120}
                      height={180}
                      className="rounded-lg"
                    />
                  </figure>
                  <div className="card-body items-center text-center p-4">
                    <h3 className="card-title text-sm">
                      {readingBooks[0].data.volumeInfo.title}
                    </h3>
                    <p className="text-xs">
                      {readingBooks[0].data.volumeInfo.authors?.[0]}
                    </p>
                  </div>
                </div>
              ) : (
                <h4>Not currently reading any book</h4>
              )}
            </div>
          </div>
        </div>
        <div className="bg-base-100 rounded-box p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4">
            Read Books ({readBooks.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {readBooks.map((book) => (
              <div key={book.book_id} className="card bg-base-200 shadow-sm">
                <figure className="px-4 pt-4">
                  <Image
                    src={
                      book.data.volumeInfo.imageLinks?.thumbnail ||
                      "/default-book-cover.png"
                    }
                    alt={book.data.volumeInfo.title}
                    width={120}
                    height={180}
                    className="rounded-lg"
                  />
                </figure>
                <div className="card-body items-center text-center">
                  <h3 className="card-title text-sm">
                    {book.data.volumeInfo.title}
                  </h3>
                  <p className="text-xs">{book.data.volumeInfo.authors?.[0]}</p>
                  <div className="rating rating-md">
                    {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((star) => (
                      <input
                        key={star}
                        type="radio"
                        name={`rating-${book.book_id}`}
                        className={`mask mask-star-2 ${
                          star % 1 === 0 ? "mask-half-2" : "mask-half-1"
                        } bg-orange-400`}
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
          <h2 className="text-2xl font-bold mb-4">
            Books to Read ({toReadBooks.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {toReadBooks.map((book) => (
              <div key={book.book_id} className="card bg-base-200 shadow-sm">
                <figure className="px-4 pt-4">
                  <Image
                    src={
                      book.data.volumeInfo.imageLinks?.thumbnail ||
                      "/default-book-cover.png"
                    }
                    alt={book.data.volumeInfo.title}
                    width={120}
                    height={180}
                    className="rounded-lg"
                  />
                </figure>
                <div className="card-body items-center text-center p-4">
                  <h3 className="card-title text-sm">
                    {book.data.volumeInfo.title}
                  </h3>
                  <p className="text-xs">{book.data.volumeInfo.authors?.[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
