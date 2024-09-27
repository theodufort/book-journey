import { getSEOTags } from "@/libs/seo";

export async function generateMetadata() {
  return getSEOTags({
    title: "Get Book Recommendations from our AI Assistant",
    description: "Get Book Recommendations from our AI Assistant",
    canonicalUrlRelative: `/tools/ai-helper`,
    extraTags: {
      openGraph: {
        title: "Get Book Recommendations from our AI Assistant",
        description: "Get Book Recommendations from our AI Assistant",
        url: `/tools/ai-helper`,
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
export default function AiHelper() {
  return;
}
