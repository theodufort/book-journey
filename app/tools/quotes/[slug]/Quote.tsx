"use client";
import { m } from "framer-motion";
import { notFound } from "next/navigation";

interface props {
  author: string;
  text: string;
}
export default function Quote({ author, text }: props) {
  console.log(author, text);
  if (!text) {
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
          "{text}"
        </blockquote>
        {author && (
          <p className="mt-4 text-right text-xl text-gray-600">- {author}</p>
        )}
      </m.div>
    </div>
  );
}
import React from 'react';

interface QuoteProps {
  author: string;
  text: string;
}

const Quote: React.FC<QuoteProps> = ({ author, text }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl w-full bg-white shadow-lg rounded-lg p-8">
        <blockquote className="text-2xl font-semibold italic text-center text-gray-900">
          "{text}"
        </blockquote>
        {author && (
          <figcaption className="mt-6 text-right text-xl font-medium text-gray-500">
            — {author}
          </figcaption>
        )}
      </div>
    </div>
  );
};

export default Quote;
