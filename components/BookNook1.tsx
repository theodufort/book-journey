import { Volume } from "@/interfaces/GoogleAPI";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function BookNook1() {
  const t = useTranslations("BookNook");
  const [selectedBook, setSelectedBook] = useState<Volume | null>(null);
  const [readingList, setReadingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  const [pagesRead, setPagesRead] = useState(0);
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
          console.log("Valid book details:", validBookDetails);
          setReadingList(validBookDetails as any);
          const firstBook = validBookDetails[0].data;
          console.log("Setting selected book to:", firstBook);
          setSelectedBook(firstBook);
        } else {
          console.log("No valid books found");
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
  const updatePagesRead = async (newPagesRead: number) => {
    if (user) {
      const { error } = await supabase
        .from("reading_list")
        .update({ pages_read: newPagesRead })
        .eq("user_id", user.id)
        .eq("book_id", selectedBook);

      if (error) {
        console.error("Error updating pages read:", error);
      } else {
        setPagesRead(newPagesRead);
      }
    }
  };
  useEffect(() => {
    const fetchPagesRead = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("reading_list")
          .select("pages_read")
          .eq("user_id", user.id)
          .eq("book_id", selectedBook)
          .single();

        if (error) {
          console.error("Error fetching pages read:", error);
        } else {
          setPagesRead(data?.pages_read || 0);
        }
      }
    };
    fetchPagesRead();
  }, [user, selectedBook, supabase]);
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
                <div className="grid grid-cols-2 gap-4">
                  <figure className="relative w-32 h-48">
                    <img
                      src={
                        selectedBook.volumeInfo.imageLinks?.thumbnail ||
                        "/placeholder-book-cover.jpg"
                      }
                      alt={selectedBook.volumeInfo.title || "Book cover"}
                      className="rounded-lg object-cover w-full h-full"
                    />
                  </figure>
                  <div>
                    <p>
                      <b>{t("page_label")}:</b>{" "}
                      {!selectedBook.volumeInfo.pageCount ? (
                        "?"
                      ) : (
                        <span className="badge badge-primary">
                          <input
                            type="number"
                            value={pagesRead}
                            onChange={(e) => {
                              const newValue = Number(e.target.value);
                              setPagesRead(newValue);
                              updatePagesRead(newValue);
                            }}
                            className="bg-transparent text-center"
                            min="0"
                            max={selectedBook.volumeInfo.pageCount || 9999}
                          />
                          / {selectedBook.volumeInfo.pageCount || "?"}
                        </span>
                      )}
                    </p>
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
