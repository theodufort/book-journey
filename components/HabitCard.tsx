import React from 'react';
import { useTranslations } from 'next-intl';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import toast from 'react-hot-toast';
import Countdown from './Countdown';

interface HabitCardProps {
  habit: any;
  calculateNextEndDate: (habit: any) => Date;
  fetchHabits: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, calculateNextEndDate, fetchHabits }) => {
  const t = useTranslations('ReadingHabits');
  const supabase = createClientComponentClient<Database>();

  const metricBinding: [{ key: string; label: string }] = [
    {
      key: "books_read",
      label: t("books_read", {
        book: habit.value > 1 ? "books" : "book",
        value: habit.value,
        periodicity: habit.periodicity,
      }),
    },
    {
      key: "pages_read",
      label: t("pages_read", {
        page: habit.value > 1 ? "pages" : "page",
        value: habit.value,
        periodicity: habit.periodicity,
      }),
    },
  ];

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
              style={{ 
                "--value": ((habit.progress_value || 0) / habit.value) * 100, 
                "--size": "3rem"
              } as React.CSSProperties} 
              role="progressbar"
            >
              {Math.round(((habit.progress_value || 0) / habit.value) * 100)}%
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
                  console.log(
                    "Progress updated successfully:",
                    data
                  );
                  toast.success(t("update_success"));
                  fetchHabits(); // Refresh the habits list
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
                        habit.periodicity === "daily"
                          ? "selected"
                          : ""
                      }>${t("daily")}</option>
                      <option value="weekly" ${
                        habit.periodicity === "weekly"
                          ? "selected"
                          : ""
                      }>${t("weekly")}</option>
                      <option value="monthly" ${
                        habit.periodicity === "monthly"
                          ? "selected"
                          : ""
                      }>${t("monthly")}</option>
                      <option value="yearly" ${
                        habit.periodicity === "yearly"
                          ? "selected"
                          : ""
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
                        habit.metric === "books_read"
                          ? "selected"
                          : ""
                      }>${t("metric_books_read")}</option>
                      <option value="pages_read" ${
                        habit.metric === "pages_read"
                          ? "selected"
                          : ""
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
                  fetchHabits(); // Refresh the habits list
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

export default HabitCard;
