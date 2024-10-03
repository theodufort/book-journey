import { Database } from "@/types/supabase";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Quote from "./Quote";
import { notFound } from "next/navigation";

async function getQuoteBySlug(slug: string) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  const [quoteText, author] = decodedSlug.split("-by-");
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
