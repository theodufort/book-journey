"use client";
import AIRecorder from "@/components/AIRecorder";
import HeaderDashboard from "@/components/DashboardHeader";
import { ReadingListItem } from "@/interfaces/Dashboard";
import { Volume } from "@/interfaces/GoogleAPI";
import { checkPremium } from "@/libs/premium";
import { Database } from "@/types/supabase";

interface VocalNote {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  endpoint_url: string;
  text_content: string | null;
}
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { routeros } from "react-syntax-highlighter/dist/esm/styles/hljs";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

export default function BookVocalNotes() {
  const router = useRouter();
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
  const [vocalNotes, setVocalNotes] = useState<VocalNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<VocalNote | null>(null);
  const [playingNote, setPlayingNote] = useState<VocalNote | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
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
      const checkAccess = async () => {
        const hasPremium = await checkPremium(user.id);
        if (!hasPremium) {
          router.push("/dashboard/premium");
          return;
        }
        fetchReadingList();
      };
      checkAccess();
    }
  }, [user, statusFilter]);

  useEffect(() => {
    if (selectedBook && user) {
      fetchVocalNotes(selectedBook.book_id);
    }
  }, [selectedBook, user]);

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
  async function fetchVocalNotes(book_id: string) {
    const { data, error } = await supabase
      .from("vocal_notes")
      .select("*")
      .eq("user_id", user?.id)
      .order("start_time", { ascending: false });

    if (error) {
      console.error("Error fetching vocal notes:", error);
      toast.error("Failed to load vocal notes");
    } else {
      setVocalNotes(data);
    }
  }
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
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-md md:text-2xl font-semibold">
                            {selectedBook.data.volumeInfo.title}
                          </h2>
                          <p className="text-gray-600">
                            {selectedBook.data.volumeInfo.authors?.join(", ")}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {t("last_update_label")}:{" "}
                            {vocalNotes.length > 0
                              ? new Date(
                                  vocalNotes[0].start_time
                                ).toLocaleString()
                              : t("not_saved_warning")}
                          </p>
                        </div>
                        {user ? (
                          <AIRecorder
                            onTranscription={function (text: string): void {
                              throw new Error("Function not implemented.");
                            }}
                            autoFormatEnabled={false}
                            autoCleanEnabled={true}
                            userId={user.id}
                          />
                        ) : null}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="table">
                          {/* head */}
                          <thead>
                            <tr>
                              <th>Record date</th>
                              <th>Recording Length</th>
                              <th>Transcription</th>
                              <th>Recording</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vocalNotes.map((note) => (
                              <tr key={note.id}>
                                <td>
                                  {new Date(note.start_time).toLocaleString()}
                                </td>
                                <td>
                                  {Math.round(
                                    (new Date(note.end_time).getTime() -
                                      new Date(note.start_time).getTime()) /
                                      1000
                                  )}{" "}
                                  seconds
                                </td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => {
                                      setSelectedNote(note);
                                      (window as any).note_modal.showModal();
                                    }}
                                  >
                                    View Note
                                  </button>
                                </td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => {
                                      setPlayingNote(note);
                                      (window as any).audio_modal.showModal();
                                    }}
                                  >
                                    Play Recording
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {vocalNotes.length === 0 && (
                              <tr>
                                <td colSpan={5} className="text-center py-4">
                                  No vocal notes found for this book
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
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

        <dialog id="note_modal" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Transcription</h3>
            <p className="py-4">
              {selectedNote?.text_content || "No content available"}
            </p>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn">Close</button>
              </form>
            </div>
          </div>
        </dialog>

        {/* Audio Player Modal */}
        <dialog id="audio_modal" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Audio Player</h3>
            <div className="py-4">
              <audio
                ref={audioRef}
                src={
                  playingNote
                    ? `https://vocalnotes.mybookquest.com/${playingNote.endpoint_url}`
                    : ""
                }
                onTimeUpdate={() => {
                  if (audioRef.current) {
                    setAudioProgress(audioRef.current.currentTime);
                  }
                }}
                onLoadedMetadata={() => {
                  if (audioRef.current) {
                    setAudioDuration(audioRef.current.duration);
                  }
                }}
              />
              {playingNote && (
                <input
                  type="range"
                  min="0"
                  max={Math.round(
                    (new Date(playingNote.end_time).getTime() -
                      new Date(playingNote.start_time).getTime()) /
                      1000
                  )}
                  value={audioProgress}
                  onChange={(e) => {
                    const time = parseFloat(e.target.value);
                    if (audioRef.current) {
                      audioRef.current.currentTime = time;
                    }
                    setAudioProgress(time);
                  }}
                  className="range range-primary w-full"
                />
              )}
              <div className="flex justify-between text-sm mt-1">
                <span>{Math.floor(audioProgress)}s</span>
                <span>
                  {playingNote
                    ? Math.round(
                        (new Date(playingNote.end_time).getTime() -
                          new Date(playingNote.start_time).getTime()) /
                          1000
                      )
                    : 0}
                  s
                </span>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (audioRef.current?.paused) {
                      audioRef.current?.play();
                    } else {
                      audioRef.current?.pause();
                    }
                  }}
                >
                  Play/Pause
                </button>
              </div>
            </div>
            <div className="modal-action">
              <form method="dialog">
                <button
                  className="btn"
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.pause();
                      audioRef.current.currentTime = 0;
                    }
                  }}
                >
                  Close
                </button>
              </form>
            </div>
          </div>
        </dialog>
      </section>
    </main>
  );
}
