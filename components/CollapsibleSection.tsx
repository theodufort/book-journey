import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import BookListItem from "./BookListItem";
import { Volume } from "@/interfaces/GoogleAPI";
import { ReadingListItem } from "@/interfaces/ReadingList";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

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
  const [bookTags, setBookTags] = useState<{ [key: string]: string[] }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("title");
  const [newTag, setNewTag] = useState("");
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, [supabase]);

  useEffect(() => {
    if (user) {
      fetchAllTags();
    }
  }, [user, books]);

  if (books.length === 0) return null;

  async function fetchAllTags() {
    for (const book of books) {
      await fetchTags(book);
    }
  }

  async function fetchTags(book: ReadingListItem) {
    if (!user) {
      console.error("User not authenticated");
      return;
    }
    const { data, error } = await supabase
      .from("reading_list")
      .select("tags")
      .eq("user_id", user.id)
      .eq(
        "book_id",
        book.data.volumeInfo.industryIdentifiers?.find((id) => id.type === "ISBN_13")
          ?.identifier
      )
      .maybeSingle();

    if (error) {
      console.error("Error fetching tags:", error);
    } else {
      setBookTags(prevTags => ({
        ...prevTags,
        [book.book_id]: data?.tags || []
      }));
    }
  }

  async function updateTags(book: ReadingListItem, newTags: string[]) {
    if (!user) {
      console.error("User not authenticated");
      return;
    }
    const { error } = await supabase
      .from("reading_list")
      .update({ tags: newTags })
      .eq("user_id", user.id)
      .eq(
        "book_id",
        book.data.volumeInfo.industryIdentifiers?.find((id) => id.type === "ISBN_13")
          ?.identifier
      );

    if (error) {
      console.error("Error updating tags:", error);
    } else {
      setBookTags(prevTags => ({
        ...prevTags,
        [book.book_id]: newTags
      }));
    }
  }

  function handleAddTag(book: ReadingListItem) {
    if (newTag.trim() && !bookTags[book.book_id]?.includes(newTag.trim())) {
      const updatedTags = [...(bookTags[book.book_id] || []), newTag.trim()];
      updateTags(book, updatedTags);
      setNewTag("");
    }
  }

  function handleRemoveTag(book: ReadingListItem, tagToRemove: string) {
    const updatedTags = bookTags[book.book_id]?.filter((tag) => tag !== tagToRemove) || [];
    updateTags(book, updatedTags);
  }

  const filteredBooks = books.filter((item) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    switch (searchType) {
      case "title":
        return item.data.volumeInfo.title.toLowerCase().includes(lowerSearchTerm);
      case "author":
        return item.data.volumeInfo.authors?.some(author => 
          author.toLowerCase().includes(lowerSearchTerm)
        ) || false;
      case "tag":
        const tags = bookTags[item.book_id] || [];
        return tags.some(tag => 
          tag.toLowerCase().includes(lowerSearchTerm)
        );
      default:
        return true;
    }
  });

  console.log("Filtered Books:", filteredBooks);

  return (
    <div
      className={`collapse  ${
        isExpanded ? "collapse-open" : "collapse-close"
      } bg-base-200 mx-0`}
    >
      <div
        className="collapse-title text-xl font-medium flex flex-col md:flex-row items-start md:items-center cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center w-full">
          <div className="mr-2">{title}</div>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0 md:ml-5 w-full md:flex-grow" onClick={(e) => e.stopPropagation()}>
          <label className="input input-bordered flex items-center gap-2 flex-grow">
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
          <select
            className="select select-bordered w-full max-w-xs"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="tag">Tag</option>
          </select>
        </div>
        <div className="ml-auto md:ml-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      <div className="collapse-content sm:px-4">
        <div className="grid grid-cols-1 gap-4">
          {filteredBooks.length > 0 ? (
            filteredBooks.map((item) => (
              <BookListItem
                key={item.book_id}
                status={status}
                item={item.data}
                onUpdate={() => onUpdate(item.book_id, status)}
                tags={bookTags[item.book_id] || []}
                onAddTag={(tag) => handleAddTag(item, tag)}
                onRemoveTag={(tag) => handleRemoveTag(item, tag)}
              />
            ))
          ) : (
            <p className="col-span-full">
              No books found matching your search.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
