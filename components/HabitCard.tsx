import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { addDays, addMonths, addWeeks, addYears } from "date-fns";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Countdown from "./Countdown";

interface HabitCardProps {
  onHabitChange?: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ onHabitChange }) => {
  const t = useTranslations("ReadingHabits");
  const supabase = createClientComponentClient<Database>();
  const [habit, setHabit] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"new" | "update" | "modify">(
    "new"
  );

  useEffect(() => {
    fetchHabit();
  }, []);

  const fetchHabit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .single();
      if (error) {
        console.error("Error fetching habit:", error);
        setHabit(null);
      } else {
        console.log(data);
        // Ensure that value and progress_value are numbers
        const habitData = {
          ...data,
          value: Number(data.value),
          progress_value: Number(data.progress_value),
        };
        console.log(habitData);
        setHabit(habitData);
      }
    }
  };

  const calculateNextEndDate = (habit: any) => {
    const lastDate =
      habit.streak && habit.streak.length > 0
        ? new Date(habit.streak[habit.streak.length - 1])
        : new Date(habit.created_at);

    switch (habit.periodicity) {
      case "daily":
        return addDays(lastDate, 1);
      case "weekly":
        return addWeeks(lastDate, 1);
      case "monthly":
        return addMonths(lastDate, 1);
      case "yearly":
        return addYears(lastDate, 1);
      default:
        return lastDate;
    }
  };

  const metricBinding: any = [
    {
      key: "books_read",
      label: t("books_read", {
        book: habit?.value > 1 ? "books" : "book",
        value: habit?.value,
        periodicity: habit?.periodicity,
      }),
    },
    {
      key: "pages_read",
      label: t("pages_read", {
        page: habit?.value > 1 ? "pages" : "page",
        value: habit?.value,
        periodicity: habit?.periodicity,
      }),
    },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newHabit = {
      periodicity: formData.get("periodicity") as string,
      metric: formData.get("metric") as string,
      value: Number(formData.get("value")),
    };

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      let result;
      if (modalType === "new") {
        result = await supabase
          .from("habits")
          .insert({ ...newHabit, user_id: user.id, progress_value: 0 })
          .select();
        const today = new Date().toISOString().split("T")[0];
        await supabase.rpc("append_habit_streak", {
          habit_id: result.data[0].id,
          day: today,
          progress_value: 0,
        });
      } else if (modalType === "update") {
        const today = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
        const newStreak = [
          ...(habit.streak || []),
          { day: today, progress_value: Number(newHabit.value) },
        ];
        result = await supabase
          .from("habits")
          .update({
            progress_value: Number(newHabit.value),
            streak: newStreak,
          })
          .eq("id", habit.id);
        const { data: appendHabitData, error: appendHabitEror } =
          await supabase.rpc("append_habit_streak", {
            habit_id: habit.id,
            day: today,
            progress_value: Number(newHabit.value),
          });

        if (appendHabitEror) {
          console.error("Error appending habit streak:", appendHabitEror);
        }

        console.log("Successfully appended habit streak:", appendHabitData);
      } else if (modalType === "modify") {
        // If metric type has changed, reset the streak
        if (newHabit.metric !== habit.metric) {
          const today = new Date().toISOString().split("T")[0];
          result = await supabase
            .from("habits")
            .update({
              ...newHabit,
              progress_value: 0,
              streak: [{ day: today, progress_value: 0 }]
            })
            .eq("id", habit.id);
        } else {
          result = await supabase
            .from("habits")
            .update(newHabit)
            .eq("id", habit.id);
        }
      }

      const { error } = result;
      if (error) {
        console.error("Error handling habit:", error);
        toast.error(t(modalType === "new" ? "insert_error" : "update_error"));
      } else {
        toast.success(
          t(modalType === "new" ? "insert_success" : "update_success")
        );
        fetchHabit();
        setIsModalOpen(false);
        onHabitChange?.();
      }
    }
  };

  const openModal = (type: "new" | "update" | "modify") => {
    setModalType(type);
    setIsModalOpen(true);
  };
  console.log(habit);
  return (
    <>
      {habit ? (
        <div className="card bg-base-200 shadow-xl w-full h-auto">
          <div className="card-body justify-between">
            {/* Title */}
            <h2 className="card-title mx-auto">
              {metricBinding.find((x: any) => x.key === habit.metric)?.label}
            </h2>

            {/* Radial Progress */}
            <div className="flex justify-center mt-4">
              <div
                className="radial-progress text-primary"
                style={
                  {
                    "--value":
                      ((habit.progress_value || 0) / habit.value) * 100,
                    "--size": "10rem", // Adjust size as needed
                  } as React.CSSProperties
                }
                role="progressbar"
              >
                {Math.round(((habit.progress_value || 0) / habit.value) * 100)}%
              </div>
            </div>

            {/* Countdown */}
            {/* <div className="mt-4 mx-auto">
              <Countdown
                habit={habit}
                calculateNextEndDate={calculateNextEndDate}
              />
            </div> */}

            {/* Buttons */}
            <div className="card-actions justify-center mt-4">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => openModal("update")}
              >
                {t("update_progress")}
              </button>
              <button
                className="btn btn-accent btn-sm"
                onClick={() => openModal("modify")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="card bg-base-200 shadow-xl border-2 border-dashed h-48 border-gray-300 flex items-center justify-center cursor-pointer w-full"
          onClick={() => openModal("new")}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              openModal("new");
            }
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <p className="mt-2 text-gray-500">{t("add_habit")}</p>
        </div>
      )}

      {/* Modal code remains the same */}
      {isModalOpen && (
        <div className={`modal ${isModalOpen ? "modal-open" : ""}`}>
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              {modalType === "new" && t("add_new_habit")}
              {modalType === "update" && t("update_progress")}
              {modalType === "modify" && t("modify_habit")}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(modalType === "new" || modalType === "modify") && (
                <>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">{t("periodicity")}</span>
                    </label>
                    <select
                      name="periodicity"
                      className="select select-bordered"
                      defaultValue={habit?.periodicity}
                    >
                      <option value="daily">{t("daily")}</option>
                      <option value="weekly">{t("weekly")}</option>
                      <option value="monthly">{t("monthly")}</option>
                      <option value="yearly">{t("yearly")}</option>
                    </select>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">{t("metric")}</span>
                    </label>
                    <select
                      name="metric"
                      className="select select-bordered"
                      defaultValue={habit?.metric}
                    >
                      <option value="books_read">
                        {t("metric_books_read")}
                      </option>
                      <option value="pages_read">
                        {t("metric_pages_read")}
                      </option>
                    </select>
                  </div>
                </>
              )}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    {modalType === "update" ? t("progress_value") : t("value")}
                  </span>
                </label>
                <input
                  type="number"
                  name="value"
                  className="input input-bordered"
                  min="1"
                  required
                  defaultValue={
                    modalType === "update"
                      ? habit?.progress_value
                      : habit?.value
                  }
                />
              </div>
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">
                  {t("save")}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  {t("close")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default HabitCard;
