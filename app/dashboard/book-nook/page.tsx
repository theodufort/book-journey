"use client";
import BookNook1 from "@/components/BookNook1";
import HeaderDashboard from "@/components/DashboardHeader";

export default function BookNook() {
  return (
    <main className="min-h-screen p-4 sm:p-8 pb-16">
      <section className="mx-auto space-y-4 sm:space-y-8">
        <div className="sticky top-0 z-50 bg-base-100 h-full">
          <HeaderDashboard />
        </div>
        <BookNook1 />
      </section>
    </main>
  );
}
