import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { addDays, addMonths, addWeeks, addYears } from "date-fns";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Countdown from "./Countdown";
import HabitConsistencyGraph from "./HabitConsistencyGraph";

const HabitCard: React.FC = () => {
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
        setHabit(data);
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

  const metricBinding: [{ key: string; label: string }] = [
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
      value: formData.get("value") as string,
    };

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      let result;
      if (modalType === "new") {
        result = await supabase
          .from("habits")
          .insert({ ...newHabit, user_id: user.id });
      } else if (modalType === "update") {
        result = await supabase
          .from("habits")
          .update({ progress_value: newHabit.value })
          .eq("id", habit.id);
      } else if (modalType === "modify") {
        result = await supabase
          .from("habits")
          .update(newHabit)
          .eq("id", habit.id);
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
      }
    }
  };

  const openModal = (type: "new" | "update" | "modify") => {
    setModalType(type);
    setIsModalOpen(true);
  };

  return (
    <>
      {habit ? (
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            {/* Grid container with two columns */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="flex flex-col justify-between">
                {/* Title */}
                <h2 className="card-title">
                  {metricBinding.find((x) => x.key === habit.metric)?.label}
                </h2>

                {/* Buttons */}
                <div className="card-actions mt-4">
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

                {/* Countdown */}
                <div className="mt-4">
                  <Countdown
                    habit={habit}
                    calculateNextEndDate={calculateNextEndDate}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="flex justify-center items-center">
                <div
                  className="radial-progress bg-primary text-primary-content border-primary border-4"
                  style={
                    {
                      "--value":
                        ((habit.progress_value || 0) / habit.value) * 100,
                      "--size": "6rem", // Adjust size as needed
                    } as React.CSSProperties
                  }
                  role="progressbar"
                >
                  {Math.round(
                    ((habit.progress_value || 0) / habit.value) * 100
                  )}
                  %
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // ... (the code for when habit is null remains the same)
        <div
          className="card bg-base-200 shadow-xl border-2 border-dashed border-gray-300 flex items-center justify-center h-48 cursor-pointer"
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
