"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface BookModification {
  isbn_13: string;
  title?: string;
  description?: string;
  page_count?: number;
}

export default function ReviewBookInfo({ isbn }: { isbn: string }) {
  const [modification, setModification] = useState<BookModification>({
    isbn_13: isbn,
    title: "",
    description: "",
    page_count: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from("books_modifications")
        .insert([modification]);

      if (error) throw error;

      setMessage("Modification submitted successfully!");
      setModification({
        isbn_13: isbn,
        title: "",
        description: "",
        page_count: undefined,
      });
    } catch (error) {
      setMessage("Error submitting modification. Please try again.");
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Submit Book Information Update</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={modification.title || ""}
            onChange={(e) =>
              setModification({ ...modification, title: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
            value={modification.description || ""}
            onChange={(e) =>
              setModification({ ...modification, description: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Page Count
          </label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={modification.page_count || ""}
            onChange={(e) =>
              setModification({
                ...modification,
                page_count: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Update"}
        </button>

        {message && (
          <div
            className={`mt-2 p-2 rounded ${
              message.includes("Error")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
