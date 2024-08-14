import { useState } from "react";
import { User } from "@supabase/supabase-js";
import BookListItem from "./BookListItem";
import { Volume } from "@/interfaces/GoogleAPI";
import { ReadingListItem } from "@/interfaces/ReadingList";

export default function CollapsibleSection({
  status,
  title,
  isExpanded,
  onToggle,
  books,
  onUpdate,
}: {
  status: string;
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  books: ReadingListItem[];
  onUpdate: (bookId: string, newStatus: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  if (books.length === 0) return null;

  const filteredBooks = books.filter((item) =>
    item.data.volumeInfo.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`collapse ${isExpanded ? 'collapse-open' : 'collapse-close'} bg-base-200`}>
      <div 
        className="collapse-title text-xl font-medium flex flex-col md:flex-row items-start md:items-center cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center w-full md:w-auto">
          <div className="mr-2">{title}</div>
          <div className="ml-auto md:hidden">
            {isExpanded ? '▼' : '▶'}
          </div>
        </div>
        <label 
          className="input input-bordered flex items-center gap-2 mt-4 md:mt-0 md:ml-5 w-full md:w-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            className="grow"
            placeholder="Search for a book..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4 opacity-70"
          >
            <path
              fillRule="evenodd"
              d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
              clipRule="evenodd"
            />
          </svg>
        </label>
      </div>
      <div className="collapse-content">
        <div className="space-y-4">
          {filteredBooks.length > 0 ? (
            filteredBooks.map((item) => (
              <BookListItem
                key={
                  item.data.volumeInfo.industryIdentifiers?.find(
                    (id) => id.type === "ISBN_13"
                  )?.identifier ||
                  item.data.id ||
                  Math.random().toString()
                }
                status={status}
                item={item.data}
                onUpdate={() => onUpdate(item.book_id, status)}
              />
            ))
          ) : (
            <p>No books found matching your search.</p>
          )}
        </div>
      </div>
    </div>
  );
}
