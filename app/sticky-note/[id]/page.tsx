"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

export default function StickyNotePage({ params }: { params: { id: string } }) {
  const [note, setNote] = useState<{ content: string; label: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    async function fetchNote() {
      try {
        const { data, error } = await supabase
          .from("session_notes")
          .select("content, label")
          .eq("id", params.id)
          .single();

        if (error) throw error;

        if (data) {
          setNote(data);
        } else {
          setError("Note not found");
        }
      } catch (error) {
        setError("Error fetching note");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNote();
  }, [params.id, supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="min-h-screen p-8 pb-24">
        <section className="max-w-6xl mx-auto space-y-8">
          {note && (
            <>
              <h1 className="text-2xl font-bold mb-4">{note.label}</h1>
              <div className="bg-base-200 p-4 rounded-lg">
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
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
