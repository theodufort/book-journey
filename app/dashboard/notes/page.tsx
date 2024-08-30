"use client";
import HeaderDashboard from "@/components/DashboardHeader";
import { ReadingListItem } from "@/interfaces/Dashboard";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useEffect, useState, useRef, useMemo } from "react";
import { Volume } from "@/interfaces/GoogleAPI";

export default function BookNotes() {
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
  const notesContainerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReadingList = useMemo(() => {
    return readingList.filter((book) =>
      book.data.volumeInfo.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [readingList, searchQuery]);

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
      fetchNotes();
    }
  }, [user]);

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
              const response = await fetch(`/api/books/${item.book_id}`);
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

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("book_notes")
      .select("book_id, notes, updated_at")
      .eq("user_id", user?.id);

    if (error) {
      console.error("Error fetching notes:", error);
    } else {
      const notesObj = data?.reduce((acc, item) => {
        acc[item.book_id] = {
          content: item.notes,
          lastUpdated: item.updated_at,
        };
        return acc;
      }, {});
      setNotes(notesObj);
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
        update: ["notes", "updated_at"],
      }
    );

    if (error) {
      console.error("Error saving note:", error);
    } else {
      console.log("Note saved successfully");
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
    <main className="min-h-screen p-4 sm:p-8 pb-24">
      <Footer />
      <section className="max-w-6xl mx-auto space-y-4 sm:space-y-8">
        <HeaderDashboard />
        <h1 className="text-2xl md:text-4xl font-extrabold  my-auto">
          Book Notes
        </h1>
        {loading ? (
          <main className="min-h-screen p-8 pb-24 flex items-center justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </main>
        ) : (
          <div className="bg-base-200 shadow-md rounded-lg overflow-hidden">
            <div className="flex">
              <div className="w-1/3 border-r">
                <div className="p-4 bg-base-200 border-b">
                  <h2 className="text-xl font-semibold mb-2">Your Notes</h2>
                  <input
                    type="text"
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>
                <ul className="divide-y overflow-y-auto max-h-[calc(100vh-250px)]">
                  {filteredReadingList.map((book) => (
                    <li
                      key={book.book_id}
                      className={`cursor-pointer p-4 transition-colors ${
                        selectedBook?.book_id === book.book_id
                          ? "bg-base-200"
                          : ""
                      }`}
                      onClick={() => setSelectedBook(book)}
                    >
                      <h3 className="font-semibold">
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
                        No books found matching your search.
                      </li>
                    )}
                </ul>
              </div>
              <div className="w-2/3 p-6">
                {selectedBook ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h2 className="text-2xl font-semibold">
                          {selectedBook.data.volumeInfo.title}
                        </h2>
                        <p className="text-gray-600">
                          {selectedBook.data.volumeInfo.authors?.join(", ")}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Last Updated:{" "}
                          {notes[selectedBook.book_id]?.lastUpdated
                            ? new Date(
                                notes[selectedBook.book_id].lastUpdated
                              ).toLocaleString()
                            : "Not saved yet"}
                        </p>
                      </div>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        onClick={() => {
                          if (isEditMode) {
                            saveNote();
                          }
                          setIsEditMode(!isEditMode);
                        }}
                      >
                        {isEditMode ? "Save & View" : "Edit"}
                      </button>
                    </div>
                    <div
                      ref={notesContainerRef}
                      className="flex flex-col h-[calc(100vh-300px)]"
                    >
                      {isEditMode ? (
                        <>
                          <textarea
                            className="flex-grow w-full p-3  rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-2"
                            value={notes[selectedBook.book_id]?.content || ""}
                            onChange={(e) =>
                              handleNoteChange(
                                selectedBook.book_id,
                                e.target.value
                              )
                            }
                            placeholder="Enter your notes here..."
                          />
                        </>
                      ) : (
                        <div className="flex-grow w-full p-3 rounded-md bg-base-200 overflow-y-auto whitespace-pre-wrap">
                          {notes[selectedBook.book_id]?.content ||
                            "No notes yet."}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-center mt-8">
                    Select a book to add notes
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
const Footer = () => (
  <footer className="fixed bottom-0 left-0 right-0 bg-base-300 text-center py-1 text-xs">
    Download the app
  </footer>
);
