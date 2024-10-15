import Image from "next/image";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  cover_image: string;
  // Add any other relevant fields
}

export default function BookDetails({ book }: { book: Book }) {
  console.log(book);
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/3">
        <Image
          src={book.cover_image}
          alt={`Cover of ${book.title}`}
          width={300}
          height={450}
          className="w-full h-auto object-cover rounded-lg shadow-lg"
        />
      </div>
      <div className="w-full md:w-2/3">
        <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
        <h2 className="text-xl text-gray-600 mb-4">by {book.author}</h2>
        <p className="text-gray-800 mb-6">{book.description}</p>
        {/* Add more book details as needed */}
      </div>
    </div>
  );
}
