import { User } from "@supabase/supabase-js";
import BookListItem from "./BookListItem";
import { BookVolumes, Volume } from "@/interfaces/GoogleAPI";

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
  books: Volume[];
  onUpdate: () => void;
}) {
  if (books.length === 0) return null;

  return (
    <div className="collapse collapse-arrow bg-base-200">
      <input type="checkbox" checked={isExpanded} onChange={onToggle} />
      <div className="collapse-title text-xl font-medium">{title}</div>
      <div className="collapse-content">
        <div className="space-y-4">
          {books.map((item) => (
            <BookListItem
              key={
                item.volumeInfo.industryIdentifiers?.find(
                  (id) => id.type === "ISBN_13"
                )?.identifier || item.id || Math.random().toString()
              }
              status={status}
              item={item}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
