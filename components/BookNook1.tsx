import { Volume } from "@/interfaces/GoogleAPI";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";

export default function BookNook1() {
  const t = useTranslations("BookNook");
  const [selectedBook, setSelectedBook] = useState<Volume | null>(null);
  const [readingList, setReadingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  const [pagesRead, setPagesRead] = useState(0);
  const [bookStickys, setBookStickys] = useState<{
    [bookId: string]: {
      content: string;
      lastUpdated: string | null;
      createdAt: string | null;
      label: string;
      isEditing: boolean;
      isPublic: boolean;
    };
  }>({});
  const [editingStickyId, setEditingStickyId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(true);
  const [editedContent, setEditedContent] = useState("");
  const [startPage, setStartPage] = useState("");
  const [endPage, setEndPage] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
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

  const fetchStickyNotes = async (book_id: string) => {
    try {
      const { data: stickyNotesData, error: stickyNotesError } = await supabase
        .from("sticky_notes")
        .select("id, content, created_at, updated_at, label, is_public")
        .eq("book_id", book_id)
        .eq("user_id", user?.id);
      if (stickyNotesError) {
        console.error("Error fetching sticky notes:", stickyNotesError);
        setBookStickys({});
      } else {
        const stickyNotesObj = stickyNotesData.reduce((acc: any, item: any) => {
          acc[item.id] = {
            content: item.content,
            lastUpdated: item.updated_at,
            createdAt: item.created_at,
            label: item.label,
            isEditing: false,
            isPublic: item.is_public,
          };
          return acc;
        }, {});
        setBookStickys(stickyNotesObj);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  useEffect(() => {
    if (selectedBook && user) {
      fetchStickyNotes(selectedBook.id);
    }
  }, [selectedBook, user]);
  return (
    <div
      className="card h-full w-full bg-base-200"
      style={{ backgroundImage: "/safe-spaces/1.png" }}
    >
      <div className="card-body grid md:grid-cols-2 md:grid-rows-1">
        <div className="card h-auto">
          <div className="card-body">
            <h2 className="card-title">Sticky Notes:</h2>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {Object.entries(bookStickys).length === 0 ? (
                  <div className="text-gray-500">
                    No sticky notes yet. Create one using the Fast Note Taker
                    below!
                  </div>
                ) : (
                  Object.entries(bookStickys).map(([id, sticky]) => (
                    <div key={id} className="flex flex-col">
                      <div
                        className={`badge ${
                          editingStickyId === id
                            ? "badge-warning"
                            : "badge-secondary"
                        } gap-1 h-auto inline-flex items-center px-2 py-1 cursor-pointer`}
                        style={{ flexBasis: "auto" }}
                        onClick={() => {
                          setEditingStickyId(id);
                          setEditedContent(sticky.content);
                        }}
                      >
                        <span className="mr-1 whitespace-normal break-words flex-grow text-left">
                          {sticky.label}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {editingStickyId && (
                <div className="mt-4">
                  {isEditMode ? (
                    <textarea
                      className="textarea textarea-bordered w-full min-h-[100px]"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                    />
                  ) : (
                    <div className="mt-1 p-2 w-full text-sm rounded bg-base-200 prose">
                      <ReactMarkdown>
                        {bookStickys[editingStickyId].content}
                      </ReactMarkdown>
                    </div>
                  )}
                  <div className="flex justify-between mt-2">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => setIsEditMode(!isEditMode)}
                    >
                      {isEditMode ? "View" : "Edit"}
                    </button>
                    {isEditMode && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={async () => {
                          if (!selectedBook || !user) return;
                          try {
                            const { error } = await supabase
                              .from("sticky_notes")
                              .update({ content: editedContent })
                              .eq("id", editingStickyId)
                              .eq("user_id", user.id)
                              .eq("book_id", selectedBook.id);

                            if (error) {
                              console.error(
                                "Error updating sticky note:",
                                error
                              );
                            } else {
                              setBookStickys((prev) => ({
                                ...prev,
                                [editingStickyId]: {
                                  ...prev[editingStickyId],
                                  content: editedContent,
                                },
                              }));
                            }
                          } catch (error) {
                            console.error("Unexpected error:", error);
                          }
                        }}
                      >
                        Save
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="grid md:grid-rows-2 md:grid-cols-1">
          <div className="card h-auto">
            <div className="card-body pb-0 mb-0">
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
                <div className="grid grid-cols-[auto,1fr] gap-4">
                  <figure className="relative w-16 h-24 md:w-32 md:h-48 shrink-0">
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
                        <span className="badge badge-primary ml-auto">
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
                    type="number"
                    placeholder="Start page"
                    className="input input-bordered w-full max-w-xs"
                    value={startPage}
                    onChange={(e) => setStartPage(e.target.value)}
                    min="1"
                  />
                </label>
                <label className="form-control w-full max-w-xs">
                  <input
                    type="number"
                    placeholder="End page"
                    className="input input-bordered w-full max-w-xs"
                    value={endPage}
                    onChange={(e) => setEndPage(e.target.value)}
                    min="1"
                  />
                </label>
                <button
                  className="btn btn-active btn-primary m-auto w-full"
                  onClick={async () => {
                    if (
                      !startPage ||
                      !endPage ||
                      !newNoteContent.trim() ||
                      !selectedBook ||
                      !user
                    ) {
                      toast.error("Please fill in all fields");
                      return;
                    }

                    const start = parseInt(startPage);
                    const end = parseInt(endPage);

                    if (start > end) {
                      toast.error("Start page cannot be greater than end page");
                      return;
                    }

                    try {
                      const { data, error } = await supabase
                        .from("sticky_notes")
                        .insert({
                          user_id: user.id,
                          book_id: selectedBook.id,
                          label: `page ${start}-${end}`,
                          content: newNoteContent,
                        })
                        .select();

                      if (error) {
                        console.error("Error adding sticky note:", error);
                        toast.error("Failed to add sticky note");
                      } else if (data && data[0]) {
                        setBookStickys((prev) => ({
                          ...prev,
                          [data[0].id]: {
                            content: data[0].content,
                            lastUpdated: data[0].updated_at,
                            createdAt: data[0].created_at,
                            label: data[0].label,
                            isEditing: false,
                            isPublic: false,
                          },
                        }));
                        setStartPage("");
                        setEndPage("");
                        setNewNoteContent("");
                        toast.success("Sticky note added!");
                      }
                    } catch (error) {
                      console.error("Unexpected error:", error);
                      toast.error("An unexpected error occurred");
                    }
                  }}
                >
                  {t("add_sticky_note")}
                </button>
              </div>
              <textarea
                className="textarea textarea-primary h-full min-h-[8rem]"
                placeholder="This will go in a new sticky note..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
