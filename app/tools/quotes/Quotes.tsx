"use client";

interface Quote {
  id: number;
  content: string;
  author: string | null;
}

interface QuotesProps {
  quotes: Quote[];
}

export default function Quotes({ quotes }: QuotesProps) {
  return (
    <section>
      <div className="max-w-7xl mx-auto px-8 py-5 text-center">
        <h2 className="max-w-3xl mx-auto font-extrabold text-4xl md:text-5xl tracking-tight mb-8">
          Quotes
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {quotes.map((quote) => (
          <div key={quote.id} className="card bg-base-200 shadow-xl p-6">
            <p className="text-lg mb-4">{quote.content}</p>
            {quote.author && (
              <p className="text-right italic">- {quote.author}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
