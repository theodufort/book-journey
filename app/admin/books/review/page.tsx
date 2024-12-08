"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";

interface BookModification {
  id: number;
  created_at: string;
  isbn_13: string;
  title?: string;
  description?: string;
  page_count?: number;
  is_reviewed: boolean;
}

export default function BooksReview() {
  const [modifications, setModifications] = useState<BookModification[]>([]);
  const [filter, setFilter] = useState<'all' | 'reviewed' | 'unreviewed'>('all');
  const supabase = createClientComponentClient();
  useEffect(() => {
    async function fetchModifications() {
      const { data, error } = await supabase
        .from("books_modifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching modifications:", error);
      } else {
        setModifications(data || []);
      }
    }

    fetchModifications();
  }, [supabase]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          Book Information Modification Requests
        </h1>
        <select 
          className="select select-bordered w-full max-w-xs"
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'reviewed' | 'unreviewed')}
        >
          <option value="all">All Modifications</option>
          <option value="reviewed">Reviewed Only</option>
          <option value="unreviewed">Unreviewed Only</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>ISBN</th>
              <th>Title</th>
              <th>Page Count</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {modifications
              .filter(mod => {
                if (filter === 'all') return true;
                if (filter === 'reviewed') return mod.is_reviewed;
                return !mod.is_reviewed;
              })
              .map((mod) => (
              <tr
                key={mod.id}
                className="hover:bg-base-200 cursor-pointer"
                onClick={() =>
                  (window.location.href = `/admin/books/review/${mod.id}`)
                }
              >
                <td>{mod.id}</td>
                <td>{mod.isbn_13}</td>
                <td>{mod.title || "No changes"}</td>
                <td>{mod.page_count || "No changes"}</td>
                <td>{new Date(mod.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {modifications.filter(mod => {
              if (filter === 'all') return true;
              if (filter === 'reviewed') return mod.is_reviewed;
              return !mod.is_reviewed;
            }).length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No modifications found for the selected filter
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
