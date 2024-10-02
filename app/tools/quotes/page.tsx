import { getSEOTags } from "@/libs/seo";
import Quotes from "./Quotes";

export async function generateMetadata() {
  return getSEOTags({
    title: "Quotes",
    description: "Get daily fresh quotes fro your favorite authors.",
    canonicalUrlRelative: `/tools/quotes`,
    extraTags: {
      openGraph: {
        title: "Quotes",
        description: "Get daily fresh quotes fro your favorite authors.",
        url: `/tools/quotes`,
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
export default function Tool() {
  return <Quotes />;
}
