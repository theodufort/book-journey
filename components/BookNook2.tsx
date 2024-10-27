import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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
          <div className="flex justify-between mb-4">
            <div className="flex gap-4">
              <button
                onClick={() => setTab("Daily Note")}
                className={`${
                  tab === "Daily Note"
                    ? "text-blue-600 border-b-2"
                    : "text-gray-500"
                } px-2`}
              >
                Daily Note
              </button>
              <button onClick={() => setTab("Recap")}>Recap</button>
            </div>
          </div>

          {/* Daily Note or Recap Content */}
          <div className="flex-1 border p-4 rounded-lg">
            {tab === "Daily Note" && (
              <div>
                <h2 className="text-lg font-semibold">Daily Note</h2>
                <p className="mt-2">We can have templates:</p>
                <div className="mt-2 space-y-1">
                  <p># Characters</p>
                  <p># Plot</p>
                  <p># Thoughts</p>
                  <p>Or free form...</p>
                </div>
              </div>
            )}
            {tab === "Recap" && <p>Recap content here...</p>}
          </div>

          {/* Bottom Action - Log Session / Bookmark */}
          <div className="mt-4">
            <button className="btn btn-primary w-full">
              Log Session / Bookmark
            </button>
          </div>
        </div>

        {/* Right Column: Stickies / Quick Notes */}
        <div className="w-64 flex-shrink-0 p-4">
          <div>
            <h2 className="text-lg font-semibold">Stickies / Quick Notes</h2>
            <div className="mt-2 space-y-2">
              <textarea
                className="textarea w-full"
                placeholder="Add new note..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
              />
              <button
                onClick={addStickyNote}
                className="btn btn-sm btn-secondary w-full"
              >
                Add Note
              </button>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium">Things to ponder...</h3>
            <div className="mt-2 space-y-1">
              <p>What is the meaning of life?</p>
              {/* Additional ponder entries */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
