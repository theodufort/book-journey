import { getSEOTags } from "@/libs/seo";
import EmergingAuthors from "./EmergingAuthors";

export async function generateMetadata() {
  return getSEOTags({
    title: "Find Emerging Authors",
    description:
      "Discover new and exciting emerging authors across various genres and languages.",
    canonicalUrlRelative: `/emerging-authors`,
    extraTags: {
      openGraph: {
        title: "Find Emerging Authors",
        description:
          "Discover new and exciting emerging authors across various genres and languages.",
        url: `/emerging-authors`,
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

export default function EmergingAuthorsPage() {
  return <EmergingAuthors />;
}
