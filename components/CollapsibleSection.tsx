import { ReadingListItem } from "@/interfaces/Dashboard";
import { User } from "@supabase/supabase-js";
import BookListItem from "./BookListItem";

export default function CollapsibleSection({
  title,
  isExpanded,
  onToggle,
  books,
  user,
  onUpdate,
}: {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  books: ReadingListItem[];
  user: User;
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
              key={item.id}
              item={item}
              user={user}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
