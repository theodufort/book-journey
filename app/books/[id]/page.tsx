import BookDetails from "@/components/BookDetails";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Volume } from "@/interfaces/GoogleAPI";
import { getSEOTags } from "@/libs/seo";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  return getSEOTags({
    title: article.title,
    description: article.description,
    canonicalUrlRelative: `/blog/${article.slug}`,
    extraTags: {
      openGraph: {
        title: article.title,
        description: article.description,
        url: `/blog/${article.slug}`,
        images: [
          {
            url: article.image_url,
            width: 1200,
            height: 660,
          },
        ],
        locale: "en_US",
        type: "website",
      },
    },
  });
}
export default async function BookPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/books/${id}/v3`, {
    cache: "no-store",
  });

  if (!response.ok) {
    console.error(`API request failed with status ${response.status}`);
    notFound();
  }

  const book: Volume = await response.json();
  console.log("API Response:", book);

  if (!book || typeof book !== "object") {
    console.error("Invalid book data received from API");
    notFound();
  }
  return (
    <div>
      <Header />
      <main className="min-h-screen p-8 pb-24">
        <section className="max-w-6xl mx-auto space-y-8">
          <BookDetails book={book} />
        </section>{" "}
      </main>
      <Footer />
    </div>
  );
}
