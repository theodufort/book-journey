import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";
import { notFound } from "next/navigation";
import { motion as m } from "framer-motion";

async function getQuoteBySlug(slug: string) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  const [quoteText, author] = decodedSlug.split('-by-');
  
  let query = supabase
    .from('quotes')
    .select('*')
    .ilike('text', `${quoteText.replace(/-/g, ' ')}%`);

  if (author) {
    query = query.ilike('author', `${author.replace(/-/g, ' ')}%`);
  }

  const { data: quotes, error } = await query.limit(1);

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

  return (
    <div className="min-h-screen py-12 flex items-center justify-center">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto px-4"
      >
        <blockquote className="text-2xl font-serif italic text-center">
          "{quote.text}"
        </blockquote>
        {quote.author && (
          <p className="mt-4 text-right text-xl text-gray-600">
            - {quote.author}
          </p>
        )}
      </motion.div>
    </div>
  );
}
