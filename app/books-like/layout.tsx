import { Metadata } from "next";
import Footer from "@/components/Footer";
import { ReactNode } from "react";
import HeaderBookLike from "./_assets/components/HeaderBookLike";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Find Books Like | MyBookQuest",
  description: "Find books like other books.",
};

export default function LibrariesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderBookLike />
      <main className="flex-grow max-w-6xl mx-auto w-full p-8">{children}</main>
      <Footer />
    </div>
  );
}
