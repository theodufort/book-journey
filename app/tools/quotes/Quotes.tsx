"use client";

import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion as m } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

type Quote = Database["public"]["Tables"]["quotes"]["Row"];

interface QuotesProps {
  initialQuotes: Quote[];
}
export const generateQuoteSlug = (text: string, author: string | null) => {
  const words = text.split(" ").slice(0, 10).join("-");
  const slug = author ? `${words}-by-${author.replace(/\s+/g, "-")}` : words;
  return encodeURIComponent(slug.toLowerCase());
};
export default function Quotes({ initialQuotes }: QuotesProps) {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [hoveredQuote, setHoveredQuote] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const quotesPerPage = 9;

  const supabase = createClientComponentClient<Database>();

  const fetchQuotes = async (page: number) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .range((page - 1) * quotesPerPage, page * quotesPerPage - 1)
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching quotes:", error);
    } else {
      setQuotes(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotes(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <section className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-8 py-5 text-center">
        <m.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto font-extrabold text-5xl md:text-6xl tracking-tight mb-8 text-primary"
        >
          Inspiring Quotes
        </m.h2>
      </div>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4"
      >
        {quotes.map((quote) => (
          <Link
            href={`/tools/quotes/${generateQuoteSlug(
              quote.text,
              quote.author
            )}`}
            key={quote.id}
          >
            <m.div
              whileHover={{ scale: 1.05 }}
              onHoverStart={() => setHoveredQuote(quote.id)}
              onHoverEnd={() => setHoveredQuote(null)}
              className="card bg-white shadow-xl p-6 rounded-lg transition-all duration-300 hover:shadow-2xl cursor-pointer"
            >
              <div className="relative h-full flex flex-col justify-between">
                <p className="text-xl mb-4 text-gray-800 font-serif line-clamp-3">
                  "{quote.text}"
                </p>
                {quote.author && (
                  <p className="text-right italic text-indigo-600 font-medium">
                    - {quote.author}
                  </p>
                )}
              </div>
            </m.div>
          </Link>
        ))}
      </m.div>
      <div className="flex justify-center mt-8">
        <div className="join">
          <button
            className="join-item btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            «
          </button>
          <button className="join-item btn">Page {currentPage}</button>
          <button
            className="join-item btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={quotes.length < quotesPerPage || loading}
          >
            »
          </button>
        </div>
      </div>
    </section>
  );
}
