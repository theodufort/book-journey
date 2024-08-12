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
  if (books.length === 0) return null;

  return (
    <div className="collapse collapse-arrow bg-base-200">
      <input
        className="block"
        type="checkbox"
        checked={isExpanded}
        onChange={onToggle}
      />
      <div className="collapse-title text-xl font-medium flex my-auto">
        <div className="my-auto">{title}</div>
        <label className="input input-bordered flex items-center gap-2 ml-5 w-1/2">
          <input
            type="text"
            className="grow"
            placeholder="Search for a book..."
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
          {books.map((item) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}
