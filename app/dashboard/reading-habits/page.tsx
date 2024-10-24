"use client";
import HeaderDashboard from "@/components/DashboardHeader";
import { useTranslations } from "next-intl";

export default function ReadingHabits() {
  const t = useTranslations("ReadingHabits");
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
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                  ✕
                </button>
              </form>
              <h3 className="font-bold text-lg">Hello!</h3>
              <p className="py-4">
                Press ESC key or click on ✕ button to close
              </p>
            </div>
          </dialog>
        </div>
      </section>
    </main>
  );
}
