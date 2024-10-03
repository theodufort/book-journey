import { getSEOTags } from "@/libs/seo";
import Quotes from "./Quotes";
import { sql } from "@vercel/postgres";

export async function generateMetadata() {
  return getSEOTags({
    title: "Quotes",
    description: "Get daily fresh quotes from your favorite authors.",
    canonicalUrlRelative: `/tools/quotes`,
    extraTags: {
      openGraph: {
        title: "Quotes",
        description: "Get daily fresh quotes from your favorite authors.",
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

async function getQuotes() {
  const { rows } = await sql`SELECT * FROM quotes ORDER BY RANDOM() LIMIT 20`;
  return rows;
}

export default async function Tool() {
  const quotes = await getQuotes();
  return <Quotes quotes={quotes} />;
}
