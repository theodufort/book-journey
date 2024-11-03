"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { toast } from "react-hot-toast";

export default function ReadingSessionPage({
  params,
}: {
  params: { id: string };
}) {
  type ReadingSession = {
    start_page: number;
    end_page: number;
    started_at: string | null;
    ended_at: string | null;
    notes: Array<{ content: string; label: string }>;
  };

  const [session, setSession] = useState<ReadingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    async function fetchSession() {
      try {
        // Fetch reading session and related sticky notes
        const { data: sessionData, error: sessionError } = await supabase
          .from("reading_sessions")
          .select(
            `
            start_page,
            end_page,
            started_at,
            ended_at,
            sticky_notes (
              content,
              label
            )
          `
          )
          .eq("id", params.id)
          .single();

        if (sessionError) throw sessionError;

        if (sessionData) {
          setSession({
            ...sessionData,
            notes: sessionData.sticky_notes || [],
          });
        } else {
          setError("Reading session not found");
        }
      } catch (error) {
        const message = "Error fetching reading session";
        setError(message);
        console.error("Error:", error);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [params.id, supabase]);

  const calculateReadingTime = () => {
    if (!session?.started_at || !session?.ended_at) return null;
    const start = new Date(session.started_at);
    const end = new Date(session.ended_at);
    const diffInMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
    return diffInMinutes;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const readingTime = calculateReadingTime();
  const pagesRead = session ? session.end_page - session.start_page : 0;

  return (
    <div>
      <Header />
      <main className="min-h-screen p-8 pb-24">
        <section className="max-w-6xl mx-auto space-y-8">
          <div className="stats shadow w-full bg-base-200">
            <div className="stat">
              <div className="stat-title">Pages Read</div>
              <div className="stat-value">{pagesRead}</div>
              <div className="stat-desc">
                From page {session?.start_page} to {session?.end_page}
              </div>
            </div>

            {readingTime ? (
              <div className="stat">
                <div className="stat-title">Time Read</div>
                <div className="stat-value">{readingTime} min</div>
                <div className="stat-desc">
                  <div>
                    Start:{" "}
                    {session?.started_at && (
                      <>
                        <span>
                          {new Date(session.started_at).toLocaleDateString()}
                        </span>
                        {" at "}
                        <span>
                          {new Date(session.started_at).toLocaleTimeString()}
                        </span>
                      </>
                    )}
                  </div>
                  <div>
                    End:{" "}
                    {session?.ended_at && (
                      <>
                        <span>
                          {new Date(session.ended_at).toLocaleDateString()}
                        </span>
                        {" at "}
                        <span>
                          {new Date(session.ended_at).toLocaleTimeString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {session?.notes.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Notes Taken</h2>
              {session.notes.map((note, index) => (
                <div key={index} className="card bg-base-200">
                  <div className="card-body">
                    <h3 className="card-title">{note.label}</h3>
                    <div className="divider"></div>
                    <div className="prose">
                      <ReactMarkdown
                        className="prose"
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {note.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
