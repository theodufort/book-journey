import BookDetails from "@/components/BookDetails";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Volume } from "@/interfaces/GoogleAPI";
import { getSEOTags } from "@/libs/seo";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getBookDetails(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/books/${id}/v3`, {
    cache: "no-store",
  });

  if (!response.ok) {
    console.error(`API request failed with status ${response.status}`);
    return null;
  }

  const book: Volume = await response.json();
  return book;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const book = await getBookDetails(params.id);

  if (!book) {
    return {};
  }

  return getSEOTags({
    title: book.volumeInfo.title,
    description: book.volumeInfo.description || "",
    canonicalUrlRelative: `/books/${book.id}`,
    extraTags: {
      openGraph: {
        title: book.volumeInfo.title,
        description: book.volumeInfo.description || "",
        url: `/books/${book.id}`,
        images: [
          {
            url: book.volumeInfo.imageLinks?.thumbnail || "",
            width: 128,
            height: 192,
          },
        ],
        locale: "en_US",
        type: "book",
      },
    },
  });
}
export default async function BookPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const book = await getBookDetails(id);

  if (!book || typeof book !== "object") {
    console.error("Invalid book data received from API");
    notFound();
  }

  console.log("API Response:", book);
  return (
    <div>
      <Header />
      <main className="min-h-screen p-8 pb-24">
        <section className="max-w-6xl mx-auto space-y-8">
          <BookDetails book={book} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
