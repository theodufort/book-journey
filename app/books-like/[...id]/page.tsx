import { getSEOTags } from "@/libs/seo";
import BooksLikeClient from "./BooksLikeClient";
export async function generateMetadata({
  params,
}: {
  params: { id: string[] };
}) {
  const fullSlug = params.id.join("/");
  const isbn = fullSlug.split("-").pop() || "";
  const decodedTitle = fullSlug.slice(0, -isbn.length - 1).replace(/-/g, " ");
  return getSEOTags({
    title: `Find books like ${decodedTitle}`,
    description: `Find books like ${decodedTitle}`,
    canonicalUrlRelative: `/books-like/${fullSlug}`,
    extraTags: {
      openGraph: {
        title: `Find books like ${decodedTitle}`,
        description: `Find books like ${decodedTitle}`,
        url: `/books-like/${fullSlug}`,
        images: [
          {
            url: "",
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
export default function BooksLike({ params }: { params: { id: string[] } }) {
  return <BooksLikeClient params={params} />;
}
