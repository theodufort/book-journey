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
    <main className="min-h-screen p-4 md:p-8 pb-24">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"></div>
      </section>
    </main>
  );
}
