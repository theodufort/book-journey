import { useEffect, useState, useCallback } from "react";
import PaidFeatureWrapper from "./PaidFeatureWrapper";
import { useTranslations } from "next-intl";
import { Clock, Mic, MicOff } from "lucide-react";
import {
  User,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { Volume } from "@/interfaces/GoogleAPI";
import { Database } from "@/types/supabase";
import CongratulationsModalSession from "./CongratulationsModalSession";

export default function BookNook1() {
  const t = useTranslations("BookNook2");
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
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(123);
  const [startPage, setStartPage] = useState<number>(0);
  const [endPage, setEndPage] = useState<number>(0);
  const [dailyNoteContent, setDailyNoteContent] = useState("");
  const [reviewContent, setreviewContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [autoFormatEnabled, setAutoFormatEnabled] = useState(true);
  const [autoCleanEnabled, setAutoCleanEnabled] = useState(true);
  const [isLoadingreview, setIsLoadingreview] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const [isSessionNoteEditMode, setIsSessionNoteEditMode] = useState(true);
  const [textToTranslate, setTextToTranslate] = useState("");
  const [targetLang, setTargetLang] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);
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
        .from("main_notes")
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
      const { data, error } = await supabase.from("main_notes").upsert(
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
      <div className="flex flex-col md:flex-row h-full rounded shadow-lg bg-[#FFF2D7]/90 overflow-y-auto md:overflow-hidden">
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
            <div className="flex items-center gap-4 w-full md:w-auto">
              <select
                className="select select-bordered select-sm w-full md:w-auto md:max-w-[200px]"
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
              <div className="flex items-center gap-2">
                {isTimerRunning ? (
                  <div className="countdown font-mono text-2xl">
                    <span
                      style={
                        { "--value": Math.abs(hours) } as React.CSSProperties
                      }
                    ></span>
                    :
                    <span
                      style={
                        { "--value": Math.abs(minutes) } as React.CSSProperties
                      }
                    ></span>
                    :
                    <span
                      style={
                        { "--value": Math.abs(seconds) } as React.CSSProperties
                      }
                    >
                      {seconds < 0 ? "-" : ""}
                    </span>
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
                      const interval = setInterval(() => {
                        setSeconds((s) => {
                          if (s === 0) {
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
                          return s - 1;
                        });
                      }, 1000);
                      setTimerInterval(interval);
                    }
                  }}
                >
                  {isTimerRunning ? "Stop" : "Start"}
                </button>
              </div>
            </div>
          </div>

          {/* Session Note or review Content */}
          <div className="flex-1 flex gap-2 h-full">
            <div className="flex-1 card card-bordered p-3 relative h-full">
              {tab === "Session Note" && (
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Session Note</h2>
                    <button
                      className={`btn btn-sm ${
                        isSessionNoteEditMode ? "btn-primary" : "btn-secondary"
                      }`}
                      onClick={() =>
                        setIsSessionNoteEditMode(!isSessionNoteEditMode)
                      }
                    >
                      {isSessionNoteEditMode ? "Preview" : "Edit"}
                    </button>
                  </div>
                  <div className="relative flex-1 w-full mb-4">
                    {isSessionNoteEditMode ? (
                      <textarea
                        className="w-full h-full textarea textarea-primary"
                        placeholder="Write here..."
                        value={dailyNoteContent}
                        onChange={(e) => setDailyNoteContent(e.target.value)}
                      />
                    ) : (
                      <div className="prose prose-sm max-w-none h-full overflow-y-auto p-4 rounded-lg">
                        <ReactMarkdown>{dailyNoteContent}</ReactMarkdown>
                      </div>
                    )}
                    {/* 
                    <PaidFeatureWrapper feature="AI Translation">*/}
                    <div className="absolute bottom-2 right-2 flex gap-2 items-center">
                      <div className="flex gap-2">
                        <label className="cursor-pointer label">
                          <span className="label-text mr-2">Auto-Format</span>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={autoFormatEnabled}
                            onChange={(e) =>
                              setAutoFormatEnabled(e.target.checked)
                            }
                          />
                        </label>
                        <label className="cursor-pointer label">
                          <span className="label-text mr-2">Auto-Clean</span>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={autoCleanEnabled}
                            onChange={(e) =>
                              setAutoCleanEnabled(e.target.checked)
                            }
                          />
                        </label>
                      </div>
                      {audioPreview && !isRecording && (
                        <>
                          <audio src={audioPreview} controls className="h-10" />
                          <button
                            className="btn btn-primary"
                            onClick={async () => {
                              setIsTranscribing(true);
                              try {
                                const response = await fetch(audioPreview);
                                const audioBlob = await response.blob();

                                const formData = new FormData();
                                formData.append("file", audioBlob);
                                formData.append(
                                  "autoFormat",
                                  autoFormatEnabled.toString()
                                );
                                formData.append(
                                  "autoClean",
                                  autoCleanEnabled.toString()
                                );

                                const transcribeResponse = await fetch(
                                  "/api/ai/notes/speech-to-text",
                                  {
                                    method: "POST",
                                    body: formData,
                                  }
                                );

                                if (!transcribeResponse.ok)
                                  throw new Error("Transcription failed");

                                const data = await transcribeResponse.json();
                                setDailyNoteContent((prev) =>
                                  prev ? `${prev}\n\n${data.text}` : data.text
                                );
                                setAudioPreview(null);
                              } catch (error) {
                                console.error(
                                  "Error transcribing audio:",
                                  error
                                );
                                toast.error("Failed to transcribe audio");
                              } finally {
                                setIsTranscribing(false);
                              }
                            }}
                            disabled={isTranscribing}
                          >
                            {isTranscribing ? (
                              <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                              "Transcribe"
                            )}
                          </button>
                        </>
                      )}
                      {audioPreview && !isRecording && (
                        <button
                          className="btn btn-circle btn-ghost"
                          onClick={() => setAudioPreview(null)}
                          title="Clear recording"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                      <button
                        className={`btn btn-circle ${
                          isRecording ? "btn-error" : "btn-primary"
                        }`}
                        onClick={async () => {
                          if (isRecording) {
                            // Stop recording
                            mediaRecorder?.stop();
                            setIsRecording(false);
                          } else {
                            // Clear any existing audio preview
                            setAudioPreview(null);

                            try {
                              const stream =
                                await navigator.mediaDevices.getUserMedia({
                                  audio: true,
                                });
                              const recorder = new MediaRecorder(stream);
                              const chunks: BlobPart[] = [];

                              recorder.ondataavailable = (e) =>
                                chunks.push(e.data);
                              recorder.onstop = () => {
                                const audioBlob = new Blob(chunks, {
                                  type: "audio/mp3",
                                });
                                const audioUrl = URL.createObjectURL(audioBlob);
                                setAudioPreview(audioUrl);

                                // Stop all tracks
                                stream
                                  .getTracks()
                                  .forEach((track) => track.stop());
                              };

                              setMediaRecorder(recorder);
                              recorder.start();
                              setIsRecording(true);
                            } catch (error) {
                              console.error(
                                "Error accessing microphone:",
                                error
                              );
                              toast.error("Failed to access microphone");
                            }
                          }
                        }}
                      >
                        {isRecording ? <MicOff /> : <Mic />}
                      </button>
                    </div>
                    {/*</PaidFeatureWrapper> */}
                  </div>

                  {/* Questions Section */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Questions</h3>
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
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Review</h2>
                    <button
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
                    </button>
                  </div>
                  {isEditMode ? (
                    <textarea
                      className="flex-1 w-full textarea textarea-primary mb-4"
                      style={{ backgroundColor: "#FFF2D7" }}
                      placeholder="Write your review here..."
                      value={reviewContent}
                      onChange={(e) => setreviewContent(e.target.value)}
                      disabled={isLoadingreview}
                    />
                  ) : (
                    <div className="flex-1 overflow-y-auto prose prose-sm max-w-none mb-4">
                      <ReactMarkdown>{reviewContent}</ReactMarkdown>
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Questions</h3>
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
        <div className="w-full md:w-96 flex-shrink-0 p-2 md:border-l border-t md:border-t-0 flex flex-col h-full">
          <div className="flex-none space-y-4">
            {/* <h2 className="text-lg font-semibold">Stickies / Session Notes</h2> */}

            {/* <PaidFeatureWrapper feature="AI Translation"> */}
            <div className="space-y-3">
              <div className="join w-full">
                <input
                  type="text"
                  placeholder="Text to translate..."
                  className="join-item input input-bordered w-3/4 "
                  value={textToTranslate}
                  onChange={(e) => setTextToTranslate(e.target.value)}
                />
                <select
                  className="join-item select select-bordered w-1/4 "
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                >
                  <option value="en">EN</option>
                  <option value="es">ES</option>
                  <option value="fr">FR</option>
                  <option value="de">DE</option>
                  <option value="it">IT</option>
                  <option value="pt">PT</option>
                  <option value="ru">RU</option>
                  <option value="ja">JA</option>
                  <option value="ko">KO</option>
                  <option value="zh">ZH</option>
                </select>
              </div>
              <button
                className="btn btn-primary btn-sm w-full"
                onClick={async () => {
                  if (!textToTranslate) return;

                  setIsTranslating(true);
                  try {
                    const response = await fetch(
                      "https://translate.mybookquest.com/translate",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          q: textToTranslate,
                          source: "auto",
                          target: targetLang,
                        }),
                      }
                    );

                    if (!response.ok) throw new Error("Translation failed");

                    const data = await response.json();
                    setTextToTranslate(data.translatedText);
                  } catch (error) {
                    console.error("Translation error:", error);
                    toast.error("Translation failed");
                  } finally {
                    setIsTranslating(false);
                  }
                }}
                disabled={isTranslating}
              >
                {isTranslating ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Translate"
                )}
              </button>
            </div>
            {/* </PaidFeatureWrapper>  */}
            <input
              type="text"
              className="input input-bordered w-full "
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto mt-4 pr-2">
            <div className="space-y-3">
              {!selectedBook ? (
                <div className="h-full flex items-center justify-center">
                  <p>Select a book to view notes</p>
                </div>
              ) : bookStickys.length === 0 ? (
                <div className="h-full flex items-center justify-center">
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
                      className="collapse collapse-arrow border-base-300 border"
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
          </div>

          {/* Bottom Action - Log Session / Bookmark - Only show on Session Note tab */}
          {tab === "Session Note" && (
            <div className="mt-4 space-y-2">
              <input
                type="text"
                className="input input-bordered w-full "
                placeholder="Custom Label (optional)"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
              />
              <div className="join w-full">
                <input
                  type="number"
                  className="join-item input input-bordered w-1/2 "
                  placeholder="Page Start"
                  value={startPage || ""}
                  onChange={(e) => setStartPage(Number(e.target.value))}
                />
                <input
                  type="number"
                  className="join-item input input-bordered w-1/2 "
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
