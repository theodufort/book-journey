"use client";
import HeaderDashboard from "@/components/DashboardHeader";
import { ReadingListItem } from "@/interfaces/Dashboard";
import { Volume } from "@/interfaces/GoogleAPI";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Switch } from "@headlessui/react";

export default function BookNotes() {
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
  const [newSticky, setNewSticky] = useState("");
  const t = useTranslations("Notes");
  const tCommon = useTranslations("Common");
  const supabase = createClientComponentClient<Database>();
  const [readingList, setReadingList] = useState<ReadingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<{
    [bookId: string]: { content: string; lastUpdated: string | null };
  }>({});
  const [selectedBook, setSelectedBook] = useState<ReadingListItem | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(true);
  const [noteType, setNoteType] = useState<"main" | "sticky">("main");
  const notesContainerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const booksPerPage = isMobile ? 3 : 5;

  const filteredReadingList = useMemo(() => {
    return readingList.filter((book) =>
      book.data.volumeInfo.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [readingList, searchQuery]);

  const paginatedReadingList = useMemo(() => {
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    return filteredReadingList.slice(startIndex, endIndex);
  }, [filteredReadingList, currentPage, booksPerPage]);

  const totalPages = Math.ceil(filteredReadingList.length / booksPerPage);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const displayedPages = useMemo(() => {
    return Math.max(1, totalPages);
  }, [totalPages]);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, [supabase]);

  useEffect(() => {
    if (user) {
      fetchReadingList();
    }
  }, [user]);

  useEffect(() => {
    if (selectedBook && user) {
      fetchNotes(selectedBook.book_id);
      fetchStickyNotes(selectedBook.book_id);
    }
  }, [selectedBook, user]);
  const fetchStickyNotes = async (book_id: string) => {
    try {
      const { data: stickyNotesData, error: stickyNotesError } = await supabase
        .from("sticky_notes")
        .select("id, content, created_at, updated_at, label")
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

  const [editingStickyId, setEditingStickyId] = useState<string | null>(null);

  const toggleStickyEdit = (id: string) => {
    setEditingStickyId(editingStickyId === id ? null : id);
  };

  const updateStickyContent = async (id: string, newContent: string, isPublic?: boolean) => {
    if (!selectedBook) return;

    try {
      const updateData: { content: string; is_public?: boolean } = { content: newContent };
      if (isPublic !== undefined) {
        updateData.is_public = isPublic;
      }

      const { error } = await supabase
        .from("sticky_notes")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user?.id)
        .eq("book_id", selectedBook.book_id);

      if (error) {
        console.error("Error updating sticky note:", error);
      } else {
        setBookStickys((prev) => ({
          ...prev,
          [id]: { 
            ...prev[id], 
            content: newContent,
            isPublic: isPublic !== undefined ? isPublic : prev[id].isPublic
          },
        }));
        setEditingStickyId(null);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const toggleStickyPublic = async (id: string) => {
    const sticky = bookStickys[id];
    if (sticky) {
      await updateStickyContent(id, sticky.content, !sticky.isPublic);
    }
  };

  const copyStickyLink = (id: string) => {
    const link = `/sticky-note/${id}`;
    navigator.clipboard.writeText(link).then(() => {
      alert("Link copied to clipboard!");
    }).catch((err) => {
      console.error("Failed to copy link: ", err);
    });
  };

  const removeStickyNote = async (id: string) => {
    if (!selectedBook) return;

    try {
      const { error } = await supabase
        .from("sticky_notes")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id)
        .eq("book_id", selectedBook.book_id);

      if (error) {
        console.error("Error removing sticky note:", error);
      } else {
        setBookStickys((prev) => {
          const newStickys = { ...prev };
          delete newStickys[id];
          return newStickys;
        });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const onAddSticky = async () => {
    if (!selectedBook || !newSticky.trim()) return;

    try {
      const { data, error } = await supabase
        .from("sticky_notes")
        .insert({
          user_id: user?.id,
          book_id: selectedBook.book_id,
          label: newSticky.trim(),
          content: "",
        })
        .select();

      if (error) {
        console.error("Error adding sticky note:", error);
      } else if (data && data[0]) {
        setBookStickys((prev): any => ({
          ...prev,
          [data[0].id]: {
            content: data[0].content,
            lastUpdated: data[0].updated_at,
            createdAt: data[0].created_at,
            label: data[0].label,
          },
        }));
        setNewSticky("");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };
  const fetchReadingList = async () => {
    setLoading(true);
    try {
      const { data: booksData, error: booksError } = await supabase
        .from("reading_list")
        .select(
          `
          book_id::text, 
          status
        `
        )
        .eq("user_id", user?.id);

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
        setReadingList(validBookDetails as ReadingListItem[]);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async (bookId: string) => {
    const { data, error } = await supabase
      .from("book_notes")
      .select("book_id, notes, updated_at")
      .eq("user_id", user?.id)
      .eq("book_id", bookId)
      .single();

    if (error) {
      console.error("Error fetching notes:", error);
    } else {
      setNotes((prevNotes) => ({
        ...prevNotes,
        [bookId]: {
          content: data?.notes || "",
          lastUpdated: data?.updated_at || null,
        },
      }));
    }
  };

  const handleNoteChange = (bookId: string, note: string) => {
    setNotes((prev) => ({
      ...prev,
      [bookId]: {
        ...prev[bookId],
        content: note.replace(/\n/g, "\n"),
      },
    }));
  };

  const saveNote = async () => {
    if (!selectedBook) return;

    const noteContent = notes[selectedBook.book_id]?.content || "";
    const updatedAt = new Date().toISOString();
    const { error } = await supabase.from("book_notes").upsert(
      {
        user_id: user?.id,
        book_id: selectedBook.book_id,
        notes: noteContent,
        updated_at: updatedAt,
      },
      {
        onConflict: "user_id,book_id",
      }
    );

    if (error) {
      console.error("Error saving note:", error);
    } else {
      // Update the last updated time in the local state
      setNotes((prev) => ({
        ...prev,
        [selectedBook.book_id]: {
          ...prev[selectedBook.book_id],
          lastUpdated: updatedAt,
        },
      }));
    }
  };
  return (
    <main className="min-h-screen p-4 sm:p-8 pb-16">
      <section className="max-w-6xl mx-auto space-y-4 sm:space-y-8">
        <div className="sticky top-0 z-50 bg-base-100">
          <HeaderDashboard />
        </div>
        {/* <h1 className="text-2xl md:text-4xl font-extrabold  my-auto">
          {t("title")}
        </h1> */}
        {loading ? (
          <main className="min-h-screen p-8 pb-24 flex items-center justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </main>
        ) : (
          <div className="bg-base-200 shadow-md rounded-lg overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/3 md:border-r">
                <div className="p-4 bg-base-200 border-b">
                  <h2 className="text-md md:text-xl font-semibold mb-2">
                    {t("subtitle")}
                  </h2>
                  <input
                    type="text"
                    placeholder={t("search_label")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="flex flex-col h-full">
                  <ul className="divide-y overflow-y-auto">
                    {paginatedReadingList.map((book) => (
                      <li
                        key={book.book_id}
                        className={`cursor-pointer p-4 transition-colors ${
                          selectedBook?.book_id === book.book_id
                            ? "bg-base-200"
                            : ""
                        }`}
                        onClick={() => setSelectedBook(book)}
                      >
                        <h3 className="font-semibold text-sm md:text-lg">
                          {book.data.volumeInfo.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {book.data.volumeInfo.authors?.join(", ")}
                        </p>
                      </li>
                    ))}
                    {readingList.length > 0 &&
                      filteredReadingList.length === 0 && (
                        <li className="p-4 text-center text-gray-500">
                          {t("no_books_found")}
                        </li>
                      )}
                  </ul>
                  {filteredReadingList.length > booksPerPage && (
                    <div className="flex justify-between items-center p-4 border-t">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="btn btn-lg btn-circle text-2xl"
                      >
                        ←
                      </button>
                      <span className="text-sm">
                        {currentPage} / {displayedPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="btn btn-lg btn-circle text-2xl"
                      >
                        →
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full md:w-2/3 p-6">
                {selectedBook ? (
                  <>
                    <div className="mb-4 block">
                      <div>
                        <h2 className="text-md md:text-2xl font-semibold">
                          {selectedBook.data.volumeInfo.title}
                        </h2>
                        <p className="text-gray-600">
                          {selectedBook.data.volumeInfo.authors?.join(", ")}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {t("last_update_label")}:{" "}
                          {notes[selectedBook.book_id]?.lastUpdated
                            ? new Date(
                                notes[selectedBook.book_id].lastUpdated
                              ).toLocaleString()
                            : t("not_saved_warning")}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          className="py-2 my-2 btn btn-sm btn-info"
                          onClick={() => {
                            if (isEditMode) {
                              saveNote();
                            }
                            setIsEditMode(!isEditMode);
                          }}
                        >
                          {isEditMode ? t("save_view_label") : t("edit_label")}
                        </button>
                        <button
                          className="py-2 my-2 btn btn-sm btn-success"
                          onClick={() => {
                            setNoteType(noteType == "main" ? "sticky" : "main");
                          }}
                        >
                          {noteType == "main" ? t("tab1") : t("tab2")}
                        </button>
                      </div>
                    </div>
                    <div ref={notesContainerRef} className="flex flex-col">
                      {noteType == "main" ? (
                        <div className="p-2 h-auto">
                          {isEditMode ? (
                            <>
                              <textarea
                                className="w-full p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[200px]"
                                value={
                                  notes[selectedBook.book_id]?.content || ""
                                }
                                onChange={(e) => {
                                  handleNoteChange(
                                    selectedBook.book_id,
                                    e.target.value
                                  );
                                  e.target.style.height = "auto";
                                  e.target.style.height =
                                    e.target.scrollHeight + "px";
                                }}
                                placeholder={t("enter_notes_placeholder")}
                              />
                            </>
                          ) : (
                            <div className="w-full h-full p-3 rounded-md bg-base-200 overflow-y-auto">
                              <ReactMarkdown>
                                {notes[selectedBook.book_id]?.content ||
                                  t("no_notes_warning")}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(bookStickys).map(([id, sticky]) => (
                              <div key={id} className="flex flex-col">
                                <div
                                  className={`badge ${
                                    editingStickyId === id
                                      ? "badge-warning"
                                      : "badge-secondary"
                                  } gap-1 h-auto inline-flex items-center px-2 py-1 cursor-pointer`}
                                  style={{ flexBasis: "auto" }}
                                >
                                  <span
                                    className="mr-1 whitespace-normal break-words flex-grow text-left"
                                    onClick={() => toggleStickyEdit(id)}
                                  >
                                    {sticky.label}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingStickyId(null);
                                      removeStickyNote(id);
                                    }}
                                    className="btn btn-xs btn-circle btn-ghost"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ))}
                            <div className="badge badge-outline gap-1 h-auto inline-flex items-center px-2 py-1">
                              <input
                                type="text"
                                value={newSticky}
                                onChange={(e) => setNewSticky(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    onAddSticky();
                                  }
                                }}
                                placeholder={t("add_sticky")}
                                className="bg-transparent border-none outline-none max-w-min"
                              />
                              <button
                                onClick={onAddSticky}
                                className="btn btn-xs btn-circle btn-ghost flex-shrink-0"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          {editingStickyId && isEditMode && (
                            <>
                              <div className="flex items-center justify-between mb-2">
                                <Switch.Group>
                                  <div className="flex items-center">
                                    <Switch.Label className="mr-4">Public</Switch.Label>
                                    <Switch
                                      checked={bookStickys[editingStickyId].isPublic}
                                      onChange={() => toggleStickyPublic(editingStickyId)}
                                      className={`${
                                        bookStickys[editingStickyId].isPublic ? 'bg-blue-600' : 'bg-gray-200'
                                      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                                    >
                                      <span
                                        className={`${
                                          bookStickys[editingStickyId].isPublic ? 'translate-x-6' : 'translate-x-1'
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                      />
                                    </Switch>
                                  </div>
                                </Switch.Group>
                                {bookStickys[editingStickyId].isPublic && (
                                  <button
                                    onClick={() => copyStickyLink(editingStickyId)}
                                    className="btn btn-sm btn-outline"
                                  >
                                    Copy Link
                                  </button>
                                )}
                              </div>
                              <textarea
                                className="mt-1 p-2 w-full text-sm rounded resize-vertical min-h-[100px]"
                                value={bookStickys[editingStickyId].content}
                                onChange={(e) => {
                                  setBookStickys((prev) => ({
                                    ...prev,
                                    [editingStickyId]: {
                                      ...prev[editingStickyId],
                                      content: e.target.value,
                                    },
                                  }));
                                  e.target.style.height = "auto";
                                  e.target.style.height =
                                    e.target.scrollHeight + "px";
                                }}
                                onBlur={() =>
                                  updateStickyContent(
                                    editingStickyId,
                                    bookStickys[editingStickyId].content
                                  )
                                }
                              />
                            </>
                          )}
                          {editingStickyId && !isEditMode && (
                            <div className="mt-1 p-2 w-full text-sm rounded bg-base-200">
                              <ReactMarkdown
                                children={bookStickys[editingStickyId].content}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-center mt-8">
                    {t("select_book")}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

// Add this at the end of the file
