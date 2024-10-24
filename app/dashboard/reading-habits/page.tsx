"use client";
import HeaderDashboard from "@/components/DashboardHeader";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import EmojiPicker from "emoji-picker-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { differenceInSeconds, addDays, addWeeks, addMonths, addYears, parseISO } from "date-fns";

const Countdown = ({ habit, calculateNextEndDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const intervalRef = useRef(null);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endDate = calculateNextEndDate(habit);
      const diffInSeconds = differenceInSeconds(endDate, now);

      if (diffInSeconds <= 0) {
        clearInterval(intervalRef.current);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(diffInSeconds / (24 * 60 * 60));
        const hours = Math.floor((diffInSeconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((diffInSeconds % (60 * 60)) / 60);
        const seconds = diffInSeconds % 60;

        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateCountdown();
    intervalRef.current = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalRef.current);
  }, [habit, calculateNextEndDate]);

  return (
    <div className="grid grid-flow-col gap-5 text-center auto-cols-max">
      <div className="flex flex-col">
        <span className="countdown font-mono text-5xl">
          <span style={{ "--value": timeLeft.days }}></span>
        </span>
        days
      </div>
      <div className="flex flex-col">
        <span className="countdown font-mono text-5xl">
          <span style={{ "--value": timeLeft.hours }}></span>
        </span>
        hours
      </div>
      <div className="flex flex-col">
        <span className="countdown font-mono text-5xl">
          <span style={{ "--value": timeLeft.minutes }}></span>
        </span>
        min
      </div>
      <div className="flex flex-col">
        <span className="countdown font-mono text-5xl">
          <span style={{ "--value": timeLeft.seconds }}></span>
        </span>
        sec
      </div>
    </div>
  );
};

export default function ReadingHabits() {
  const [activityDataHabit, setActivityDataHabit] = useState([
    {
      date: "2024-06-23",
      count: 2,
      level: 1,
    },
    {
      date: "2024-08-02",
      count: 16,
      level: 4,
    },
    {
      date: "2024-11-29",
      count: 11,
      level: 3,
    },
  ]);
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

  const calculateNextEndDate = (habit) => {
    const lastDate = habit.streak && habit.streak.length > 0 
      ? new Date(habit.streak[habit.streak.length - 1]) 
      : new Date(habit.created_at);

    switch (habit.periodicity) {
      case 'daily':
        return addDays(lastDate, 1);
      case 'weekly':
        return addWeeks(lastDate, 1);
      case 'monthly':
        return addMonths(lastDate, 1);
      case 'yearly':
        return addYears(lastDate, 1);
      default:
        return lastDate;
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
          streak: [new Date().toISOString()],
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
            <dialog
              id={`habit_grid_modal_${habit.id}`}
              className="modal"
              key={habit.id}
            >
              <div className="modal-box">
                <form method="dialog">
                  {/* if there is a button in form, it will close the modal */}
                  <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                    ✕
                  </button>
                </form>
                <h3 className="font-bold text-lg mb-4">
                  {metricBinding.find((x) => x.key === habit.metric)?.label ||
                    t("unnamed_habit")}
                </h3>
              </div>
            </dialog>
          );
        })}
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
                    <Countdown habit={habit} calculateNextEndDate={calculateNextEndDate} />
                    <div className="card-actions justify-end mt-4">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          document
                            .getElementById(`habit_grid_modal_${habit.id}`)
                            .showModal()
                        }
                      >
                        {t("view_grid")}
                      </button>
                    </div>
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
