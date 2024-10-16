import { Volume } from "@/interfaces/GoogleAPI";
import Image from "next/image";

export default function BookDetails({ book }: { book: Volume }) {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/3">
        {book.volumeInfo.imageLinks.medium ? (
          <Image
            src={book.volumeInfo.imageLinks.medium}
            alt={`Cover of ${book.volumeInfo.title}`}
            width={300}
            height={450}
            className="w-full h-auto object-cover rounded-lg shadow-lg"
          />
        ) : (
          <div className="w-full h-[450px] flex items-center justify-center rounded-lg shadow-lg">
            <span className="text-gray-500">No cover image available</span>
          </div>
        )}
      </div>
      <div className="w-full md:w-2/3">
        <h1 className="text-3xl font-bold mb-4">{book.volumeInfo.title}</h1>
        <h2 className="text-xl mb-4">
          by {book.volumeInfo.authors[0] || "Unknown"}
        </h2>
        <p className="mb-6 leading-relaxed">
          {book.volumeInfo.description
            .replaceAll("<p>", "")
            .replaceAll("</p>", "")
            .replaceAll("<br>", "")
            .replaceAll("<br/>", " ")}
        </p>
        {/* Add more book details as needed */}
      </div>
    </div>
  );
}
