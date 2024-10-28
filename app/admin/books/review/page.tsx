"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";

interface BookModification {
  id: number;
  created_at: string;
  isbn_13: string;
  title?: string;
  description?: string;
  page_count?: number;
}

export default function BooksReview() {
  const [modifications, setModifications] = useState<BookModification[]>([]);
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
      <h1 className="text-2xl font-bold mb-4">Book Information Modification Requests</h1>
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
            {modifications.map((mod) => (
              <tr 
                key={mod.id}
                className="hover:bg-base-200 cursor-pointer"
                onClick={() => window.location.href = `/admin/books/review/${mod.id}`}
              >
                <td>{mod.id}</td>
                <td>{mod.isbn_13}</td>
                <td>{mod.title || "No changes"}</td>
                <td>{mod.page_count || "No changes"}</td>
                <td>{new Date(mod.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
