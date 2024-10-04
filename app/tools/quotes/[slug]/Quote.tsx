"use client";
import SubscriberCardQuotes from "@/components/SubscriberCardQuotes";
import React from "react";

interface QuoteProps {
  author: string;
  text: string;
}

const Quote: React.FC<QuoteProps> = ({ author, text }) => {
  return (
    <div className="flex flex-col gap-4 items-center justify-center max-h-screen p-4">
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
      <SubscriberCardQuotes />
    </div>
  );
};

export default Quote;
