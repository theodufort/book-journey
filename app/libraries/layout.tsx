import { Metadata } from "next";
import HeaderBlog from "./_assets/components/HeaderLibraries";
import Footer from "@/components/Footer";
import { ReactNode } from "react";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Libraries Directory | MyBookQuest",
  description: "Find libraries near you.",
};

export default function LibrariesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderBlog />
      <main className="flex-grow max-w-6xl mx-auto w-full p-8">{children}</main>
      <Footer />
    </div>
  );
}
