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
      
      // Close the modal after successful submission
      const modalElement = document.getElementById("review_modal") as HTMLDialogElement;
      if (modalElement) {
        modalElement.close();
      }
    } catch (error) {
      setMessage("Error submitting modification. Please try again.");
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        className="btn btn-primary btn-sm mt-2 block" 
        onClick={() => {
          const modalElement = document.getElementById("review_modal") as HTMLDialogElement;
          if (modalElement) {
            modalElement.showModal();
          }
        }}
      >
        Report Missing Info
      </button>

      <dialog id="review_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Submit Book Information Update</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={modification.title || ""}
                onChange={(e) =>
                  setModification({ ...modification, title: e.target.value })
                }
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                rows={3}
                value={modification.description || ""}
                onChange={(e) =>
                  setModification({ ...modification, description: e.target.value })
                }
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Page Count</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={modification.page_count || ""}
                onChange={(e) =>
                  setModification({
                    ...modification,
                    page_count: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
              />
            </div>

            {message && (
              <div className={`alert ${message.includes("Error") ? "alert-error" : "alert-success"}`}>
                {message}
              </div>
            )}

            <div className="modal-action">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Update"}
              </button>
              <form method="dialog">
                <button className="btn">Close</button>
              </form>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
