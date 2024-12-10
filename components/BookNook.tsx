import { useEffect, useState, useCallback, useRef } from "react";
import { MDXEditorMethods } from "@mdxeditor/editor";
import PaidFeatureWrapper from "./PaidFeatureWrapper";
import { useTranslations } from "next-intl";
import { Clock } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import AIRecorder from "./AIRecorder";
import TranslationWidget from "./TranslationWidget";
import { Tooltip } from "react-tooltip";
import {
  User,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { Volume } from "@/interfaces/GoogleAPI";
import { Database } from "@/types/supabase";
import CongratulationsModalSession from "./CongratulationsModalSession";
import TooltipHelper from "./Tooltip";
import DictionaryWidget from "./DictionaryWidget";
import { ForwardRefEditor } from "./ForwardRefEditor";
import { useNextStep } from "nextstepjs";

export default function BookNookComponent() {
  const { startNextStep, currentTour } = useNextStep();
  const handleStartTour = () => {
    startNextStep("booknookTour");
  };
  console.log(currentTour);

  const t = useTranslations("BookNook");
  const [readingSessionID, setReadingSessionID] = useState("");
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
  const [tab, setTab] = useState("Session Note");
  const [rightColumnView, setRightColumnView] = useState<"notes" | "tools">(
    "notes"
  );
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(123);
  const [startPage, setStartPage] = useState<number>(0);
  const [endPage, setEndPage] = useState<number>(0);
  const [dailyNoteContent, setDailyNoteContent] = useState("");
  const [reviewContent, setreviewContent] = useState("");
  const dailyNoteEditorRef = useRef<MDXEditorMethods>(null);
  const reviewEditorRef = useRef<MDXEditorMethods>(null);
  const [autoFormatEnabled, setAutoFormatEnabled] = useState(false);
  const [autoCleanEnabled, setAutoCleanEnabled] = useState(true);
  const [isLoadingreview, setIsLoadingreview] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const [isSessionNoteEditMode, setIsSessionNoteEditMode] = useState(true);
  const [customLabel, setCustomLabel] = useState("");
  const [showCongrats, setShowCongrats] = useState(false);
  const [pagesRead, setPagesRead] = useState(0);
  const [questions, setQuestions] = useState<
    Array<{ id: string; question: string; answer: string | null }>
  >([]);
  const [newQuestion, setNewQuestion] = useState("");

  // Cleanup timer interval on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

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

  const fetchQuestions = useCallback(async () => {
    if (!user || !selectedBook) return;

    const { data, error } = await supabase
      .from("questions_notes")
      .select("*")
      .eq("user_id", user.id)
      .eq("book_id", selectedBook.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching questions:", error);
      return;
    }
    setQuestions(data || []);
  }, [user, selectedBook, supabase]);

  useEffect(() => {
    handleStartTour();
    fetchStickys();
    fetchBaseStartPage();
    if (selectedBook && user) {
      loadreview();
      fetchQuestions();
    }
  }, [fetchStickys, fetchQuestions, selectedBook, user]);

  const fetchBaseStartPage = async () => {
    if (!user || !selectedBook) return;
    const { data: readingListId, data: readingListIdError } = await supabase
      .from("reading_list")
      .select("id")
      .eq("user_id", user.id)
      .eq("book_id", selectedBook.id)
      .single();

    const { data: readingSessionData, error: readingSessionError } =
      await supabase
        .from("reading_sessions")
        .select("end_page")
        .order("end_page", { ascending: false })
        .eq("reading_list_id", readingListId.id)
        .limit(1)
        .single();

    setStartPage(readingSessionData.end_page || 0);
  };
  const loadreview = async () => {
    if (!user || !selectedBook) return;

    setIsLoadingreview(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
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
      const { data, error } = await supabase.from("reviews").upsert(
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
  async function updateHabitPages() {
    const { data, error } = await supabase.rpc("update_habit_progress", {
      _metric: "pages_read",
      _user_id: user.id,
      _progress_value: pagesRead,
    });

    if (error) {
      console.error("Error updating habit progress:", error);
    } else {
      console.log("Habit progress updated successfully:", data);
    }
  }
  async function handleLogSession() {
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
    const { data: readingListId, data: readingListIdError } = await supabase
      .from("reading_list")
      .select("id")
      .eq("user_id", user.id)
      .eq("book_id", selectedBook.id)
      .single();
    const { data: readingSessionData, error: readingSessionError } =
      await supabase
        .from("reading_sessions")
        .insert({
          reading_list_id: readingListId.id,
          start_page: startPage,
          end_page: endPage,
          started_at: sessionStartTime?.toISOString(),
          ended_at: new Date().toISOString(),
        })
        .select()
        .single();
    const label = customLabel.trim() || `${startPage}-${endPage}`;

    const { error } = await supabase.from("sticky_notes").insert({
      user_id: user.id,
      book_id: selectedBook.id,
      content: dailyNoteContent,
      label: label,
      reading_session_id: readingSessionData.id,
    });

    if (error) {
      toast.error("Failed to log session");
      console.error(error);
      return;
    }
    updateHabitPages();
    // Calculate pages read
    const pagesReadThisSession = endPage - startPage;
    setPagesRead(pagesReadThisSession);
    setReadingSessionID(readingSessionData.id);
    setShowCongrats(true);

    // Reset form
    setDailyNoteContent("");
    setNewNoteContent("");
    setCustomLabel("");
    fetchStickys();
    setStartPage(endPage);
    setEndPage(0);
  }

  return (
    <div className="h-[calc(100vh-6rem)] w-full p-1 text-black">
      <div className="flex flex-col md:flex-row h-full rounded shadow-lg bg-[#FFF2D7]/90 overflow-y-auto md:overflow-hidden relative">
        {/* Left Column: Note-taking Section */}
        <div className="flex-1 flex flex-col p-2 min-h-[50vh] md:min-h-0">
          {/* Tabs for Session Note and review */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0 mb-2">
            <div className="tabs tabs-boxed">
              <button
                onClick={() => setTab("Session Note")}
                className={`tab ${tab === "Session Note" ? "tab-active" : ""}`}
              >
                Session Note
              </button>
              <button
                onClick={() => setTab("review")}
                className={`tab ${tab === "review" ? "tab-active" : ""}`}
              >
                Review
              </button>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
              <div className="w-full md:w-auto">
                <select
                  className="select select-bordered select-sm w-full md:max-w-[200px]"
                  id="booknook-bookselect"
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
                  <option value="">{t("select_book")}</option>
                  {readingList.map((book) => (
                    <option key={book.book_id} value={book.book_id}>
                      {book.title || t("untitled_book")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                {isTimerRunning ? (
                  <div className="w-48">
                    <progress
                      className="progress progress-primary w-full"
                      value={
                        100 -
                        ((hours * 3600 + minutes * 60 + seconds) /
                          totalSeconds) *
                          100
                      }
                      max="100"
                    ></progress>
                  </div>
                ) : (
                  <div className="join">
                    <input
                      type="number"
                      className="join-item input input-bordered input-sm w-16 "
                      placeholder="HH"
                      min="0"
                      max="99"
                      value={hours || ""}
                      onChange={(e) =>
                        setHours(
                          Math.min(
                            99,
                            Math.max(0, parseInt(e.target.value) || 0)
                          )
                        )
                      }
                    />
                    <input
                      type="number"
                      className="join-item input input-bordered input-sm w-16 "
                      placeholder="MM"
                      min="0"
                      max="59"
                      value={minutes || ""}
                      onChange={(e) =>
                        setMinutes(
                          Math.min(
                            59,
                            Math.max(0, parseInt(e.target.value) || 0)
                          )
                        )
                      }
                    />
                    <input
                      type="number"
                      className="join-item input input-bordered input-sm w-16 "
                      placeholder="SS"
                      min="0"
                      max="59"
                      value={seconds || ""}
                      onChange={(e) =>
                        setSeconds(
                          Math.min(
                            59,
                            Math.max(0, parseInt(e.target.value) || 0)
                          )
                        )
                      }
                    />
                  </div>
                )}
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    if (isTimerRunning) {
                      if (timerInterval) clearInterval(timerInterval);
                      setIsTimerRunning(false);
                      setTimerInterval(null);
                    } else {
                      if (hours === 0 && minutes === 0 && seconds === 0) return;
                      setIsTimerRunning(true);
                      setSessionStartTime(new Date());
                      setTotalSeconds(hours * 3600 + minutes * 60 + seconds);
                      const interval = setInterval(() => {
                        setSeconds((s) => {
                          const newSeconds = s - 1;
                          if (newSeconds < 0) {
                            if (minutes === 0 && hours === 0) {
                              // Timer finished
                              if (timerInterval) clearInterval(timerInterval);
                              setIsTimerRunning(false);
                              setTimerInterval(null);
                              // Show dialog
                              (
                                document.getElementById(
                                  "timer_modal"
                                ) as HTMLDialogElement
                              )?.showModal();
                              return 0;
                            }
                            setMinutes((m) => {
                              if (m === 0) {
                                if (hours > 0) {
                                  setHours((h) => h - 1);
                                  return 59;
                                }
                                return 0;
                              }
                              return m - 1;
                            });
                            return 59;
                          }
                          return newSeconds;
                        });
                      }, 1000);
                      setTimerInterval(interval);
                    }
                  }}
                >
                  {isTimerRunning ? "Pause" : "Start"}
                </button>
              </div>
            </div>
          </div>

          {/* Session Note or review Content */}
          <div className="flex-1 flex gap-2 h-full min-h-0">
            <div className="flex-1 card card-bordered p-3 relative h-full overflow-y-auto">
              {tab === "Session Note" && (
                <div className="h-full flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2" id="booknook-sessionnote">
                      <h2 className="text-xl font-semibold my-auto">
                        Session Note
                      </h2>
                      <TooltipHelper
                        place={"top-start"}
                        content={
                          "Session notes are short notes that you can take while reading your book."
                        }
                      />
                    </div>
                    {/* <button
                      className={`btn btn-sm ${
                        isSessionNoteEditMode ? "btn-primary" : "btn-secondary"
                      }`}
                      onClick={() =>
                        setIsSessionNoteEditMode(!isSessionNoteEditMode)
                      }
                    >
                      {isSessionNoteEditMode ? "Preview" : "Edit"}
                    </button> */}
                  </div>
                  <div className="relative flex-1 w-full mb-4 flex flex-col">
                    <div className="flex-1 prose">
                      <ForwardRefEditor
                        ref={dailyNoteEditorRef}
                        className="w-full h-full"
                        placeholder="Write here..."
                        markdown={dailyNoteContent}
                        onChange={(val) => {
                          setDailyNoteContent(val);
                          console.log(val);
                        }}
                      />
                    </div>
                    <div className="absolute bottom-4 right-4 flex gap-2 items-center">
                      {/* <label className="cursor-pointer label">
                        <span className="label-text mr-2">Auto-Format</span>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={autoFormatEnabled}
                          onChange={(e) =>
                            setAutoFormatEnabled(e.target.checked)
                          }
                        />
                      </label> */}
                      {/* <label className="cursor-pointer label">
                        <span className="label-text mr-2">Auto-Clean</span>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={autoCleanEnabled}
                          onChange={(e) =>
                            setAutoCleanEnabled(e.target.checked)
                          }
                        />
                      </label> */}
                      {user ? (
                        <PaidFeatureWrapper userId={user.id}>
                          <AIRecorder
                            onTranscription={(text) => {
                              if (dailyNoteEditorRef.current) {
                                const currentContent = dailyNoteContent;
                                const newContent = currentContent
                                  ? `${currentContent}\n\n${text}`
                                  : text;
                                dailyNoteEditorRef.current.setMarkdown(
                                  newContent
                                );
                                setDailyNoteContent(newContent);
                                dailyNoteEditorRef.current.focus();
                              }
                            }}
                            autoFormatEnabled={autoFormatEnabled}
                            autoCleanEnabled={autoCleanEnabled}
                            userId={user.id}
                          />
                        </PaidFeatureWrapper>
                      ) : null}
                    </div>
                  </div>

                  {/* Questions Section */}
                  <div id="booknook-sessionquestion">
                    <div className="flex gap-2">
                      <h3 className="text-lg font-semibold">Questions</h3>
                      <TooltipHelper
                        place={"top-start"}
                        content={
                          "Questions can't popup while you read, get answers later!"
                        }
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {questions.map((q) => (
                        <div
                          key={q.id}
                          className="badge badge-secondary gap-2 p-2 h-auto"
                        >
                          <span
                            className="cursor-pointer"
                            title={q.answer || "No answer yet"}
                          >
                            {q.question}
                          </span>
                          <button
                            onClick={async () => {
                              const { error } = await supabase
                                .from("questions_notes")
                                .delete()
                                .eq("id", q.id);

                              if (error) {
                                console.error(
                                  "Error deleting question:",
                                  error
                                );
                                return;
                              }
                              fetchQuestions();
                            }}
                            className="btn btn-xs btn-circle btn-ghost"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <div className="badge badge-outline gap-2 h-auto flex">
                        <div className="inline-flex">
                          <input
                            type="text"
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            onKeyPress={async (e) => {
                              if (
                                e.key === "Enter" &&
                                newQuestion.trim() &&
                                user &&
                                selectedBook
                              ) {
                                const { error } = await supabase
                                  .from("questions_notes")
                                  .insert({
                                    user_id: user.id,
                                    book_id: selectedBook.id,
                                    question: newQuestion.trim(),
                                  });

                                if (error) {
                                  console.error(
                                    "Error adding question:",
                                    error
                                  );
                                  return;
                                }

                                setNewQuestion("");
                                fetchQuestions();
                              }
                            }}
                            placeholder="Add a question..."
                            className="bg-transparent border-none outline-none w-32"
                          />
                          <button
                            onClick={async () => {
                              if (newQuestion.trim() && user && selectedBook) {
                                const { error } = await supabase
                                  .from("questions_notes")
                                  .insert({
                                    user_id: user.id,
                                    book_id: selectedBook.id,
                                    question: newQuestion.trim(),
                                  });

                                if (error) {
                                  console.error(
                                    "Error adding question:",
                                    error
                                  );
                                  return;
                                }

                                setNewQuestion("");
                                fetchQuestions();
                              }
                            }}
                            className="btn btn-xs btn-circle btn-ghost"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {tab === "review" && (
                <div className="h-full flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <h2 className="text-xl font-semibold my-auto">Review</h2>
                      <TooltipHelper
                        place={"top-start"}
                        content={
                          "The Review is a summary of all your combined notes."
                        }
                      />
                    </div>
                    {/* <button
                      className={`btn btn-sm ${
                        isEditMode ? "btn-primary" : "btn-secondary"
                      }`}
                      onClick={() => {
                        if (isEditMode) {
                          savereview().then(() => setIsEditMode(false));
                        } else {
                          setIsEditMode(true);
                        }
                      }}
                      disabled={isLoadingreview}
                    >
                      {isEditMode ? "Save & View" : "Edit"}
                    </button> */}
                  </div>
                  <div className="prose relative">
                    <ForwardRefEditor
                      ref={reviewEditorRef}
                      className="w-full md:h-full"
                      markdown={reviewContent}
                      onChange={(val) => {
                        setreviewContent(val);
                        console.log(val);
                      }}
                      placeholder="Write your review here..."
                    />
                    <div className="absolute bottom-4 right-4">
                      <AIRecorder
                        onTranscription={(text) => {
                          if (reviewEditorRef.current) {
                            const currentContent = reviewContent;
                            const newContent = currentContent
                              ? `${currentContent}\n\n${text}`
                              : text;
                            reviewEditorRef.current.setMarkdown(newContent);
                            setreviewContent(newContent);
                            reviewEditorRef.current.focus();
                          }
                        }}
                        autoFormatEnabled={autoFormatEnabled}
                        autoCleanEnabled={autoCleanEnabled}
                        userId={user.id}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex gap-2">
                      <h3 className="text-lg font-semibold">Questions</h3>
                      <TooltipHelper
                        content={
                          "Questions can't popup while you read, get answers later!"
                        }
                        place={"top-start"}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {questions.map((q) => (
                        <div
                          key={q.id}
                          className="badge badge-secondary gap-2 p-2 h-auto"
                        >
                          <span
                            className="cursor-pointer"
                            title={q.answer || "No answer yet"}
                          >
                            {q.question}
                          </span>
                          <button
                            onClick={async () => {
                              const { error } = await supabase
                                .from("questions_notes")
                                .delete()
                                .eq("id", q.id);

                              if (error) {
                                console.error(
                                  "Error deleting question:",
                                  error
                                );
                                return;
                              }
                              fetchQuestions();
                            }}
                            className="btn btn-xs btn-circle btn-ghost"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Stickies / Session Notes */}
        <div className="w-full md:w-96 flex-shrink-0 p-2 md:border-l border-t md:border-t-0 flex flex-col md:h-full md:overflow-y-auto">
          <div className="flex-none">
            {/* Log Session Section - Only show on mobile when on Session Note tab */}
            {tab === "Session Note" && (
              <div className="md:hidden space-y-2">
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Custom Label (optional)"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                />
                <div className="join w-full">
                  <input
                    type="number"
                    className="join-item input input-bordered w-1/2"
                    placeholder="Page Start"
                    value={startPage || ""}
                    onChange={(e) => setStartPage(Number(e.target.value))}
                  />
                  <input
                    type="number"
                    className="join-item input input-bordered w-1/2"
                    placeholder="Page End"
                    value={endPage || ""}
                    onChange={(e) => setEndPage(Number(e.target.value))}
                  />
                </div>
                <button
                  className="btn btn-primary w-full"
                  onClick={handleLogSession}
                >
                  Log Session
                </button>
              </div>
            )}

            {/* View Toggle */}
            <div className="tabs tabs-boxed w-full mb-4 mb:mt-0 mt-2">
              <button
                className={`tab flex-1 ${
                  rightColumnView === "notes" ? "tab-active" : ""
                }`}
                onClick={() => setRightColumnView("notes")}
              >
                Notes
              </button>
              <button
                className={`tab flex-1 ${
                  rightColumnView === "tools" ? "tab-active" : ""
                }`}
                onClick={() => setRightColumnView("tools")}
              >
                Tools
              </button>
            </div>

            {/* Search Input - Only show for Notes view */}
            {rightColumnView === "notes" && (
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            )}
          </div>

          <div
            className="flex-1 overflow-y-auto pr-2"
            id="booknook-previousnotes"
          >
            {rightColumnView === "notes" ? (
              <div className="space-y-3">
                {!selectedBook ? (
                  <div className="h-full flex items-center justify-center mt-4">
                    <p>Select a book to view notes</p>
                  </div>
                ) : bookStickys.length === 0 ? (
                  <div className="h-full flex items-center justify-center mt-4">
                    <p className="m-auto">
                      No notes yet. Start by adding a Session Note!
                    </p>
                  </div>
                ) : (
                  bookStickys
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
                        tabIndex={0}
                        className="collapse collapse-arrow border-base-300 border mt-2"
                      >
                        <input type="checkbox" />
                        <div className="collapse-title text-xl font-medium">
                          {sticky.label}
                        </div>
                        <div className="collapse-content">
                          <ReactMarkdown>{sticky.content}</ReactMarkdown>
                        </div>
                      </div>
                    ))
                )}
              </div>
            ) : (
              <div>
                {user ? (
                  <div className="space-y-4">
                    <PaidFeatureWrapper userId={user.id}>
                      <div className="card card-compact bg-base-100 shadow-xl">
                        <div className="card-body">
                          <div className="flex gap-2">
                            <h2 className="card-title">Translation</h2>
                            <TooltipHelper
                              content={
                                "The translation widget allows you to translate any word quickly."
                              }
                              place="top-start"
                            />
                          </div>
                          <TranslationWidget />
                        </div>
                      </div>
                    </PaidFeatureWrapper>
                    <PaidFeatureWrapper userId={user.id}>
                      <div className="card card-compact bg-base-100 shadow-xl">
                        <div className="card-body">
                          <div className="flex gap-2">
                            <h2 className="card-title">Dictionary</h2>
                            <TooltipHelper
                              content={
                                "The translation widget allows you to search any word quickly."
                              }
                              place="top-start"
                            />
                          </div>
                          <DictionaryWidget />
                        </div>
                      </div>
                    </PaidFeatureWrapper>
                  </div>
                ) : null}

                {/* Add more tools here */}
              </div>
            )}
          </div>

          {/* Bottom Action - Log Session / Bookmark - Only show on Session Note tab */}
          {tab === "Session Note" && (
            <div
              className="mt-4 space-y-2 hidden md:block"
              id="booknook-logsession"
            >
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Custom Label (optional)"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
              />
              <div className="join w-full">
                <input
                  type="number"
                  className="join-item input input-bordered w-1/2"
                  placeholder="Page Start"
                  value={startPage || ""}
                  onChange={(e) => setStartPage(Number(e.target.value))}
                />
                <input
                  type="number"
                  className="join-item input input-bordered w-1/2"
                  placeholder="Page End"
                  value={endPage || ""}
                  onChange={(e) => setEndPage(Number(e.target.value))}
                />
              </div>
              <button
                className="btn btn-primary w-full"
                onClick={handleLogSession}
              >
                Log Session
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Timer finished modal */}
      <dialog id="timer_modal" className="modal">
        <div className="modal-box bg-base-100">
          <h3 className="font-bold text-lg">Reading Session Finished!</h3>
          <p className="py-4">
            Would you like to extend the timer or log your session?
          </p>
          <div className="space-y-4">
            <div className="join w-full">
              <input
                type="number"
                className="join-item input input-bordered w-1/3"
                placeholder="Hours"
                min="0"
                max="99"
                onChange={(e) =>
                  setHours(
                    Math.min(99, Math.max(0, parseInt(e.target.value) || 0))
                  )
                }
              />
              <input
                type="number"
                className="join-item input input-bordered w-1/3"
                placeholder="Minutes"
                min="0"
                max="59"
                onChange={(e) =>
                  setMinutes(
                    Math.min(59, Math.max(0, parseInt(e.target.value) || 0))
                  )
                }
              />
              <input
                type="number"
                className="join-item input input-bordered w-1/3"
                placeholder="Seconds"
                min="0"
                max="59"
                onChange={(e) =>
                  setSeconds(
                    Math.min(59, Math.max(0, parseInt(e.target.value) || 0))
                  )
                }
              />
            </div>
            <div className="modal-action">
              <form method="dialog" className="flex gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setIsTimerRunning(true);
                    if (!sessionStartTime) {
                      setSessionStartTime(new Date());
                    }
                    const interval = setInterval(() => {
                      setSeconds((s) => {
                        if (s === 0) {
                          if (minutes === 0 && hours === 0) {
                            if (timerInterval) clearInterval(timerInterval);
                            setIsTimerRunning(false);
                            setTimerInterval(null);
                            (
                              document.getElementById(
                                "timer_modal"
                              ) as HTMLDialogElement
                            )?.showModal();
                            return 0;
                          }
                          setMinutes((m) => {
                            if (m === 0) {
                              if (hours > 0) {
                                setHours((h) => h - 1);
                                return 59;
                              }
                              return 0;
                            }
                            return m - 1;
                          });
                          return 59;
                        }
                        return s - 1;
                      });
                    }, 1000);
                    setTimerInterval(interval);
                  }}
                >
                  Extend Session
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    // Just close the modal
                  }}
                >
                  Log Session
                </button>
              </form>
            </div>
          </div>
        </div>
      </dialog>
      <CongratulationsModalSession
        isOpen={showCongrats}
        onClose={() => setShowCongrats(false)}
        pagesRead={pagesRead}
        sessionStartTime={sessionStartTime}
        readingSessionId={readingSessionID}
      />
    </div>
  );
}
