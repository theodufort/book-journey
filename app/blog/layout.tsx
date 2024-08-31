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
    <div className="flex flex-col min-h-screen">
      <HeaderBlog />
      <main className="flex-grow max-w-6xl mx-auto w-full p-8">{children}</main>
      <Footer />
    </div>
  );
}
