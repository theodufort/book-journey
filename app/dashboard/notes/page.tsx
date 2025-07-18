"use client";
import HeaderDashboard from "@/components/DashboardHeader";
import { ReadingListItem } from "@/interfaces/Dashboard";
import { Volume } from "@/interfaces/GoogleAPI";
import { getUser } from "@/libs/supabase/queries";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

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
  const [statusFilter, setStatusFilter] = useState("Reading");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editLabelId, setEditLabelId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [bookCounts, setBookCounts] = useState<{ [key: string]: number }>({
    all: 0,
    reading: 0,
    completed: 0,
    want_to_read: 0,
  });

  const [editingStickyId, setEditingStickyId] = useState<string | null>(null);

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
    const getUserCall = async () => {
      const user = await getUser(supabase);
      if (user) {
        setUser(user);
        fetchReadingList(user.id);
      } else {
        console.log("User not authenticated");
      }
    };
    getUserCall();
  }, [supabase]);

  useEffect(() => {
    if (user) {
      fetchReadingList();
    }
  }, [user, statusFilter]);

  useEffect(() => {
    if (selectedBook && user) {
      fetchNotes(selectedBook.book_id);
      fetchStickyNotes(selectedBook.book_id);
    }
  }, [selectedBook, user]);

  const fetchStickyNotes = async (book_id: string) => {
    try {
      const { data: stickyNotesData, error: stickyNotesError } = await supabase
        .from("session_notes")
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

  const toggleStickyEdit = (id: string) => {
    setEditingStickyId(editingStickyId === id ? null : id);
  };

  const updateStickyContent = async (
    id: string,
    newContent: string,
    isPublic?: boolean
  ) => {
    if (!selectedBook) return;

    try {
      const updateData: { content: string; is_public?: boolean } = {
        content: newContent,
      };
      if (isPublic !== undefined) {
        updateData.is_public = isPublic;
      }

      const { error } = await supabase
        .from("session_notes")
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
            isPublic: isPublic !== undefined ? isPublic : prev[id].isPublic,
          },
        }));
        // Do not set editingStickyId to null here
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const toggleStickyPublic = async (id: string) => {
    const sticky = bookStickys[id];
    if (sticky) {
      await updateStickyContent(id, sticky.content, !sticky.isPublic);
      // Do not set editingStickyId to null here
    }
  };

  const copyStickyLink = (id: string) => {
    const link = process.env.NEXT_PUBLIC_BASE_URL + `/sticky-note/${id}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
      });
  };

  const removeStickyNote = async (id: string) => {
    if (!selectedBook) return;

    try {
      const { error } = await supabase
        .from("session_notes")
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
        .from("session_notes")
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
            isPublic: data[0].is_public,
          },
        }));
        setNewSticky("");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const fetchReadingList = async (newStatus?: string) => {
    setLoading(true);
    try {
      const filterStatus = newStatus || statusFilter;
      let query = supabase
        .from("reading_list")
        .select(
          `
          book_id::text, 
          status
        `
        )
        .eq("user_id", user?.id);

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data: booksData, error: booksError } = await query.order(
        filterStatus == "Reading"
          ? "reading_at"
          : filterStatus == "To Read"
          ? "toread_at"
          : "finished_at",
        {
          ascending: false,
        }
      );

      const { data: countData } = await supabase
        .from("reading_list")
        .select("status")
        .eq("user_id", user?.id);

      if (countData) {
        const counts = {
          all: countData.length,
          reading: countData.filter((b) => b.status === "Reading").length,
          completed: countData.filter((b) => b.status === "Finished").length,
          want_to_read: countData.filter((b) => b.status === "To Read").length,
        };
        setBookCounts(counts);
      }

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
        // Sort books - 'reading' status first
        // const sortedBooks = validBookDetails.sort((a, b) => {
        //   if (a?.status === "reading" && b?.status !== "reading") return -1;
        //   if (a?.status !== "reading" && b?.status === "reading") return 1;
        //   return 0;
        // });
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
      .from("reviews")
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
    const { error } = await supabase.from("reviews").upsert(
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

  const saveStickyNote = async () => {
    if (editingStickyId) {
      await updateStickyContent(
        editingStickyId,
        bookStickys[editingStickyId].content
      );
      setEditingStickyId(null);
    }
  };

  const handleSaveButtonClick = async () => {
    if (isEditMode) {
      if (noteType === "main") {
        await saveNote();
      } else if (noteType === "sticky") {
        await saveStickyNote();
        // Preserve the selected sticky note when switching to view mode
        if (editingStickyId) {
          const currentStickyId = editingStickyId;
          setEditingStickyId(null);
          setTimeout(() => setEditingStickyId(currentStickyId), 0);
        }
      }
    }
    setIsEditMode(!isEditMode);
  };

  return (
    <main className="min-h-screen p-4 sm:p-8 pb-16">
      <section className="max-w-6xl mx-auto space-y-4 sm:space-y-8">
        <div className="sticky top-0 z-50 bg-base-100">
          <HeaderDashboard />
        </div>
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
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder={t("search_label")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input input-bordered w-full"
                    />
                    <select
                      value={statusFilter}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        setStatusFilter(newStatus);
                        await fetchReadingList(newStatus);
                      }}
                      className="select select-bordered w-full"
                    >
                      <option value="all">All ({bookCounts.all})</option>
                      <option value="Reading">
                        Reading ({bookCounts.reading})
                      </option>
                      <option value="Finished">
                        Completed ({bookCounts.completed})
                      </option>
                      <option value="To Read">
                        Want to Read ({bookCounts.want_to_read})
                      </option>
                    </select>
                  </div>
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
                        className="btn btn-secondary btn-lg btn-circle text-2xl"
                      >
                        ◀
                      </button>
                      <span className="text-sm">
                        {currentPage} / {displayedPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="btn btn-secondary btn-lg btn-circle text-2xl"
                      >
                        ▶
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
                      <div className="grid grid-cols-2 gap-2 justify-center">
                        <button
                          className="my-2 btn btn-primary"
                          onClick={handleSaveButtonClick}
                        >
                          {isEditMode ? t("save_view_label") : t("edit_label")}
                        </button>
                        <div className="join my-auto w-auto">
                          <input
                            className={`join-item btn w-1/2 ${
                              noteType == "main" ? "btn-success" : "btn-neutral"
                            }`}
                            checked={noteType == "main"}
                            type="radio"
                            name="main"
                            aria-label={t("tab1")}
                            onClick={() => {
                              setNoteType("main");
                            }}
                          />
                          <input
                            className={`join-item btn w-1/2 ${
                              noteType == "sticky"
                                ? "btn-success"
                                : "btn-neutral"
                            }`}
                            checked={noteType == "sticky"}
                            type="radio"
                            name="sticky"
                            aria-label={t("tab2")}
                            onClick={() => {
                              setNoteType("sticky");
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      ref={notesContainerRef}
                      className="flex flex-col prose w-full m-auto"
                    >
                      {noteType == "main" ? (
                        <div className="p-2 h-auto prose">
                          {isEditMode ? (
                            <>
                              <textarea
                                className="textarea textarea-primary w-full p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[200px]"
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
                            <div className="w-full h-full p-3 rounded-md bg-base-200/50 overflow-y-auto prose">
                              <ReactMarkdown
                                className="prose"
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                              >
                                {notes[selectedBook.book_id]?.content ||
                                  t("no_notes_warning")}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(bookStickys).length === 0 ? (
                              <div className="">
                                No sticky notes yet. Create one using the input!
                              </div>
                            ) : (
                              Object.entries(bookStickys).map(
                                ([id, sticky]) => (
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
                                          setDeleteConfirmId(id);
                                        }}
                                        className="btn btn-xs btn-circle btn-ghost"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                )
                              )
                            )}
                            <div className="badge badge-outline gap-1 h-auto inline-flex items-center px-2 py-1 ">
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
                                className="bg-transparent border-none outline-none max-w-min text-md text-black"
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
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="form-control">
                                  <label className="label cursor-pointer">
                                    <span className="label-text">Share:</span>
                                    <input
                                      type="checkbox"
                                      checked={
                                        bookStickys[editingStickyId].isPublic
                                      }
                                      onChange={() =>
                                        toggleStickyPublic(editingStickyId)
                                      }
                                      className={`toggle toggle-primary ml-5`}
                                    />
                                  </label>
                                </div>
                                {bookStickys[editingStickyId].isPublic && (
                                  <button
                                    onClick={() =>
                                      copyStickyLink(editingStickyId)
                                    }
                                    className="btn btn-sm btn-outline"
                                  >
                                    Copy Link
                                  </button>
                                )}
                              </div>
                              <textarea
                                className="textarea textarea-primary mt-1 p-2 w-full text-sm rounded resize-none overflow-y-auto"
                                style={{
                                  width: "100%",
                                  height: "calc(100vh - 16rem)",
                                }}
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
                              />
                            </div>
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
      <DeleteConfirmDialog
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            if (editingStickyId === deleteConfirmId) {
              setEditingStickyId(null);
            }
            removeStickyNote(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
      />
    </main>
  );

  function DeleteConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
  }) {
    if (!isOpen || !deleteConfirmId) return null;

    const sticky = bookStickys[deleteConfirmId];
    const isEditing = editLabelId === deleteConfirmId;

    const [tempLabel, setTempLabel] = useState(sticky.label);

    const handleSaveLabel = async () => {
      if (!selectedBook || !tempLabel.trim()) return;

      try {
        const { error } = await supabase
          .from("session_notes")
          .update({ label: tempLabel })
          .eq("id", deleteConfirmId)
          .eq("user_id", user?.id);

        if (error) {
          console.error("Error updating sticky label:", error);
        } else {
          setBookStickys((prev) => ({
            ...prev,
            [deleteConfirmId]: {
              ...prev[deleteConfirmId],
              label: tempLabel,
            },
          }));
          setEditLabelId(null);
          onClose();
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };

    return (
      <div className="fixed inset-0 z-50 overflow-auto flex bg-opacity-50 modal modal-open">
        <div className="relative p-8 bg-base-200 m-auto flex-col flex rounded-lg mx-auto">
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-bold mb-4">
              {isEditing ? "Edit Sticky Note Label" : "Sticky Note Options"}
            </h3>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={tempLabel}
                  onChange={(e) => setTempLabel(e.target.value)}
                  className="input input-bordered w-full mb-4"
                  placeholder="Enter new label"
                />
                <div className="flex justify-center gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveLabel}
                    disabled={!tempLabel.trim()}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setEditLabelId(null);
                      setNewLabel("");
                      onClose();
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                <button
                  className="btn btn-primary w-full"
                  onClick={() => {
                    setEditLabelId(deleteConfirmId);
                    setTempLabel(sticky.label);
                  }}
                >
                  Edit Label
                </button>
                <button className="btn btn-error w-full" onClick={onConfirm}>
                  Delete Note
                </button>
                <button className="btn btn-ghost w-full" onClick={onClose}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
