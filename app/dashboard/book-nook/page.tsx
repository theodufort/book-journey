"use client";
import BookNookComponent from "@/components/BookNook";
import HeaderDashboard from "@/components/DashboardHeader";
import { useNextStep } from "nextstepjs";
import { useEffect } from "react";

export default function BookNook() {
  return (
    <main className="min-h-screen p-4 sm:p-8 pb-16">
      <section className="mx-auto space-y-4 sm:space-y-8">
        <div className="sticky top-0 z-50 bg-base-100 h-full">
          <HeaderDashboard />
        </div>
        <BookNookComponent />
      </section>
    </main>
  );
}
