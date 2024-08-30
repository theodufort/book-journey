"use client";
import HeaderDashboard from "@/components/DashboardHeader";
import { ReadingListItem } from "@/interfaces/Dashboard";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export default function BookNotes() {
  const supabase = createClientComponentClient<Database>();
  const [readingList, setReadingList] = useState<ReadingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<{ [bookId: string]: string }>({});
  const [selectedBook, setSelectedBook] = useState<ReadingListItem | null>(
    null
  );

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
    const { data, error } = await supabase
      .from("reading_list")
      .select("*")
      .eq("user_id", user?.id);

    if (error) {
      console.error("Error fetching reading list:", error);
    } else {
      setReadingList(data || []);
    }
    setLoading(false);
  };

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("book_notes")
      .select("book_id, notes")
      .eq("user_id", user?.id);

    if (error) {
      console.error("Error fetching notes:", error);
    } else {
      const notesObj = data?.reduce((acc, item) => {
        acc[item.book_id] = item.notes;
        return acc;
      }, {});
      setNotes(notesObj);
    }
  };

  const handleNoteChange = (bookId: string, note: string) => {
    setNotes((prev) => ({ ...prev, [bookId]: note }));
  };

  const saveNote = async () => {
    if (!selectedBook) return;

    const { error } = await supabase.from("book_notes").upsert({
      user_id: user?.id,
      book_id: selectedBook.book_id,
      notes: notes[selectedBook.book_id] || "",
    });

    if (error) {
      console.error("Error saving note:", error);
    } else {
      console.log("Note saved successfully");
    }
  };

  return (
    <main className="min-h-screen p-4 sm:p-8 pb-24">
      <section className="max-w-6xl mx-auto space-y-4 sm:space-y-8">
        <HeaderDashboard />
        <h1 className="text-2xl md:text-4xl font-extrabold  my-auto">
          Book Notes
        </h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="flex">
              <div className="w-1/3 border-r">
                <h2 className="text-xl font-semibold p-4 bg-gray-50 border-b">
                  Your Reading List
                </h2>
                <ul className="divide-y">
                  {readingList.map((book) => (
                    <li
                      key={book.book_id}
                      className={`cursor-pointer p-4 hover:bg-gray-50 transition-colors ${
                        selectedBook?.book_id === book.book_id
                          ? "bg-blue-50"
                          : ""
                      }`}
                      onClick={() => setSelectedBook(book)}
                    >
                      {book.title}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-2/3 p-6">
                {selectedBook ? (
                  <>
                    <h2 className="text-2xl font-semibold mb-4">
                      {selectedBook.title}
                    </h2>
                    <textarea
                      className="w-full h-64 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={notes[selectedBook.book_id] || ""}
                      onChange={(e) =>
                        handleNoteChange(selectedBook.book_id, e.target.value)
                      }
                      placeholder="Enter your notes here..."
                    />
                    <button
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      onClick={saveNote}
                    >
                      Save Note
                    </button>
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
