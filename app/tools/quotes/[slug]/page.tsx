"use server";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Quote from "./Quote";

async function getQuoteBySlug(slug: string) {
  console.log(slug);
  const supabase = createClientComponentClient<Database>();
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
  return <Quote author={quote.author} text={quote.text} />;
}
