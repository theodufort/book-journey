"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/admin/layout";

interface APIResponse {
  v1: any;
  v2: any;
  v3: any;
}

interface BookModification {
  id: number;
  created_at: string;
  isbn_13: string;
  title?: string;
  description?: string;
  page_count?: number;
}

interface UpdateFields {
  title: string;
  description: string;
  page_count: string;
}

export default function ReviewDetail({ params }: { params: { id: string } }) {
  const [modification, setModification] = useState<BookModification | null>(
    null
  );
  const [apiResponses, setApiResponses] = useState<APIResponse>({
    v1: null,
    v2: null,
    v3: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [updateFields, setUpdateFields] = useState<UpdateFields>({
    title: "",
    description: "",
    page_count: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize the Supabase client
  const router = useRouter();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUpdateFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      // First get the current data
      const { data: currentBook, error: fetchError } = await supabase
        .from("books")
        .select("data")
        .eq("isbn_13", modification.isbn_13)
        .single();
      console.log(currentBook);
      if (fetchError) throw fetchError;

      // Create new data object with updates
      const newData = { ...currentBook.data };
      if (updateFields.title) newData.volumeInfo.title = updateFields.title;
      if (updateFields.description)
        newData.volumeInfo.description = updateFields.description;
      if (updateFields.page_count)
        newData.volumeInfo.pageCount = parseInt(updateFields.page_count);

      const updateData = {
        data: newData,
      };

      const { error } = await supabase
        .from("books")
        .update(updateData)
        .eq("isbn_13", modification.isbn_13);
      console.log(error);
      if (error) throw error;

      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error("Error updating modification:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch modification data
        const { data, error } = await supabase
          .from("books_modifications")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error) {
          console.error("Error fetching modification:", error);
          router.push("/admin/books/review");
          return;
        }
        setModification(data);

        // Fetch from all three API versions
        const [v1Response, v2Response, v3Response] = await Promise.all([
          fetch(`/api/books/${data.isbn_13}`).then((res) => res.json()),
          fetch(`/api/books/${data.isbn_13}/v2`).then((res) => res.json()),
          fetch(`/api/books/${data.isbn_13}/v3`).then((res) => res.json()),
        ]);

        setApiResponses({
          v1: v1Response,
          v2: v2Response,
          v3: v3Response,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [params.id, supabase, router]);

  if (!modification) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Review Modification Request</h1>
      <div className="card bg-base-200 shadow-xl">
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

          <div className="divider my-4"></div>

          <div className="flex flex-col gap-4">
            <h3 className="font-bold">Update Book Information:</h3>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <input
                type="text"
                name="title"
                value={updateFields.title}
                onChange={handleInputChange}
                placeholder="Enter new title"
                className="input input-bordered"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                name="description"
                value={updateFields.description}
                onChange={handleInputChange}
                placeholder="Enter new description"
                className="textarea textarea-bordered h-24"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Page Count</span>
              </label>
              <input
                type="number"
                name="page_count"
                value={updateFields.page_count}
                onChange={handleInputChange}
                placeholder="Enter new page count"
                className="input input-bordered"
              />
            </div>

            <div className="card-actions justify-end mt-4">
              <button
                className="btn btn-secondary"
                onClick={handleUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Data"}
              </button>
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

      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">API v1 Response</h2>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(apiResponses.v1, null, 2)}
              </pre>
            )}
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">API v2 Response</h2>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(apiResponses.v2, null, 2)}
              </pre>
            )}
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">API v3 Response</h2>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(apiResponses.v3, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
