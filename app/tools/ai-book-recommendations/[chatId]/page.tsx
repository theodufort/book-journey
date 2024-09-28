import { getSEOTags } from "@/libs/seo";
import HelperUI from "../HelperUI";

export async function generateMetadata() {
  return getSEOTags({
    title: "AI Book Recommendations",
    description: "Get Book Recommendations from our AI Assistant",
    canonicalUrlRelative: `/tools/ai-book-recommendations`,
    extraTags: {
      openGraph: {
        title: "AI Book Recommendations",
        description: "Get Book Recommendations from our AI Assistant",
        url: `/tools/ai-book-recommendations`,
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
export default function AiHelper({ params }: { params: { chatId: string } }) {
  return (
    <HelperUI editable={false} mode={"view"} conversationId={params.chatId} />
  );
}
