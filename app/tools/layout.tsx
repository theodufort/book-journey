import { Metadata } from "next";
import { HeaderTools } from "./HeaderTools";
import Footer from "@/components/Footer";
import { ReactNode } from "react";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Blog | MyBookQuest",
  description: "Explore our latest articles and insights on reading and books.",
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderTools />
      <main className="flex-grow max-w-6xl mx-auto w-full p-8">{children}</main>
      <Footer />
    </div>
  );
}
