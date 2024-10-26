import { Volume } from "@/interfaces/GoogleAPI";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function BookNook1() {
  const t = useTranslations("BookNook");
  const [selectedBook, setSelectedBook] = useState(null);
  const [readingList, setReadingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, [supabase]);
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
    setLoading(true);
    try {
      const { data: booksData, error: booksError } = await supabase
        .from("reading_list")
        .select(
          `
          book_id::text
        `
        )
        .eq("status", "Reading")
        .eq("user_id", userId);

      if (booksError) {
        console.error("Error fetching reading list:", booksError);
        setReadingList([]);
      } else {
        // Fetch book details from our API route
        const bookDetails = await Promise.all(
          booksData.map(async (item: any) => {
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
              };
            } catch (error) {
              console.error(error);
              return null;
            }
          })
        );
        // Filter out any null results from failed fetches
        const validBookDetails = bookDetails.filter((book) => book != null);
        if (validBookDetails.length !== 0) {
          setReadingList(validBookDetails as any);
          setSelectedBook(validBookDetails[0].data);
        } else {
          setReadingList([]);
          setSelectedBook(null);
        }
        setLoading(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="card h-full w-full">
      <div className="card-body grid md:grid-cols-2 md:grid-rows-1">
        <div className="card h-auto">
          <div className="card-body">
            <h2 className="card-title">Sticky Notes:</h2>
          </div>
        </div>
        <div className="grid md:grid-rows-2 md:grid-cols-1">
          <div className="card h-auto">
            <div className="card-body">
              {selectedBook == null ? (
                <div className="border-2 border-dashed h-48 border-gray-300 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-12 h-12 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  <p className="mt-2 text-gray-500">{t("choose_book")}</p>
                </div>
              ) : (
                <div>
                  <figure className="p-10 md:w-1/5 mb-auto relative">
                    <img
                      src={
                        selectedBook.imageLinks?.thumbnail ||
                        "/placeholder-book-cover.jpg"
                      }
                      alt={selectedBook.title || "Book cover"}
                      className="rounded-lg md:w-full object-cover"
                    />
                  </figure>
                  <div className="grid md:grid-cols-2 md:grid-rows-1">
                    <h2 className="card-title">
                      {selectedBook.title || "Untitled"}
                    </h2>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="card h-auto">
            <div className="card-body grid">
              <h2 className="card-title">Fast Note Taker:</h2>
              <div className="grid md:grid-rows-1 md:grid-cols-3 gap-2 items-center">
                <label className="form-control w-full max-w-xs">
                  <input
                    type="text"
                    placeholder="Start page"
                    className="input input-bordered w-full max-w-xs"
                  />
                </label>
                <label className="form-control w-full max-w-xs">
                  <input
                    type="text"
                    placeholder="End page"
                    className="input input-bordered w-full max-w-xs"
                  />
                </label>
                <button className="btn btn-active btn-primary m-auto w-full">
                  Primary
                </button>
              </div>
              <textarea
                className="textarea textarea-primary"
                placeholder="This will go in a new sticky note..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
