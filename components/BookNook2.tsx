import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Clock } from "lucide-react";
import {
  User,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { Volume } from "@/interfaces/GoogleAPI";
import { Database } from "@/types/supabase";

export default function BookNook1() {
  const t = useTranslations("BookNook2");
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [readingList, setReadingList] = useState<
    Array<{
      book_id: string;
      title?: string;
      volumeInfo?: any;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  const [bookStickys, setBookStickys] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [tab, setTab] = useState("Daily Note");
  const [timer, setTimer] = useState(1800); // 30 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentPage, setCurrentPage] = useState(123);
  const [startPage, setStartPage] = useState<number>(0);
  const [endPage, setEndPage] = useState<number>(0);
  const [dailyNoteContent, setDailyNoteContent] = useState("");
  const [reviewContent, setreviewContent] = useState("");
  const [isLoadingreview, setIsLoadingreview] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);

  const fetchStickys = useCallback(async () => {
    if (!user || !selectedBook) return;

    const { data, error } = await supabase
      .from("sticky_notes")
      .select("*")
      .eq("user_id", user.id)
      .eq("book_id", selectedBook.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching stickys:", error);
      return;
    }

    setBookStickys(data || []);
  }, [user, selectedBook, supabase]);

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

  useEffect(() => {
    fetchStickys();
    if (selectedBook && user) {
      loadreview();
    }
  }, [fetchStickys, selectedBook, user]);

  const loadreview = async () => {
    if (!user || !selectedBook) return;

    setIsLoadingreview(true);
    try {
      const { data, error } = await supabase
        .from("book_notes")
        .select("*")
        .eq("user_id", user.id)
        .eq("book_id", selectedBook.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found"
        throw error;
      }

      setreviewContent(data?.notes || "");
    } catch (error) {
      console.error("Error loading review:", error);
      toast.error("Failed to load review");
    } finally {
      setIsLoadingreview(false);
    }
  };

  const savereview = async () => {
    if (!user || !selectedBook) {
      toast.error("No book selected");
      return;
    }

    try {
      const { data, error } = await supabase.from("book_notes").upsert(
        {
          user_id: user.id,
          book_id: selectedBook.id,
          notes: reviewContent,
        },
        {
          onConflict: "user_id,book_id",
        }
      );

      if (error) throw error;
      toast.success("Review saved successfully!");
    } catch (error) {
      console.error("Error saving review:", error);
      toast.error("Failed to save review");
    }
  };

  const fetchBookDetails = async (bookId: string) => {
    try {
      const response = await fetch(`/api/books/${bookId}/v3`);
      if (!response.ok) throw new Error("Failed to fetch book details");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching book details:", error);
      return null;
    }
  };

  async function fetchReadingList(userId: string) {
    setLoading(true);
    try {
      const { data: readingListData, error } = await supabase
        .from("reading_list")
        .select("*")
        .eq("status", "Reading")
        .eq("user_id", userId);

      if (error) throw error;

      // Fetch book details for each book in reading list
      const booksWithDetails = await Promise.all(
        (readingListData || []).map(async (book) => {
          const details = await fetchBookDetails(book.book_id);
          return {
            ...book,
            title: details?.volumeInfo?.title || "Untitled Book",
            volumeInfo: details?.volumeInfo,
          };
        })
      );

      setReadingList(booksWithDetails);

      // Automatically select the first book if available
      if (booksWithDetails.length > 0) {
        setSelectedBook({
          id: booksWithDetails[0].book_id,
          volumeInfo: booksWithDetails[0].volumeInfo || {},
        });
      }
    } catch (error) {
      console.error("Error fetching reading list:", error);
      toast.error("Failed to fetch reading list");
    } finally {
      setLoading(false);
    }
  }

  const addStickyNote = async () => {
    if (!newNoteContent.trim() || !selectedBook || !user) {
      toast.error("Please fill in all fields");
      return;
    }
    // Logic to add sticky note...
    toast.success("Sticky note added!");
    setNewNoteContent("");
  };

  return (
    <div className="h-[calc(100vh-6rem)] w-full p-1 text-black">
      <div className="flex flex-col md:flex-row h-full rounded shadow-lg bg-[#FFF2D7]/90 overflow-y-auto md:overflow-hidden">
        {/* Left Column: Note-taking Section */}
        <div className="flex-1 flex flex-col p-2 min-h-[50vh] md:min-h-0">
          {/* Tabs for Daily Note and review */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0 mb-2">
            <div className="tabs tabs-boxed">
              <button
                onClick={() => setTab("Daily Note")}
                className={`tab ${tab === "Daily Note" ? "tab-active" : ""}`}
              >
                Daily Note
              </button>
              <button
                onClick={() => setTab("review")}
                className={`tab ${tab === "review" ? "tab-active" : ""}`}
              >
                Review
              </button>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <select
                className="select select-bordered select-sm text-white w-full md:w-auto"
                value={selectedBook?.id || ""}
                onChange={(e) => {
                  const book = readingList.find(
                    (b) => b.book_id === e.target.value
                  );
                  if (book) {
                    setSelectedBook({
                      id: book.book_id,
                      volumeInfo: book.volumeInfo || {},
                    });
                  } else {
                    setSelectedBook(null);
                  }
                }}
              >
                <option value="">{t('select_book')}</option>
                {readingList.map((book) => (
                  <option key={book.book_id} value={book.book_id}>
                    {book.title || t('untitled_book')}
                  </option>
                ))}
              </select>
              {/* <div className="flex items-center gap-2">
                <Clock size={18} />
                <span className="font-mono">
                  {Math.floor(timer / 60)}:
                  {(timer % 60).toString().padStart(2, "0")}
                </span>
              </div> */}
            </div>
          </div>

          {/* Daily Note or review Content */}
          <div className="flex-1 flex gap-2 h-full">
            <div className="flex-1 card card-bordered p-3 relative h-full">
              {tab === "Daily Note" && (
                <div className="h-full flex flex-col">
                  <h2 className="text-xl font-semibold mb-4">Daily Note</h2>
                  <textarea
                    className="flex-1 w-full textarea textarea-primary"
                    style={{ backgroundColor: "#FFF2D7" }}
                    placeholder="Write here..."
                    value={dailyNoteContent}
                    onChange={(e) => setDailyNoteContent(e.target.value)}
                  />
                </div>
              )}
              {tab === "review" && (
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Review</h2>
                    <button
                      className={`btn btn-sm ${isEditMode ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => {
                        if (isEditMode) {
                          savereview().then(() => setIsEditMode(false));
                        } else {
                          setIsEditMode(true);
                        }
                      }}
                      disabled={isLoadingreview}
                    >
                      {isEditMode ? 'Save & View' : 'Edit'}
                    </button>
                  </div>
                  {isEditMode ? (
                    <textarea
                      className="flex-1 w-full textarea textarea-primary"
                      style={{ backgroundColor: "#FFF2D7" }}
                      placeholder="Write your review here..."
                      value={reviewContent}
                      onChange={(e) => setreviewContent(e.target.value)}
                      disabled={isLoadingreview}
                    />
                  ) : (
                    <div className="flex-1 overflow-y-auto prose prose-sm max-w-none">
                      <ReactMarkdown>{reviewContent}</ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Stickies / Quick Notes */}
        <div className="w-full md:w-80 flex-shrink-0 p-2 md:border-l border-t md:border-t-0 flex flex-col h-full">
          <div className="flex-none space-y-4">
            <h2 className="text-lg font-semibold">Stickies / Quick Notes</h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Search notes..."
                className="input input-bordered w-full text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto mt-4 pr-2">
            <div className="space-y-3">
              {bookStickys
                .filter(
                  (sticky) =>
                    sticky.content
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    sticky.label
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                )
                .map((sticky) => (
                  <div
                    key={sticky.id}
                    className="card card-bordered p-3 relative"
                  >
                    <div className="line-clamp-3">
                      <ReactMarkdown>{sticky.content}</ReactMarkdown>
                    </div>
                    <div className="absolute bottom-2 right-2 flex flex-row items-end">
                      <span className="text-xs opacity-70">{sticky.label}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Bottom Action - Log Session / Bookmark - Only show on Daily Note tab */}
          {tab === "Daily Note" && (
            <div className="mt-4 space-y-2">
              <div className="join w-full">
                <input
                  type="number"
                  className="join-item input input-bordered w-1/2 text-white"
                  placeholder="Page Start"
                  value={startPage || ""}
                  onChange={(e) => setStartPage(Number(e.target.value))}
                />
                <input
                  type="number"
                  className="join-item input input-bordered w-1/2 text-white"
                  placeholder="Page End"
                  value={endPage || ""}
                  onChange={(e) => setEndPage(Number(e.target.value))}
                />
              </div>
              <button
                className="btn btn-primary w-full"
                onClick={async () => {
                  if (!user || !selectedBook) {
                    toast.error("No book selected");
                    return;
                  }
                  if (!startPage || !endPage || startPage <= 0 || endPage <= 0) {
                    toast.error("Please enter valid page numbers greater than 0");
                    return;
                  }
                  if (startPage > endPage) {
                    toast.error("Start page must be less than or equal to end page");
                    return;
                  }
                  if (!dailyNoteContent.trim()) {
                    toast.error("Please write a daily note before logging");
                    return;
                  }

                  const today = new Date().toISOString().split("T")[0];
                  const label = `${today}-${startPage}-${endPage}`;

                  const { error } = await supabase.from("sticky_notes").insert({
                    user_id: user.id,
                    book_id: selectedBook.id,
                    content: dailyNoteContent,
                    label: label,
                    start_page: startPage,
                    end_page: endPage,
                  });

                  if (error) {
                    toast.error("Failed to log session");
                    console.error(error);
                    return;
                  }

                  toast.success("Session logged successfully!");
                  setDailyNoteContent("");
                  setNewNoteContent("");
                  fetchStickys();
                }}
              >
                Log Session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
