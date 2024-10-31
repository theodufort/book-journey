"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";

interface BookModification {
  isbn_13: string;
  title?: string;
  description?: string;
  page_count?: number;
}

export default function ReviewBookInfo({
  isbn,
  userid,
}: {
  isbn: string;
  userid: string;
}) {
  const t = useTranslations("ReviewBookInfo");
  const [modification, setModification] = useState<BookModification>({
    isbn_13: isbn,
    title: "",
    description: "",
    page_count: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("books_modifications")
        .insert([modification]);

      if (error) throw error;

      toast.success(t("success"));
      setModification({
        isbn_13: isbn,
        title: "",
        description: "",
        page_count: undefined,
      });

      // Close the modal after successful submission
      const modalElement = document.getElementById(
        "review_modal"
      ) as HTMLDialogElement;
      if (modalElement) {
        modalElement.close();
      }
    } catch (error) {
      toast.error(t("error"));
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
          const modalElement = document.getElementById(
            "review_modal"
          ) as HTMLDialogElement;
          if (modalElement) {
            modalElement.showModal();
          }
        }}
      >
        {t("button")}
      </button>

      <dialog id="review_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">{t("title")}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t("field_title")}</span>
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
                <span className="label-text">{t("field_description")}</span>
              </label>
              <textarea
                className="textarea textarea-bordered textarea-primary"
                rows={3}
                value={modification.description || ""}
                onChange={(e) =>
                  setModification({
                    ...modification,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">{t("field_pagecount")}</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={modification.page_count || ""}
                min="1"
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setModification({
                    ...modification,
                    page_count: value > 0 ? value : undefined,
                  });
                }}
              />
            </div>

            <div className="modal-action">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("submitting") : t("submit")}
              </button>
              <form method="dialog">
                <button className="btn">{t("close")}</button>
              </form>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
