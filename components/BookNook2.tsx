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
  const t = useTranslations("BookNook");
  const [selectedBook, setSelectedBook] = useState<Volume | null>(null);
  const [readingList, setReadingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  const [bookStickys, setBookStickys] = useState<Record<string, any>>({});
  const [newNoteContent, setNewNoteContent] = useState("");
  const [tab, setTab] = useState("Daily Note");
  const [timer, setTimer] = useState(1800); // 30 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentPage, setCurrentPage] = useState(123);

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
    // Fetch logic for reading list...
    setLoading(false);
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
    <div className="h-full w-full p-4">
      <div className="flex flex-col md:flex-row h-full rounded shadow-lg">
        {/* Left Column: Note-taking Section */}
        <div className="flex-1 flex flex-col p-4">
          {/* Tabs for Daily Note and Recap */}
          <div className="flex justify-between items-center mb-4">
            <div class="tabs tabs-boxed">
              <button
                onClick={() => setTab("Daily Note")}
                className={`tab ${tab === "Daily Note" ? "tab-active" : ""}`}
              >
                Daily Note
              </button>
              <button
                onClick={() => setTab("Recap")}
                className={`tab ${tab === "Recap" ? "tab-active" : ""}`}
              >
                Recap
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span className="font-mono">
                {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Daily Note or Recap Content */}
          <div className="flex-1 card card-bordered p-6 relative">
            {tab === "Daily Note" && (
              <div className="h-full flex flex-col">
                <h2 className="text-xl font-semibold mb-4">Daily Note</h2>
                <textarea
                  className="flex-1 w-full bg-transparent resize-none focus:outline-none"
                  placeholder="# Characters

# Plot

# Thoughts

Or free form..."
                />
                <div className="absolute bottom-4 left-6 text-sm opacity-70">
                  P. {currentPage}
                </div>
              </div>
            )}
            {tab === "Recap" && (
              <div className="h-full">
                <h2 className="text-xl font-semibold mb-4">Recap</h2>
                <textarea
                  className="w-full h-[calc(100%-2rem)] bg-transparent resize-none focus:outline-none"
                  placeholder="Write your recap here..."
                />
              </div>
            )}
          </div>

          {/* Bottom Action - Log Session / Bookmark */}
          <div className="mt-4">
            <button className="btn btn-primary btn-block">
              Log Session / Bookmark
            </button>
          </div>
        </div>

        {/* Right Column: Stickies / Quick Notes */}
        <div className="w-80 flex-shrink-0 p-4 border-l">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Stickies / Quick Notes</h2>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Search notes..."
                className="input input-bordered w-full"
              />
              <div className="flex gap-2">
                <button className="btn btn-sm btn-outline">
                  Translate
                </button>
                <button className="btn btn-sm btn-outline">
                  Look Up
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Things to ponder...</h3>
              <textarea
                className="textarea textarea-bordered w-full min-h-[80px]"
                placeholder="Add new note..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
              />
              <button
                onClick={addStickyNote}
                className="btn btn-block btn-sm"
              >
                Add Note
              </button>
            </div>

            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className="card card-bordered p-3 relative"
                >
                  <p className="text-sm">Note {index}</p>
                  <span className="absolute bottom-2 right-2 text-xs opacity-70">
                    P. {index}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
