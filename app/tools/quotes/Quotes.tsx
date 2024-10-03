"use client";

import { Database } from "@/types/supabase";
import { motion } from "framer-motion";
import { useState } from "react";

type Quote = Database["public"]["Tables"]["quotes"]["Row"];

interface QuotesProps {
  quotes: Quote[];
}

export default function Quotes({ quotes }: QuotesProps) {
  const [hoveredQuote, setHoveredQuote] = useState<string | null>(null);

  return (
    <section className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-8 py-5 text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto font-extrabold text-5xl    
 md:text-6xl tracking-tight mb-8 text-primary"
        >
          Inspiring Quotes
        </motion.h2>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
 gap-8 max-w-6xl mx-auto px-4"
      >
        {quotes.map((quote) => (
          <motion.div
            key={quote.id}
            whileHover={{ scale: 1.05 }}
            onHoverStart={() => setHoveredQuote(quote.id)}
            onHoverEnd={() => setHoveredQuote(null)}
            className="card bg-white shadow-xl p-6 rounded-lg     
 transition-all duration-300 hover:shadow-2xl"
          >
            <div className="relative h-full flex flex-col justify-between">
              <p className="text-xl mb-4 text-gray-800 font-serif">
                "{quote.text}"
              </p>
              {quote.author && (
                <p className="text-right italic text-indigo-600 font-medium">
                  - {quote.author}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
