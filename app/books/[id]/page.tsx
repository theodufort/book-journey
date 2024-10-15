import BookDetails from "@/components/BookDetails";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

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
    notFound();
  }

  const book = await response.json();
  console.log(book);
  return (
    <div className="max-w-4xl mx-auto py-8">
      <BookDetails book={book} />
    </div>
  );
}
