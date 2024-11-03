"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

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
        setError("Error fetching note");
        console.error("Error:", error);
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

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );

  const readingTime = calculateReadingTime();
  const pagesRead = session ? session.end_page - session.start_page : 0;

  return (
    <div>
      <Header />
      <main className="min-h-screen p-8 pb-24">
        <section className="max-w-6xl mx-auto space-y-8">
          <div className="stats shadow w-full">
            <div className="stat">
              <div className="stat-title">Pages Read</div>
              <div className="stat-value">{pagesRead}</div>
              <div className="stat-desc">
                From page {session?.start_page} to {session?.end_page}
              </div>
            </div>

            {readingTime && (
              <div className="stat">
                <div className="stat-title">Time Read</div>
                <div className="stat-value">{readingTime} min</div>
                <div className="stat-desc">
                  {session?.started_at &&
                    new Date(session.started_at).toLocaleString()}{" "}
                  -
                  {session?.ended_at &&
                    new Date(session.ended_at).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {session?.notes.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Notes Taken</h2>
              {session.notes.map((note, index) => (
                <div key={index} className="bg-base-200 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">{note.label}</h3>
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
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
