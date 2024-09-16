import { getSEOTags } from "@/libs/seo";
import FindMovieBookTool from "./Tool";

export async function generateMetadata() {
  return getSEOTags({
    title: "Find Movies/Books based on Books/Movies",
    description:
      "Find movie or book adaptations of your favorite movie or book.",
    canonicalUrlRelative: `/tools/movie-based-on-book`,
    extraTags: {
      openGraph: {
        title: "Find Movies/Books based on Books/Movies",
        description:
          "Find movie or book adaptations of your favorite movie or book.",
        url: `/tools/movie-based-on-book`,
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
  return <FindMovieBookTool />;
}
