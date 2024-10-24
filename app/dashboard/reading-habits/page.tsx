"use client";
import HeaderDashboard from "@/components/DashboardHeader";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function ReadingHabits() {
  const t = useTranslations("ReadingHabits");
  const [periodicity, setPeriodicity] = useState("daily");
  const [metric, setMetric] = useState("books_read");
  const [value, setValue] = useState("1");
  const [description, setDescription] = useState("");
  const supabase = createClientComponentClient<Database>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = Math.max(1, parseInt(value, 10));
    if (isNaN(numericValue)) {
      alert(t("value_error"));
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase.from("habits").insert([
        {
          user_id: user.id,
          periodicity,
          metric,
          value: numericValue.toString(),
          description: description || null,
        },
      ]);

      if (error) {
        console.error("Error inserting habit:", error);
        alert(t("insert_error"));
      } else {
        console.log("Habit inserted successfully:", data);
        // Close the modal and reset form
        document.getElementById("my_modal_3").close();
        setPeriodicity("daily");
        setMetric("books_read");
        setValue("");
        setDescription("");
        alert(t("insert_success"));
      }
    }
  };
  return (
    <main className="min-h-screen p-4 sm:p-8 pb-16">
      <section className="max-w-6xl mx-auto space-y-4 sm:space-y-8">
        <div className="sticky top-0 z-50 bg-base-100">
          <HeaderDashboard />
        </div>
        <div className="flex pt-4">
          <h1 className="text-2xl md:text-4xl font-extrabold  my-auto">
            {t("title")}
          </h1>
          <button
            className="btn btn-primary float-end ml-auto mr-0 my-auto"
            onClick={() => document.getElementById("my_modal_3").showModal()}
          >
            <span className="hidden md:block">{t("add_habit")}</span>
            <span className="block md:hidden text-2xl">+</span>
          </button>
        </div>
        <div className="space-y-8">
          <dialog id="my_modal_3" className="modal">
            <div className="modal-box">
              <form onSubmit={handleSubmit}>
                <button
                  type="button"
                  className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                  onClick={() => document.getElementById("my_modal_3").close()}
                >
                  ✕
                </button>
                <h3 className="font-bold text-lg">{t("add_new_habit")}</h3>
                <div className="form-control w-full max-w-xs">
                  <label className="label">
                    <span className="label-text">{t("periodicity")}</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={periodicity}
                    onChange={(e) => setPeriodicity(e.target.value)}
                  >
                    <option value="daily">{t("daily")}</option>
                    <option value="weekly">{t("weekly")}</option>
                    <option value="monthly">{t("monthly")}</option>
                    <option value="yearly">{t("yearly")}</option>
                  </select>
                </div>
                <div className="form-control w-full max-w-xs">
                  <label className="label">
                    <span className="label-text">{t("metric")}</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={metric}
                    onChange={(e) => setMetric(e.target.value)}
                  >
                    <option value="books_read">{t("books_read")}</option>
                    <option value="pages_read">{t("pages_read")}</option>
                  </select>
                </div>
                <div className="form-control w-full max-w-xs">
                  <label className="label">
                    <span className="label-text">{t("value")}</span>
                  </label>
                  <input
                    type="number"
                    placeholder={t("enter_value")}
                    className="input input-bordered w-full max-w-xs"
                    value={value}
                    onChange={(e) => setValue(Math.max(1, parseInt(e.target.value, 10)).toString())}
                    min="1"
                    required
                  />
                </div>
                <div className="form-control w-full max-w-xs">
                  <label className="label">
                    <span className="label-text">{t("description")}</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24"
                    placeholder={t("enter_description")}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
                <div className="modal-action">
                  <button type="submit" className="btn btn-primary">
                    {t("save")}
                  </button>
                </div>
              </form>
            </div>
          </dialog>
        </div>
      </section>
    </main>
  );
}
