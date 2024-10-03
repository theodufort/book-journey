import { getSEOTags } from "@/libs/seo";
import Quotes from "./Quotes";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

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
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: quotes, error } = await supabase
    .from('quotes')
    .select('*')
    .limit(20)
    .order('id', { ascending: false });

  if (error) {
    console.error('Error fetching quotes:', error);
    return [];
  }

  return quotes;
}

export default async function Tool() {
  const initialQuotes = await getQuotes();
  return <Quotes initialQuotes={initialQuotes} />;
}
