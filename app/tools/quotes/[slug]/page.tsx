import { getSEOTags } from "@/libs/seo";
import { Database } from "@/types/supabase";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { generateQuoteSlug } from "../Quotes";
import Quote from "./Quote";

function decodeSlug(slug: string) {
  const decodedSlug = decodeURIComponent(slug).toLowerCase();

  return decodedSlug.split("-by-");
}
export async function generateStaticParams() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: quotes, error } = await supabase.from("quotes").select("*");

  return quotes.map((x) => {
    return {
      slug: generateQuoteSlug(x.text, x.author),
    };
  });
}
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const quote = await getQuoteBySlug(params.slug);
  const title = quote.text.split(" ").slice(0, 10).join(" ");
  return getSEOTags({
    title: title,
    description: quote.text + " By " + quote.author,
    canonicalUrlRelative: `/tools/quotes/` + params.slug,
    extraTags: {
      openGraph: {
        title: title,
        description: quote.text + " By " + quote.author,
        url: `/tools/quotes/` + params.slug,
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
async function getQuoteBySlug(slug: string) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const [quoteText, author] = decodeSlug(slug);
  let query = supabase
    .from("quotes")
    .select("*")
    .ilike("text", `${quoteText.replace(/-/g, " ")}%`);

  if (author) {
    query = query.ilike("author", `${author.replace(/-/g, " ")}%`);
  }

  const { data: quotes, error } = await query.limit(1);

  if (error) {
    console.error("Error fetching quote:", error);
    return null;
  }

  return quotes[0] || null;
}

export default async function QuotePage({
  params,
}: {
  params: { slug: string };
}) {
  const quote = await getQuoteBySlug(params.slug);

  if (!quote) {
    notFound();
  }

  return <Quote author={quote.author} text={quote.text} />;
}
