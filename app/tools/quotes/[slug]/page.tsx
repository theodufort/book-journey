import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";
import Quotes from "../Quotes";
import { notFound } from "next/navigation";

async function getQuoteBySlug(slug: string) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const decodedSlug = decodeURIComponent(slug);
  const { data: quotes, error } = await supabase
    .from('quotes')
    .select('*')
    .ilike('text', `${decodedSlug}%`)
    .limit(1);

  if (error) {
    console.error('Error fetching quote:', error);
    return null;
  }

  return quotes[0] || null;
}

export default async function QuotePage({ params }: { params: { slug: string } }) {
  const quote = await getQuoteBySlug(params.slug);

  if (!quote) {
    notFound();
  }

  return <Quotes initialQuotes={[quote]} />;
}
