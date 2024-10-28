"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface BookModification {
  id: number;
  created_at: string;
  isbn_13: string;
  title?: string;
  description?: string;
  page_count?: number;
}

export default function ReviewDetail({ params }: { params: { id: string } }) {
  const [modification, setModification] = useState<BookModification | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchModification() {
      const { data, error } = await supabase
        .from("books_modifications")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        console.error("Error fetching modification:", error);
        router.push("/admin/books/review");
      } else {
        setModification(data);
      }
    }

    fetchModification();
  }, [params.id, supabase, router]);

  if (!modification) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Review Modification Request</h1>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">ISBN: {modification.isbn_13}</h2>
          
          {modification.title && (
            <div className="mb-4">
              <h3 className="font-bold">Title Change:</h3>
              <p>{modification.title}</p>
            </div>
          )}

          {modification.description && (
            <div className="mb-4">
              <h3 className="font-bold">Description Change:</h3>
              <p>{modification.description}</p>
            </div>
          )}

          {modification.page_count && (
            <div className="mb-4">
              <h3 className="font-bold">Page Count Change:</h3>
              <p>{modification.page_count}</p>
            </div>
          )}

          <div className="text-sm text-gray-500">
            Submitted on: {new Date(modification.created_at).toLocaleString()}
          </div>

          <div className="card-actions justify-end mt-4">
            <button 
              className="btn btn-primary"
              onClick={() => router.push("/admin/books/review")}
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
