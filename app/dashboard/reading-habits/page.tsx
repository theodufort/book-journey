"use client";
import HeaderDashboard from "@/components/DashboardHeader";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import EmojiPicker from "emoji-picker-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import ReadingHabitGrid from "@/components/ReadingHabitGrid";

export default function ReadingHabits() {
  const t = useTranslations("ReadingHabits");
  const [periodicity, setPeriodicity] = useState("daily");
  const [metric, setMetric] = useState("books_read");
  const [value, setValue] = useState("1");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("📚");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [habits, setHabits] = useState<any[]>([]);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id);
      if (error) {
        console.error("Error fetching habits:", error);
      } else {
        setHabits(data);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = Math.max(1, parseInt(value, 10));
    if (isNaN(numericValue)) {
      toast.error(t("value_error"));
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
          emoji: emoji,
        },
      ]);

      if (error) {
        console.error("Error inserting habit:", error);
        toast.error(t("insert_error"));
      } else {
        console.log("Habit inserted successfully:", data);
        // Close the modal and reset form
        document.getElementById("my_modal_3").close();
        setPeriodicity("daily");
        setMetric("books_read");
        setValue("");
        setDescription("");
        setEmoji("📚");
        toast.success(t("insert_success"));
        fetchHabits(); // Refresh the habits list
      }
    }
  };

  const onEmojiClick = useCallback((emojiObject: any) => {
    setEmoji(emojiObject.emoji);
    setShowEmojiPicker(false);
  }, []);
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
          <div className="ml-auto flex gap-2">
            <button
              className="btn btn-secondary"
              onClick={() => document.getElementById("habit_grid_modal").showModal()}
            >
              {t("view_grid")}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => document.getElementById("my_modal_3").showModal()}
            >
              <span className="hidden md:block">{t("add_habit")}</span>
              <span className="block md:hidden text-2xl">+</span>
            </button>
          </div>
        </div>
        <div className="space-y-8">
          <dialog id="my_modal_3" className="modal">
            <div className="modal-box max-w-min">
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
                    onChange={(e) =>
                      setValue(
                        Math.max(1, parseInt(e.target.value, 10)).toString()
                      )
                    }
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
                <div className="form-control w-full max-w-xs">
                  <label className="label">
                    <span className="label-text">{t("emoji")}</span>
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      {emoji}
                    </button>
                    <span className="ml-2">{t("click_to_change")}</span>
                  </div>
                  {showEmojiPicker && (
                    <div className="mt-2">
                      <EmojiPicker onEmojiClick={onEmojiClick} />
                    </div>
                  )}
                </div>
                <div className="modal-action mx-auto">
                  <button type="submit" className="btn btn-primary mx-auto">
                    {t("save")}
                  </button>
                </div>
              </form>
            </div>
          </dialog>
        </div>
        <dialog id="habit_grid_modal" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">
            <h3 className="font-bold text-lg mb-4">{t("reading_habit_grid")}</h3>
            <ReadingHabitGrid habits={habits} />
            <div className="modal-action">
              <form method="dialog">
                <button className="btn">{t("close")}</button>
              </form>
            </div>
          </div>
        </dialog>
        {habits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {habits.map((habit) => {
              const metricBinding: [{ key: string; label: string }] = [
                {
                  key: "books_read",
                  label: t("books_read", {
                    book: habit.value > 1 ? "books" : "book",
                    value: habit.value,
                    periodicity: habit.periodicity,
                  }),
                },
              ];
              return (
                <div key={habit.id} className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title">
                      <span className="text-2xl mr-2">{habit.emoji}</span>
                      {metricBinding.find((x) => x.key === habit.metric)?.label}
                    </h2>
                    {habit.description && (
                      <p className="text-sm italic mt-2">{habit.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-xl">{t("no_habits")}</p>
          </div>
        )}
      </section>
    </main>
  );
}
