"use client";

import { BookAvatarNoDetails } from "@/components/BookAvatarNoDetails";
import { BookAvatarPublic } from "@/components/BookAvatarPublic";
import { Volume } from "@/interfaces/GoogleAPI";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import { useEffect, useState } from "react";

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

  const [searchReadBooks, setSearchReadBooks] = useState("");
  const [searchToReadBooks, setSearchToReadBooks] = useState("");
  const [searchReadingBooks, setSearchReadingBooks] = useState("");

  const filteredReadBooks = readBooks.filter((book) =>
    book.data.volumeInfo.title
      .toLowerCase()
      .includes(searchReadBooks.toLowerCase())
  );
  const filteredToReadBooks = toReadBooks.filter((book) =>
    book.data.volumeInfo.title
      .toLowerCase()
      .includes(searchToReadBooks.toLowerCase())
  );
  const filteredReadingBooks = readingBooks.filter((book) =>
    book.data.volumeInfo.title
      .toLowerCase()
      .includes(searchReadingBooks.toLowerCase())
  );

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
    <main className="min-h-screen p-4 md:p-8 pb-24 bg-base-200">
      <section className="max-w-full md:max-w-6xl mx-auto space-y-6">
        <div className="bg-base-100 rounded-box p-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-base-100 rounded-box p-8">
            <h2 className="text-2xl font-bold mb-4">Reading Journey</h2>
            <div className="grid grid-cols-2 grid-rows-1">
              <div className="stats stats-vertical lg:stats-horizontal w-max">
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
            </div>
          </div>
          <div className="w-auto flex bg-base-100 rounded-box p-8">
            {readingBooks.length > 0 ? (
              <div className="w-full">
                <h2 className="card-title text-xl md:text-2xl font-bold">
                  Currently Reading ({readingBooks.length})
                </h2>

                <label
                  className="input m-auto input-bordered flex items-center gap-2 mt-4 w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    placeholder="Search for a book..."
                    className="grow"
                    value={searchReadingBooks}
                    onChange={(e) => setSearchReadingBooks(e.target.value)}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-4 w-4 opacity-70"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </label>
                <div className="w-full">
                  <div className="relative">
                    <div className="carousel carousel-reading w-full">
                      {filteredReadingBooks.map((item) => {
                        const isbn13 =
                          item.data.volumeInfo.industryIdentifiers?.find(
                            (id: any) => id.type === "ISBN_13"
                          )?.identifier || item.book_id;
                        return (
                          <div
                            className="carousel-item w-full inline-block"
                            id={`reading-${isbn13}`}
                            key={`reading-${isbn13}`}
                          >
                            <BookAvatarNoDetails item={item.data} />
                          </div>
                        );
                      })}
                    </div>
                    {readingBooks.length > 1 && (
                      <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
                        <button
                          onClick={() => {
                            const currentIndex = readingBooks.findIndex(
                              (book) =>
                                document.getElementById(
                                  `reading-${book.book_id}`
                                )?.offsetLeft ===
                                (
                                  document.querySelector(
                                    ".carousel-reading"
                                  ) as HTMLElement
                                )?.scrollLeft
                            );
                            const prevIndex =
                              (currentIndex - 1 + readingBooks.length) %
                              readingBooks.length;
                            const carousel =
                              document.querySelector(".carousel-reading");
                            const item = document.getElementById(
                              `reading-${readingBooks[prevIndex].book_id}`
                            );
                            if (carousel && item) {
                              carousel.scrollLeft = item.offsetLeft;
                            }
                          }}
                          className="btn btn-circle"
                        >
                          ❮
                        </button>
                        <button
                          onClick={() => {
                            const currentIndex = readingBooks.findIndex(
                              (book) =>
                                document.getElementById(
                                  `reading-${book.book_id}`
                                )?.offsetLeft ===
                                (
                                  document.querySelector(
                                    ".carousel-reading"
                                  ) as HTMLElement
                                )?.scrollLeft
                            );
                            const nextIndex =
                              (currentIndex + 1) % readingBooks.length;
                            const carousel =
                              document.querySelector(".carousel-reading");
                            const item = document.getElementById(
                              `reading-${readingBooks[nextIndex].book_id}`
                            );
                            if (carousel && item) {
                              carousel.scrollLeft = item.offsetLeft;
                            }
                          }}
                          className="btn btn-circle"
                        >
                          ❯
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <h4>Not currently reading any book</h4>
            )}
          </div>
          <div className="w-auto bg-base-100 rounded-box p-8">
            <h2 className="card-title text-xl md:text-2xl font-bold mb-4">
              Books to Read ({toReadBooks.length})
            </h2>
            <div className="relative justify-start mb-4">
              <label
                className="input input-bordered flex items-center gap-2 w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  placeholder="Search for a book..."
                  className="grow"
                  value={searchToReadBooks}
                  onChange={(e) => setSearchToReadBooks(e.target.value)}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4 opacity-70"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              </label>
            </div>
            <div className="w-full">
              <div className="relative min-h-[20rem]">
                <div className="carousel carousel-to-read w-full h-full">
                  {filteredToReadBooks.map((item) => (
                    <div
                      className="carousel-item w-full inline-block"
                      id={`to-read-${item.book_id}`}
                      key={`to-read-book-${item.book_id}`}
                    >
                      <BookAvatarPublic item={item} showRating={false} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="w-auto bg-base-100 rounded-box p-8">
            <div className="w-full">
              <h2 className="card-title text-xl md:text-2xl font-bold mb-4">
                Read Books ({readBooks.length})
              </h2>
              <label
                className="input input-bordered flex items-center gap-2 w-full mb-4"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  placeholder="Search for a book..."
                  className="grow"
                  value={searchReadBooks}
                  onChange={(e) => setSearchReadBooks(e.target.value)}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4 opacity-70"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              </label>
            </div>
            <div className="w-full">
              <div className="relative min-h-[20rem]">
                <div className="carousel carousel-read w-full h-full">
                  {filteredReadBooks.map((item) => (
                    <div
                      className="carousel-item w-full inline-block"
                      id={`read-${item.book_id}`}
                      key={`read-book-${item.book_id}`}
                    >
                      <BookAvatarPublic item={item} showRating={true} />
                    </div>
                  ))}
                </div>
                {readBooks.length > 1 && (
                  <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
                    <button
                      onClick={() => {
                        const currentIndex = readBooks.findIndex(
                          (book) =>
                            document.getElementById(`read-${book.book_id}`)
                              ?.offsetLeft ===
                            (
                              document.querySelector(
                                ".carousel-read"
                              ) as HTMLElement
                            )?.scrollLeft
                        );
                        const prevIndex =
                          (currentIndex - 1 + readingBooks.length) %
                          readBooks.length;
                        const carousel =
                          document.querySelector(".carousel-read");
                        const item = document.getElementById(
                          `reading-${readBooks[prevIndex].book_id}`
                        );
                        if (carousel && item) {
                          carousel.scrollLeft = item.offsetLeft;
                        }
                      }}
                      className="btn btn-circle"
                    >
                      ❮
                    </button>
                    <button
                      onClick={() => {
                        const currentIndex = readBooks.findIndex(
                          (book) =>
                            document.getElementById(`read-${book.book_id}`)
                              ?.offsetLeft ===
                            (
                              document.querySelector(
                                ".carousel-read"
                              ) as HTMLElement
                            )?.scrollLeft
                        );
                        const nextIndex = (currentIndex + 1) % readBooks.length;
                        const carousel =
                          document.querySelector(".carousel-read");
                        const item = document.getElementById(
                          `read-${readBooks[nextIndex].book_id}`
                        );
                        if (carousel && item) {
                          carousel.scrollLeft = item.offsetLeft;
                        }
                      }}
                      className="btn btn-circle"
                    >
                      ❯
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
