import { Suspense } from "react";
import { Metadata } from "next";
import HeaderBlog from "./_assets/components/HeaderBlog";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Blog | MyBookQuest",
  description: "Explore our latest articles and insights on reading and books.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Suspense>
        <HeaderBlog />
      </Suspense>

      <main className="min-h-screen max-w-6xl mx-auto p-8">{children}</main>

      <div className="h-24" />

      <Footer />
    </div>
  );
}
