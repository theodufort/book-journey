import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { addDays, addMonths, addWeeks, addYears } from "date-fns";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Countdown from "./Countdown";

const HabitCard: React.FC = () => {
  const t = useTranslations("ReadingHabits");
  const supabase = createClientComponentClient<Database>();
  const [habit, setHabit] = useState<any>(null);

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

  if (!habit) {
    return (
      <div className="card bg-base-200 shadow-xl border-2 border-dashed border-gray-300 flex items-center justify-center h-48 cursor-pointer" onClick={() => {
        const modal = document.getElementById('habit_modal_new');
        const title = document.getElementById('habit_modal_title_new');
        const content = document.getElementById('habit_modal_content_new');
        title.textContent = t("add_new_habit");
        content.innerHTML = `
          <form id="add-habit-form" class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">${t("periodicity")}</span>
              </label>
              <select id="periodicity" class="select select-bordered">
                <option value="daily">${t("daily")}</option>
                <option value="weekly">${t("weekly")}</option>
                <option value="monthly">${t("monthly")}</option>
                <option value="yearly">${t("yearly")}</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">${t("metric")}</span>
              </label>
              <select id="metric" class="select select-bordered">
                <option value="books_read">${t("metric_books_read")}</option>
                <option value="pages_read">${t("metric_pages_read")}</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">${t("value")}</span>
              </label>
              <input type="number" id="value" class="input input-bordered" min="1" required />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">${t("description")}</span>
              </label>
              <textarea id="description" class="textarea textarea-bordered" placeholder="${t("enter_description")}"></textarea>
            </div>
            <div class="modal-action">
              <button type="submit" class="btn btn-primary">${t("save")}</button>
            </div>
          </form>
        `;

        const form = document.getElementById('add-habit-form');
        form.onsubmit = async (e) => {
          e.preventDefault();
          const newHabit = {
            periodicity: (document.getElementById('periodicity') as HTMLSelectElement).value,
            metric: (document.getElementById('metric') as HTMLSelectElement).value,
            value: (document.getElementById('value') as HTMLInputElement).value,
            description: (document.getElementById('description') as HTMLTextAreaElement).value,
          };
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data, error } = await supabase
              .from('habits')
              .insert({ ...newHabit, user_id: user.id });
            if (error) {
              console.error("Error inserting habit:", error);
              toast.error(t("insert_error"));
            } else {
              console.log("Habit inserted successfully:", data);
              toast.success(t("insert_success"));
              fetchHabit(); // Refresh the habit
              modal.close();
            }
          }
        };
        modal.showModal();
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <p className="mt-2 text-gray-500">{t("add_habit")}</p>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body relative">
        <h2 className="card-title">
          <span className="text-2xl mr-2">{habit.emoji}</span>
          {metricBinding.find((x) => x.key === habit.metric)?.label}
        </h2>
        <Countdown
          habit={habit}
          calculateNextEndDate={calculateNextEndDate}
        />
        <div className="card-actions justify-end mt-4">
          <div className="absolute bottom-4 left-4">
            <div
              className="radial-progress text-primary"
              style={
                {
                  "--value":
                    ((habit.progress_value || 0) / habit.value) * 100,
                  "--size": "3rem",
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
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              const modal = document.getElementById(
                `habit_modal_${habit.id}`
              );
              const title = document.getElementById(
                `habit_modal_title_${habit.id}`
              );
              const content = document.getElementById(
                `habit_modal_content_${habit.id}`
              );
              title.textContent = t("update_progress");
              content.innerHTML = `
                <form id="update-progress-form-${
                  habit.id
                }" class="space-y-4">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">${t(
                        "progress_value"
                      )}</span>
                    </label>
                    <input type="number" id="progress-value-${
                      habit.id
                    }" class="input input-bordered" value="${
                habit.progress_value || 0
              }" min="0" required />
                  </div>
                  <div class="modal-action">
                    <button type="submit" class="btn btn-primary">${t(
                      "save"
                    )}</button>
                  </div>
                </form>
              `;

              const form = document.getElementById(
                `update-progress-form-${habit.id}`
              );
              form.onsubmit = async (e) => {
                e.preventDefault();
                const updatedProgress = {
                  id: habit.id,
                  progress_value: (
                    document.getElementById(
                      `progress-value-${habit.id}`
                    ) as HTMLInputElement
                  ).value,
                };
                const { data, error } = await supabase
                  .from("habits")
                  .update(updatedProgress)
                  .eq("id", habit.id);
                if (error) {
                  console.error("Error updating progress:", error);
                  toast.error(t("update_error"));
                } else {
                  console.log("Progress updated successfully:", data);
                  toast.success(t("update_success"));
                  fetchHabit(); // Refresh the habit
                  modal.close();
                }
              };
              modal.showModal();
            }}
          >
            {t("update_progress")}
          </button>
          <button
            className="btn btn-accent btn-sm"
            onClick={() => {
              const modal = document.getElementById(
                `habit_modal_${habit.id}`
              );
              const title = document.getElementById(
                `habit_modal_title_${habit.id}`
              );
              const content = document.getElementById(
                `habit_modal_content_${habit.id}`
              );
              title.textContent = t("modify_habit");
              content.innerHTML = `
                <form id="modify-habit-form-${
                  habit.id
                }" class="space-y-4">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">${t(
                        "periodicity"
                      )}</span>
                    </label>
                    <select id="periodicity-${
                      habit.id
                    }" class="select select-bordered">
                      <option value="daily" ${
                        habit.periodicity === "daily" ? "selected" : ""
                      }>${t("daily")}</option>
                      <option value="weekly" ${
                        habit.periodicity === "weekly" ? "selected" : ""
                      }>${t("weekly")}</option>
                      <option value="monthly" ${
                        habit.periodicity === "monthly"
                          ? "selected"
                          : ""
                      }>${t("monthly")}</option>
                      <option value="yearly" ${
                        habit.periodicity === "yearly" ? "selected" : ""
                      }>${t("yearly")}</option>
                    </select>
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">${t("metric")}</span>
                    </label>
                    <select id="metric-${
                      habit.id
                    }" class="select select-bordered">
                      <option value="books_read" ${
                        habit.metric === "books_read" ? "selected" : ""
                      }>${t("metric_books_read")}</option>
                      <option value="pages_read" ${
                        habit.metric === "pages_read" ? "selected" : ""
                      }>${t("metric_pages_read")}</option>
                    </select>
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">${t("value")}</span>
                    </label>
                    <input type="number" id="value-${
                      habit.id
                    }" class="input input-bordered" value="${
                habit.value
              }" min="1" required />
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">${t(
                        "description"
                      )}</span>
                    </label>
                    <textarea id="description-${
                      habit.id
                    }" class="textarea textarea-bordered" placeholder="${t(
                "enter_description"
              )}">${habit.description || ""}</textarea>
                  </div>
                  <div class="modal-action">
                    <button type="submit" class="btn btn-primary">${t(
                      "save"
                    )}</button>
                  </div>
                </form>
              `;

              const form = document.getElementById(
                `modify-habit-form-${habit.id}`
              );
              form.onsubmit = async (e) => {
                e.preventDefault();
                const updatedHabit = {
                  id: habit.id,
                  periodicity: (
                    document.getElementById(
                      `periodicity-${habit.id}`
                    ) as HTMLSelectElement
                  ).value,
                  metric: (
                    document.getElementById(
                      `metric-${habit.id}`
                    ) as HTMLSelectElement
                  ).value,
                  value: (
                    document.getElementById(
                      `value-${habit.id}`
                    ) as HTMLInputElement
                  ).value,
                  description: (
                    document.getElementById(
                      `description-${habit.id}`
                    ) as HTMLTextAreaElement
                  ).value,
                };
                const { data, error } = await supabase
                  .from("habits")
                  .update(updatedHabit)
                  .eq("id", habit.id);
                if (error) {
                  console.error("Error updating habit:", error);
                  toast.error(t("update_error"));
                } else {
                  console.log("Habit updated successfully:", data);
                  toast.success(t("update_success"));
                  fetchHabit(); // Refresh the habit
                  modal.close();
                }
              };
              modal.showModal();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const HabitCard: React.FC = () => {
  // ... existing code ...

  return (
    <>
      {!habit ? (
        <div className="card bg-base-200 shadow-xl border-2 border-dashed border-gray-300 flex items-center justify-center h-48 cursor-pointer" onClick={() => {
          const modal = document.getElementById('habit_modal_new');
          const title = document.getElementById('habit_modal_title_new');
          const content = document.getElementById('habit_modal_content_new');
          if (title) title.textContent = t("add_new_habit");
          if (content) content.innerHTML = `
            <form id="add-habit-form" class="space-y-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">${t("periodicity")}</span>
                </label>
                <select id="periodicity" class="select select-bordered">
                  <option value="daily">${t("daily")}</option>
                  <option value="weekly">${t("weekly")}</option>
                  <option value="monthly">${t("monthly")}</option>
                  <option value="yearly">${t("yearly")}</option>
                </select>
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">${t("metric")}</span>
                </label>
                <select id="metric" class="select select-bordered">
                  <option value="books_read">${t("metric_books_read")}</option>
                  <option value="pages_read">${t("metric_pages_read")}</option>
                </select>
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">${t("value")}</span>
                </label>
                <input type="number" id="value" class="input input-bordered" min="1" required />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">${t("description")}</span>
                </label>
                <textarea id="description" class="textarea textarea-bordered" placeholder="${t("enter_description")}"></textarea>
              </div>
              <div class="modal-action">
                <button type="submit" class="btn btn-primary">${t("save")}</button>
              </div>
            </form>
          `;

          const form = document.getElementById('add-habit-form');
          if (form) {
            form.onsubmit = async (e) => {
              e.preventDefault();
              const newHabit = {
                periodicity: (document.getElementById('periodicity') as HTMLSelectElement)?.value,
                metric: (document.getElementById('metric') as HTMLSelectElement)?.value,
                value: (document.getElementById('value') as HTMLInputElement)?.value,
                description: (document.getElementById('description') as HTMLTextAreaElement)?.value,
              };
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                const { data, error } = await supabase
                  .from('habits')
                  .insert({ ...newHabit, user_id: user.id });
                if (error) {
                  console.error("Error inserting habit:", error);
                  toast.error(t("insert_error"));
                } else {
                  console.log("Habit inserted successfully:", data);
                  toast.success(t("insert_success"));
                  fetchHabit(); // Refresh the habit
                  if (modal instanceof HTMLDialogElement) modal.close();
                }
              }
            };
          }
          if (modal instanceof HTMLDialogElement) modal.showModal();
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <p className="mt-2 text-gray-500">{t("add_habit")}</p>
        </div>
      ) : (
        // ... existing habit card JSX ...
      )}
      
      {/* Add this modal element inside the component */}
      <dialog id="habit_modal_new" className="modal">
        <div className="modal-box">
          <h3 id="habit_modal_title_new" className="font-bold text-lg"></h3>
          <div id="habit_modal_content_new"></div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export default HabitCard;
